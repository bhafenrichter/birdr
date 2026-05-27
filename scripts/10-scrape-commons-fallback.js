/**
 * 10-scrape-commons-fallback.js
 *
 * Third-pass image scraper — searches Wikimedia Commons directly for species
 * that Wikipedia and Flickr missed. Commons has a much larger image pool
 * than what shows up as a Wikipedia page image.
 *
 * Environment variables:
 *   SUPABASE_URL         — e.g. https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY — service_role key (bypasses RLS)
 *
 * Input:  data/wikipedia-scrape-progress.json (to find missing species)
 *         data/flickr-scrape-progress.json (optional, to skip flickr-completed)
 *         data/species-curated.json (for common_name lookup)
 * Output: Images in species-assets/illustrations/ bucket
 *         Rows in species_illustrations table
 *         data/commons-scrape-progress.json (progress file)
 *
 * Usage: node 10-scrape-commons-fallback.js
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import "dotenv/config";

// ── Config ────────────────────────────────────────────────────────────────

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const CURATED_FILE = `${DATA_DIR}species-curated.json`;
const WIKI_PROGRESS_FILE = `${DATA_DIR}wikipedia-scrape-progress.json`;
const FLICKR_PROGRESS_FILE = `${DATA_DIR}flickr-scrape-progress.json`;
const PROGRESS_FILE = `${DATA_DIR}commons-scrape-progress.json`;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const RATE_LIMIT_MS = 400;
const MAX_RETRIES = 3;
const SAVE_INTERVAL = 5;
const USER_AGENT = "BirdrBot/1.0 (birdr bird-watching app; hello@hoftware.io)";

const ALLOWED_LICENSES = [
  "cc-by-sa-4.0", "cc-by-sa-3.0", "cc-by-sa-2.5", "cc-by-sa-2.0",
  "cc-by-4.0", "cc-by-3.0", "cc-by-2.5", "cc-by-2.0",
  "cc0", "cc-zero",
  "public domain", "pd", "pd-self", "pd-old", "pd-us", "pd-usgov",
  "pd-author", "pd-ineligible",
];

// ── Helpers ───────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

function isLicenseAllowed(license) {
  const normalized = license.toLowerCase().replace(/\s+/g, "-");
  return ALLOWED_LICENSES.some((allowed) =>
    normalized.includes(allowed) || normalized === allowed
  );
}

async function fetchWithRetry(url, opts = {}, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, {
        ...opts,
        headers: { "User-Agent": USER_AGENT, ...opts.headers },
      });
      if (resp.ok) return resp;
      if (resp.status === 404) return null;
      throw new Error(`HTTP ${resp.status}`);
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1000 * Math.pow(2, attempt));
    }
  }
}

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

  const ct = response.headers.get("content-type");
  if (ct?.includes("application/json")) return response.json();
  return null;
}

// ── Progress ──────────────────────────────────────────────────────────────

function loadProgress() {
  if (existsSync(PROGRESS_FILE)) {
    return JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
  }
  return { completed: {}, missing: [], failed: [] };
}

function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ── Wikimedia Commons API ─────────────────────────────────────────────────

/**
 * Search Wikimedia Commons for a species photo.
 * Searches in File namespace (ns=6), returns the first image with a
 * commercial-use-compatible license.
 */
async function searchCommons(searchTerm) {
  const url = `${COMMONS_API}?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&format=json&formatversion=2`;

  const resp = await fetchWithRetry(url);
  if (!resp) return null;

  const data = await resp.json();
  const pages = data.query?.pages;
  if (!pages || pages.length === 0) return null;

  // Find the first image with an acceptable license
  for (const page of pages) {
    const ii = page.imageinfo?.[0];
    if (!ii) continue;

    const meta = ii.extmetadata || {};
    const license = meta.LicenseShortName?.value || "unknown";

    if (!isLicenseAllowed(license)) continue;

    // Skip SVGs, diagrams, maps (we want photos)
    const title = page.title.toLowerCase();
    if (title.endsWith(".svg") || title.includes("map") || title.includes("range") || title.includes("distribution")) {
      continue;
    }

    const thumbUrl = ii.thumburl;
    if (!thumbUrl) continue;

    const artist = stripHtml(meta.Artist?.value || "");
    const credit = stripHtml(meta.Credit?.value || "");
    const attribution = artist || credit || "Wikimedia Commons";

    return {
      imageUrl: thumbUrl,
      license,
      attribution,
      filename: page.title.replace("File:", ""),
    };
  }

  return null;
}

// ── Supabase Storage ──────────────────────────────────────────────────────

async function uploadToSupabase(imageBuffer, storagePath, contentType) {
  const url = `${SUPABASE_URL}/storage/v1/object/species-assets/${storagePath}`;
  const resp = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: imageBuffer,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Storage upload failed: ${resp.status} ${text}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY are required.");
    process.exit(1);
  }

  if (!existsSync(WIKI_PROGRESS_FILE)) {
    console.error(`Error: ${WIKI_PROGRESS_FILE} not found. Run 08 first.`);
    process.exit(1);
  }

  // Collect all completed species from previous passes
  const wikiProgress = JSON.parse(readFileSync(WIKI_PROGRESS_FILE, "utf-8"));
  const allCompleted = new Set(Object.keys(wikiProgress.completed));

  if (existsSync(FLICKR_PROGRESS_FILE)) {
    const flickrProgress = JSON.parse(readFileSync(FLICKR_PROGRESS_FILE, "utf-8"));
    for (const k of Object.keys(flickrProgress.completed)) allCompleted.add(k);
  }

  // Load curated data
  const curated = JSON.parse(readFileSync(CURATED_FILE, "utf-8"));
  const nameMap = new Map(curated.map((sp) => [sp.scientific_name, sp.common_name]));
  const allSpeciesNames = new Set(curated.map((sp) => sp.scientific_name));

  // Species still needing images
  const stillMissing = [...allSpeciesNames].filter((s) => !allCompleted.has(s));
  console.log(`${stillMissing.length} species still need images. Searching Wikimedia Commons...\n`);

  // Load progress
  const progress = loadProgress();
  const completedCount = Object.keys(progress.completed).length;
  if (completedCount > 0) {
    console.log(`Resuming — ${completedCount} already completed.\n`);
  }

  // Fetch species ID mapping
  console.log("Fetching species ID mapping...");
  const allSpecies = [];
  let offset = 0;
  const PAGE = 500;
  while (true) {
    const page = await supabaseRequest(
      `species?select=id,scientific_name&offset=${offset}&limit=${PAGE}`
    );
    allSpecies.push(...page);
    if (page.length < PAGE) break;
    offset += PAGE;
  }
  const speciesIdMap = new Map(allSpecies.map((sp) => [sp.scientific_name, sp.id]));
  console.log(`  Fetched ${allSpecies.length} species IDs.\n`);

  // Process
  let processed = 0;
  let newCompleted = 0;
  let newMissing = 0;
  let newFailed = 0;

  const toProcess = stillMissing.filter(
    (s) => !progress.completed[s] && !progress.missing.includes(s)
  );

  for (let i = 0; i < toProcess.length; i++) {
    const sciName = toProcess[i];
    const commonName = nameMap.get(sciName) || sciName;
    const speciesId = speciesIdMap.get(sciName);

    if (!speciesId) {
      console.log(`  [${i + 1}/${toProcess.length}] SKIP ${commonName} — not in DB`);
      continue;
    }

    try {
      // Search by scientific name
      let result = await searchCommons(sciName);
      await sleep(RATE_LIMIT_MS);

      // Fallback: common name
      if (!result) {
        result = await searchCommons(commonName);
        await sleep(RATE_LIMIT_MS);
      }

      // Fallback: common name + "bird"
      if (!result) {
        result = await searchCommons(`${commonName} bird`);
        await sleep(RATE_LIMIT_MS);
      }

      if (!result) {
        console.log(`  [${i + 1}/${toProcess.length}] MISSING ${commonName}`);
        progress.missing.push(sciName);
        newMissing++;
        processed++;
        if (processed % SAVE_INTERVAL === 0) saveProgress(progress);
        continue;
      }

      // Download
      const imageResp = await fetchWithRetry(result.imageUrl);
      if (!imageResp) {
        progress.failed.push({ scientific_name: sciName, error: "Download failed" });
        newFailed++;
        processed++;
        continue;
      }

      const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
      const ext = result.imageUrl.match(/\.(\w+)(?:\?|$)/)?.[1]?.toLowerCase() || "jpg";
      const contentType = ext === "png" ? "image/png" : "image/jpeg";
      const slug = slugify(sciName);
      const storagePath = `illustrations/${slug}.${ext}`;

      // Upload
      await uploadToSupabase(imageBuffer, storagePath, contentType);

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/species-assets/${storagePath}`;

      // Upsert DB
      await supabaseRequest(
        "species_illustrations?on_conflict=species_id,variant",
        {
          method: "POST",
          body: [
            {
              species_id: speciesId,
              illustration_url: publicUrl,
              variant: "reference",
              source: "commons",
              license: result.license,
              attribution: result.attribution,
            },
          ],
          prefer: "resolution=merge-duplicates",
        }
      );

      progress.completed[sciName] = {
        illustration_url: publicUrl,
        license: result.license,
        attribution: result.attribution,
        filename: result.filename,
      };
      newCompleted++;

      console.log(`  [${i + 1}/${toProcess.length}] OK ${commonName} — ${result.license}`);
    } catch (err) {
      console.error(`  [${i + 1}/${toProcess.length}] ERROR ${commonName}: ${err.message}`);
      progress.failed.push({ scientific_name: sciName, error: err.message });
      newFailed++;
    }

    processed++;
    if (processed % SAVE_INTERVAL === 0) saveProgress(progress);
    await sleep(RATE_LIMIT_MS);
  }

  saveProgress(progress);

  // Summary
  const totalCompleted = Object.keys(progress.completed).length;
  const totalMissing = progress.missing.length;
  const totalFailed = progress.failed.length;
  const grandTotal = allCompleted.size + totalCompleted;

  console.log("\n═══════════════════════════════════════");
  console.log("  Wikimedia Commons Fallback Complete");
  console.log("═══════════════════════════════════════");
  console.log(`  Input (still missing):  ${stillMissing.length}`);
  console.log(`  Commons completed:      ${totalCompleted}`);
  console.log(`  Still missing:          ${totalMissing}`);
  console.log(`  Failed:                 ${totalFailed}`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Total coverage:         ${grandTotal} / ${curated.length} (${((grandTotal / curated.length) * 100).toFixed(1)}%)`);
  console.log("═══════════════════════════════════════");

  if (totalMissing > 0) {
    console.log(`\n${totalMissing} species have no free-licensed photo available anywhere.`);
    console.log("These are likely extinct species or extremely rare Hawaiian endemics.");
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
