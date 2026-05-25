/**
 * 07-seed-database.js
 *
 * Seeds the Supabase database with curated species data.
 * Inserts species_types, habitats, species, and species_regions.
 *
 * Requires a running Supabase instance (local or remote).
 *
 * Environment variables:
 *   SUPABASE_URL       — e.g. http://127.0.0.1:54321 or https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY — service_role key (bypasses RLS)
 *
 * Input:  data/species-curated.json (from step 06)
 *         data/species-regions-parsed.json (from step 04, optional)
 * Output: Database rows in species, species_regions tables
 *
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node 07-seed-database.js
 */

import { readFileSync, existsSync } from "node:fs";
import "dotenv/config";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const CURATED_FILE = `${DATA_DIR}species-curated.json`;
const REGIONS_FILE = `${DATA_DIR}species-regions-parsed.json`;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const BATCH_SIZE = 100;

async function supabaseRequest(path, { method = "GET", body, prefer } = {}) {
  const headers = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase ${method} ${path}: ${response.status} ${text}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return null;
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY are required.");
    console.error("For local dev: SUPABASE_URL=http://127.0.0.1:54321 SUPABASE_SERVICE_KEY=<from supabase status>");
    process.exit(1);
  }

  if (!existsSync(CURATED_FILE)) {
    console.error(`Error: ${CURATED_FILE} not found.`);
    console.error("Run steps 01-06 first to build the curated species data.");
    process.exit(1);
  }

  const curated = JSON.parse(readFileSync(CURATED_FILE, "utf-8"));
  console.log(`Seeding ${curated.length} species...`);

  // 1. Fetch species_types and habitats (already seeded by migration seed.sql)
  console.log("\nFetching lookup tables...");
  const types = await supabaseRequest("species_types?select=id,slug");
  const habitats = await supabaseRequest("habitats?select=id,slug");

  const typeMap = new Map(types.map((t) => [t.slug, t.id]));
  const habitatMap = new Map(habitats.map((h) => [h.slug, h.id]));

  console.log(`  Species types: ${typeMap.size}`);
  console.log(`  Habitats: ${habitatMap.size}`);

  // 2. Insert species in batches
  console.log("\nInserting species...");
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < curated.length; i += BATCH_SIZE) {
    const batch = curated.slice(i, i + BATCH_SIZE);
    const rows = [];

    for (const sp of batch) {
      const typeId = typeMap.get(sp.species_type_slug);
      const habitatId = habitatMap.get(sp.primary_habitat_slug);

      if (!typeId) {
        console.warn(`  Missing type slug: ${sp.species_type_slug} for ${sp.common_name}`);
        skipped++;
        continue;
      }
      if (!habitatId) {
        console.warn(`  Missing habitat slug: ${sp.primary_habitat_slug} for ${sp.common_name}`);
        skipped++;
        continue;
      }

      rows.push({
        common_name: sp.common_name,
        scientific_name: sp.scientific_name,
        family: sp.family || null,
        taxonomic_order: sp.taxonomic_order || null,
        species_type_id: typeId,
        primary_habitat_id: habitatId,
        conservation_status: sp.conservation_status || "LC",
        size: sp.size || null,
        about_text: sp.about_text || null,
        distinguishing_feature: sp.distinguishing_feature || null,
      });
    }

    if (rows.length > 0) {
      await supabaseRequest("species", {
        method: "POST",
        body: rows,
        prefer: "resolution=merge-duplicates",
      });
      inserted += rows.length;
    }

    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${rows.length} inserted`);
  }

  console.log(`\nSpecies: ${inserted} inserted, ${skipped} skipped`);

  // 3. Insert species_regions if available
  if (existsSync(REGIONS_FILE)) {
    console.log("\nSeeding species_regions...");
    const regions = JSON.parse(readFileSync(REGIONS_FILE, "utf-8"));

    // Need to map common_name → species.id and season from curated data
    const allSpecies = await supabaseRequest("species?select=id,common_name,scientific_name");
    const speciesIdMap = new Map(allSpecies.map((sp) => [sp.common_name.toLowerCase(), sp.id]));
    const sciNameToId = new Map(allSpecies.map((sp) => [sp.scientific_name, sp.id]));

    // Build season lookup from curated data (LLM-derived)
    const seasonMap = new Map(curated.map((sp) => [sp.scientific_name, sp.season || "year_round"]));

    let regionInserted = 0;
    let regionSkipped = 0;

    for (let i = 0; i < regions.length; i += BATCH_SIZE) {
      const batch = regions.slice(i, i + BATCH_SIZE);
      const rows = [];

      for (const r of batch) {
        // Try scientific_name first, fall back to common_name
        const speciesId = (r.scientific_name && sciNameToId.get(r.scientific_name))
          || speciesIdMap.get(r.common_name.toLowerCase());
        if (!speciesId) {
          regionSkipped++;
          continue;
        }
        // Use LLM-derived season if available, otherwise use region file's season
        const season = (r.scientific_name && seasonMap.get(r.scientific_name)) || r.season || "year_round";
        rows.push({
          species_id: speciesId,
          state_code: r.state_code,
          season,
          peak_frequency: r.peak_frequency || null,
        });
      }

      if (rows.length > 0) {
        await supabaseRequest("species_regions", {
          method: "POST",
          body: rows,
          prefer: "resolution=merge-duplicates",
        });
        regionInserted += rows.length;
      }

      if ((i + BATCH_SIZE) % 1000 < BATCH_SIZE) {
        console.log(`  Progress: ${Math.min(i + BATCH_SIZE, regions.length)}/${regions.length}`);
      }
    }

    console.log(`\nRegions: ${regionInserted} inserted, ${regionSkipped} skipped`);
  }

  console.log("\nDone! Database seeded successfully.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
