/**
 * 09-scrape-flickr-images.js
 *
 * Second-pass image scraper — fills gaps left by the Wikipedia scraper.
 * Reads the missing species from wikipedia-scrape-progress.json,
 * searches Flickr for CC-licensed photos, downloads and uploads them.
 *
 * Environment variables:
 *   SUPABASE_URL         — e.g. https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY — service_role key (bypasses RLS)
 *   FLICKR_API_KEY       — from https://www.flickr.com/services/apps/create/apply/
 *
 * Input:  data/wikipedia-scrape-progress.json (missing + failed species)
 *         data/species-curated.json (for common_name lookup)
 * Output: Images in species-assets/illustrations/ bucket
 *         Rows in species_illustrations table
 *         data/flickr-scrape-progress.json (progress file)
 *
 * Usage: node 09-scrape-flickr-images.js
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import "dotenv/config";

// ── Config ────────────────────────────────────────────────────────────────

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const CURATED_FILE = `${DATA_DIR}species-curated.json`;
const WIKI_PROGRESS_FILE = `${DATA_DIR}wikipedia-scrape-progress.json`;
const PROGRESS_FILE = `${DATA_DIR}flickr-scrape-progress.json`;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const FLICKR_API_KEY = process.env.FLICKR_API_KEY;

const FLICKR_API = "https://api.flickr.com/services/rest/";
const RATE_LIMIT_MS = 500;
const MAX_RETRIES = 3;
const SAVE_INTERVAL = 5;

// Flickr license IDs that allow commercial use:
// 4 = CC-BY 2.0, 5 = CC-BY-SA 2.0, 9 = CC0, 10 = Public Domain Mark
const ALLOWED_LICENSE_IDS = "4,5,9,10";

const LICENSE_NAMES = {
  "4": "CC BY 2.0",
  "5": "CC BY-SA 2.0",
  "9": "CC0 1.0",
  "10": "Public Domain Mark",
};

// ── Helpers ───────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

async function fetchWithRetry(url, opts = {}, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, opts);
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

// ── Flickr API ────────────────────────────────────────────────────────────

/**
 * Search Flickr for a bird species photo with a commercial-use license.
 * Returns { photoUrl, ownerName, license } or null.
 */
async function searchFlickr(searchTerm) {
  const params = new URLSearchParams({
    method: "flickr.photos.search",
    api_key: FLICKR_API_KEY,
    text: searchTerm,
    license: ALLOWED_LICENSE_IDS,
    sort: "relevance",
    per_page: "5",
    extras: "url_z,url_c,url_l,owner_name,license",
    content_type: "1", // photos only
    media: "photos",
    format: "json",
    nojsoncallback: "1",
  });

  const resp = await fetchWithRetry(`${FLICKR_API}?${params}`);
  if (!resp) return null;

  const data = await resp.json();
  if (data.stat !== "ok" || !data.photos?.photo?.length) return null;

  // Pick the first photo that has a usable URL
  // Prefer url_c (800px), fall back to url_z (640px), then url_l (1024px)
  for (const photo of data.photos.photo) {
    const photoUrl = photo.url_c || photo.url_z || photo.url_l;
    if (!photoUrl) continue;

    return {
      photoUrl,
      ownerName: photo.ownername || "Flickr user",
      license: LICENSE_NAMES[photo.license] || `Flickr license ${photo.license}`,
      photoId: photo.id,
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
  if (!FLICKR_API_KEY) {
    console.error("Error: FLICKR_API_KEY is required.");
    console.error("Get one free at https://www.flickr.com/services/apps/create/apply/");
    process.exit(1);
  }

  // Load the Wikipedia progress to get missing + failed species
  if (!existsSync(WIKI_PROGRESS_FILE)) {
    console.error(`Error: ${WIKI_PROGRESS_FILE} not found. Run 08-scrape-wikipedia-images.js first.`);
    process.exit(1);
  }

  const wikiProgress = JSON.parse(readFileSync(WIKI_PROGRESS_FILE, "utf-8"));
  const missingScientificNames = new Set([
    ...wikiProgress.missing,
    ...wikiProgress.failed.map((f) => f.scientific_name),
  ]);

  console.log(`${missingScientificNames.size} species need images from Flickr.\n`);

  // Load curated data for common_name lookup
  const curated = JSON.parse(readFileSync(CURATED_FILE, "utf-8"));
  const commonNameMap = new Map(curated.map((sp) => [sp.scientific_name, sp.common_name]));

  // Load Flickr progress
  const progress = loadProgress();
  const completedCount = Object.keys(progress.completed).length;
  if (completedCount > 0) {
    console.log(`Resuming — ${completedCount} already completed.\n`);
  }

  // Fetch species ID mapping from DB
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

  // Process missing species
  const toProcess = [...missingScientificNames].filter(
    (s) => !progress.completed[s] && !progress.missing.includes(s)
  );

  let processed = 0;
  let newCompleted = 0;
  let newMissing = 0;
  let newFailed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const sciName = toProcess[i];
    const commonName = commonNameMap.get(sciName) || sciName;
    const speciesId = speciesIdMap.get(sciName);

    if (!speciesId) {
      console.log(`  [${i + 1}/${toProcess.length}] SKIP ${commonName} — not in DB`);
      continue;
    }

    try {
      // Search by scientific name first
      let result = await searchFlickr(sciName);
      await sleep(RATE_LIMIT_MS);

      // Fallback: common name + "bird"
      if (!result) {
        result = await searchFlickr(`${commonName} bird`);
        await sleep(RATE_LIMIT_MS);
      }

      if (!result) {
        console.log(`  [${i + 1}/${toProcess.length}] MISSING ${commonName} — no Flickr photo`);
        progress.missing.push(sciName);
        newMissing++;
        processed++;
        if (processed % SAVE_INTERVAL === 0) saveProgress(progress);
        continue;
      }

      // Download image
      const imageResp = await fetchWithRetry(result.photoUrl);
      if (!imageResp) {
        console.log(`  [${i + 1}/${toProcess.length}] FAILED download ${commonName}`);
        progress.failed.push({ scientific_name: sciName, error: "Download failed" });
        newFailed++;
        processed++;
        continue;
      }

      const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
      const ext = result.photoUrl.match(/\.(\w+)(?:\?|$)/)?.[1]?.toLowerCase() || "jpg";
      const contentType = ext === "png" ? "image/png" : "image/jpeg";
      const slug = slugify(sciName);
      const storagePath = `illustrations/${slug}.${ext}`;

      // Upload to Supabase Storage
      await uploadToSupabase(imageBuffer, storagePath, contentType);

      // Build public URL
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/species-assets/${storagePath}`;

      // Attribution: "Photo by {owner}, via Flickr"
      const attribution = `${result.ownerName}, via Flickr`;

      // Upsert into species_illustrations
      await supabaseRequest(
        "species_illustrations?on_conflict=species_id,variant",
        {
          method: "POST",
          body: [
            {
              species_id: speciesId,
              illustration_url: publicUrl,
              variant: "reference",
              source: "flickr",
              license: result.license,
              attribution,
            },
          ],
          prefer: "resolution=merge-duplicates",
        }
      );

      progress.completed[sciName] = {
        illustration_url: publicUrl,
        license: result.license,
        attribution,
        flickr_photo_id: result.photoId,
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

  // Final save
  saveProgress(progress);

  // Summary
  const totalCompleted = Object.keys(progress.completed).length;
  const totalMissing = progress.missing.length;
  const totalFailed = progress.failed.length;
  const wikiCompleted = Object.keys(wikiProgress.completed).length;

  console.log("\n═══════════════════════════════════════");
  console.log("  Flickr Image Scrape Complete");
  console.log("═══════════════════════════════════════");
  console.log(`  Input (missing from Wikipedia): ${missingScientificNames.size}`);
  console.log(`  Flickr completed:  ${totalCompleted}`);
  console.log(`  Still missing:     ${totalMissing}`);
  console.log(`  Failed:            ${totalFailed}`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  Total coverage:    ${wikiCompleted + totalCompleted} / ${curated.length} (${(((wikiCompleted + totalCompleted) / curated.length) * 100).toFixed(1)}%)`);
  console.log("═══════════════════════════════════════");

  if (totalMissing > 0) {
    console.log(`\nStill missing ${totalMissing} species. These may need manual curation.`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
