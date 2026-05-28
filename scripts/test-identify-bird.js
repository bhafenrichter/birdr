#!/usr/bin/env node

/**
 * Integration test: Run species illustrations through identify-bird
 * and verify GPT-4o can correctly identify each species.
 *
 * Usage:
 *   node scripts/test-identify-bird.js                    # default: 355 species (25%)
 *   node scripts/test-identify-bird.js --limit 5          # smoke test
 *   node scripts/test-identify-bird.js --limit 355        # quarter run
 *   node scripts/test-identify-bird.js --offset 100       # skip first 100
 *   node scripts/test-identify-bird.js --species "American Robin"  # single species
 *
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_KEY in scripts/.env or environment
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const MAX_RETRIES = 3;
const DEFAULT_LIMIT = 355; // 25% of ~1421

// ── Parse CLI args ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
}

const limit = parseInt(getArg("limit") ?? String(DEFAULT_LIMIT), 10);
const offset = parseInt(getArg("offset") ?? "0", 10);
const singleSpecies = getArg("species");
const detailLevel = getArg("detail") ?? "low";
const forceLowDetail = detailLevel === "low";
const DELAY_MS = detailLevel === "high" ? 1500 : 500;

// ── Helpers ───────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchImageAsBase64(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

async function callIdentifyBird(base64, mimeType = "image/jpeg") {
  const url = `${SUPABASE_URL}/functions/v1/identify-bird`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        apikey: SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image_base64: base64,
        image_type: mimeType,
        forceLowDetail,
      }),
    });

    if (res.status === 429) {
      const backoff = Math.pow(2, attempt) * 1000;
      console.log(`  ⏳ Rate limited, waiting ${backoff}ms...`);
      await sleep(backoff);
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      return { error: true, status: res.status, message: text };
    }

    return await res.json();
  }

  return { error: true, status: 429, message: "Max retries exceeded" };
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🐦 Identify-Bird Integration Test");
  console.log("═".repeat(50));
  console.log(`  Detail:  ${detailLevel}`);
  console.log(`  Limit:   ${limit}`);
  console.log(`  Offset:  ${offset}`);
  if (singleSpecies) console.log(`  Species: ${singleSpecies}`);
  console.log("");

  // Fetch species with illustrations
  let query = supabase
    .from("species")
    .select("id, common_name, scientific_name, species_illustrations(illustration_url)")
    .order("common_name");

  if (singleSpecies) {
    query = query.ilike("common_name", singleSpecies);
  } else {
    query = query.range(offset, offset + limit - 1);
  }

  const { data: species, error } = await query;

  if (error) {
    console.error("Failed to fetch species:", error.message);
    process.exit(1);
  }

  const testSpecies = species.filter(
    (s) => s.species_illustrations?.length > 0
  );

  console.log(`  Found ${testSpecies.length} species with illustrations\n`);

  const results = [];
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < testSpecies.length; i++) {
    const sp = testSpecies[i];
    const illustrationUrl = sp.species_illustrations[0].illustration_url;
    const progress = `[${i + 1}/${testSpecies.length}]`;

    process.stdout.write(`${progress} ${sp.common_name}... `);

    // Download illustration
    const base64 = await fetchImageAsBase64(illustrationUrl);
    if (!base64) {
      console.log("⚠️  missing_image");
      results.push({
        species_id: sp.id,
        common_name: sp.common_name,
        scientific_name: sp.scientific_name,
        illustration_url: illustrationUrl,
        status: "missing_image",
      });
      skipped++;
      continue;
    }

    // Determine mime type from URL
    const mimeType = illustrationUrl.endsWith(".png")
      ? "image/png"
      : "image/jpeg";

    // Call identify-bird
    const response = await callIdentifyBird(base64, mimeType);

    if (response.error) {
      console.log(`❌ api_error (${response.status})`);
      results.push({
        species_id: sp.id,
        common_name: sp.common_name,
        scientific_name: sp.scientific_name,
        illustration_url: illustrationUrl,
        status: "api_error",
        error_status: response.status,
        error_message: response.message?.slice(0, 200),
      });
      failed++;
      await sleep(DELAY_MS);
      continue;
    }

    const candidates = response.candidates || [];

    if (candidates.length === 0) {
      console.log("❌ no_candidates");
      results.push({
        species_id: sp.id,
        common_name: sp.common_name,
        scientific_name: sp.scientific_name,
        illustration_url: illustrationUrl,
        status: "no_candidates",
        photo_quality: response.photo_quality,
        is_screen_photo: response.is_screen_photo,
      });
      failed++;
      await sleep(DELAY_MS);
      continue;
    }

    // Check if correct species is in candidates
    const match = candidates.find((c) => c.species_id === sp.id);
    const topCandidate = candidates[0];

    if (!match) {
      console.log(
        `❌ wrong_species (got: ${topCandidate.common_name} @ ${topCandidate.confidence})`
      );
      results.push({
        species_id: sp.id,
        common_name: sp.common_name,
        scientific_name: sp.scientific_name,
        illustration_url: illustrationUrl,
        status: "wrong_species",
        expected: sp.common_name,
        got: topCandidate.common_name,
        got_confidence: topCandidate.confidence,
        photo_quality: response.photo_quality,
        is_screen_photo: response.is_screen_photo,
        all_candidates: candidates.map((c) => ({
          name: c.common_name,
          confidence: c.confidence,
          species_id: c.species_id,
        })),
      });
      failed++;
    } else if (match.confidence < 0.85) {
      console.log(
        `⚠️  low_confidence (${match.confidence.toFixed(2)}, top: ${topCandidate.common_name} @ ${topCandidate.confidence})`
      );
      results.push({
        species_id: sp.id,
        common_name: sp.common_name,
        scientific_name: sp.scientific_name,
        illustration_url: illustrationUrl,
        status: "low_confidence",
        confidence: match.confidence,
        top_candidate: topCandidate.common_name,
        top_confidence: topCandidate.confidence,
        photo_quality: response.photo_quality,
        is_screen_photo: response.is_screen_photo,
      });
      failed++;
    } else {
      console.log(`✅ pass (${match.confidence.toFixed(2)})`);
      results.push({
        species_id: sp.id,
        common_name: sp.common_name,
        scientific_name: sp.scientific_name,
        illustration_url: illustrationUrl,
        status: "pass",
        confidence: match.confidence,
        photo_quality: response.photo_quality,
        is_screen_photo: response.is_screen_photo,
      });
      passed++;
    }

    await sleep(DELAY_MS);
  }

  // ── Summary ─────────────────────────────────────────────────────────────

  const total = testSpecies.length;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";

  console.log("\n" + "═".repeat(50));
  console.log("📊 Results Summary");
  console.log("═".repeat(50));
  console.log(`  Total:    ${total}`);
  console.log(`  Passed:   ${passed} ✅`);
  console.log(`  Failed:   ${failed} ❌`);
  console.log(`  Skipped:  ${skipped} ⚠️`);
  console.log(`  Pass Rate: ${passRate}%`);

  // Show failures
  const failures = results.filter(
    (r) => r.status !== "pass" && r.status !== "missing_image"
  );
  if (failures.length > 0) {
    console.log(`\n❌ Failures (${failures.length}):`);
    for (const f of failures) {
      if (f.status === "wrong_species") {
        console.log(
          `  • ${f.common_name} → got "${f.got}" (${f.got_confidence})`
        );
      } else if (f.status === "low_confidence") {
        console.log(
          `  • ${f.common_name} → confidence ${f.confidence} (need 0.85)`
        );
      } else if (f.status === "no_candidates") {
        console.log(`  • ${f.common_name} → no candidates returned`);
      } else if (f.status === "api_error") {
        console.log(
          `  • ${f.common_name} → API error ${f.error_status}`
        );
      }
    }
  }

  // Write results file
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputPath = resolve(__dirname, "test-results", `identify-bird-${detailLevel}-${timestamp}.json`);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        config: { detail: detailLevel, limit, offset },
        total,
        passed,
        failed,
        skipped,
        pass_rate: `${passRate}%`,
        results,
        failures,
      },
      null,
      2
    )
  );
  console.log(`\n📁 Results saved to ${outputPath}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
