/**
 * 08-scrape-wikipedia-images.js
 *
 * Scrapes reference photos from Wikipedia for each bird species and uploads
 * them to Supabase Storage. Inserts records into species_illustrations with
 * license and attribution metadata.
 *
 * Supports resume — saves progress to data/wikipedia-scrape-progress.json.
 *
 * Environment variables:
 *   SUPABASE_URL        — e.g. https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY — service_role key (bypasses RLS)
 *
 * Input:  data/species-curated.json
 * Output: Images in species-assets/illustrations/ bucket
 *         Rows in species_illustrations table
 *         data/wikipedia-scrape-progress.json (progress file)
 *
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node 08-scrape-wikipedia-images.js
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import "dotenv/config";

// ── Config ────────────────────────────────────────────────────────────────

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const CURATED_FILE = `${DATA_DIR}species-curated.json`;
const PROGRESS_FILE = `${DATA_DIR}wikipedia-scrape-progress.json`;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const THUMB_WIDTH = 800;
const RATE_LIMIT_MS = 300;
const MAX_RETRIES = 3;
const SAVE_INTERVAL = 10;
const USER_AGENT = "BirdrBot/1.0 (birdr bird-watching app; hello@hoftware.io)";

const WIKI_API = "https://en.wikipedia.org/w/api.php";

// Licenses we accept for commercial use
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

/**
 * Extract the original filename from a Wikimedia thumbnail URL.
 * e.g. ".../thumb/9/9d/Struthio_camelus.jpg/800px-Struthio_camelus.jpg" → "Struthio_camelus.jpg"
 */
function filenameFromThumbUrl(url) {
  const match = url.match(/\/thumb\/[^/]+\/[^/]+\/([^/]+)\/\d+px-/);
  if (match) return decodeURIComponent(match[1]);
  // Non-thumb URL: just take the last segment
  const segments = url.split("/");
  return decodeURIComponent(segments[segments.length - 1].split("?")[0]);
}

function detectExtension(url) {
  const match = url.match(/\.(\w+)(?:\?|$)/);
  if (!match) return "jpg";
  const ext = match[1].toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "svg"].includes(ext)) return ext;
  return "jpg";
}

function detectContentType(ext) {
  const map = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", svg: "image/svg+xml" };
  return map[ext] || "image/jpeg";
}

async function fetchWithRetry(url, opts = {}, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, { ...opts, headers: { "User-Agent": USER_AGENT, ...opts.headers } });
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

// ── Wikipedia API ─────────────────────────────────────────────────────────

/**
 * Get the main page image for a Wikipedia article.
 * Returns { imageUrl, filename, pageTitle } or null.
 */
async function getWikipediaImage(searchTerm) {
  // Try exact title match first
  const url = `${WIKI_API}?action=query&titles=${encodeURIComponent(searchTerm)}&prop=pageimages&piprop=thumbnail|name&pithumbsize=${THUMB_WIDTH}&redirects=1&format=json&formatversion=2`;
  const resp = await fetchWithRetry(url);
  if (!resp) return null;

  const data = await resp.json();
  const page = data.query?.pages?.[0];

  if (page && !page.missing && page.thumbnail?.source) {
    return {
      imageUrl: page.thumbnail.source,
      filename: page.pageimage || filenameFromThumbUrl(page.thumbnail.source),
      pageTitle: page.title,
    };
  }

  return null;
}

/**
 * Search Wikipedia and get the page image from the top result.
 * Used as a last-resort fallback.
 */
async function searchWikipediaImage(searchTerm) {
  const url = `${WIKI_API}?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm + " bird")}&gsrlimit=1&prop=pageimages&piprop=thumbnail|name&pithumbsize=${THUMB_WIDTH}&format=json&formatversion=2`;
  const resp = await fetchWithRetry(url);
  if (!resp) return null;

  const data = await resp.json();
  const pages = data.query?.pages;
  if (!pages || pages.length === 0) return null;

  const page = pages[0];
  if (page.thumbnail?.source) {
    return {
      imageUrl: page.thumbnail.source,
      filename: page.pageimage || filenameFromThumbUrl(page.thumbnail.source),
      pageTitle: page.title,
    };
  }

  return null;
}

/**
 * Get license and attribution for a Wikipedia/Commons image file.
 * Queries Wikimedia Commons (not English Wikipedia) since that's where
 * the image metadata actually lives.
 */
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

async function getImageLicense(filename) {
  // Try Commons first — this is where most Wikipedia images are hosted
  const commonsUrl = `${COMMONS_API}?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=extmetadata&format=json&formatversion=2`;
  let resp = await fetchWithRetry(commonsUrl);

  if (resp) {
    const data = await resp.json();
    const page = data.query?.pages?.[0];
    const meta = page?.imageinfo?.[0]?.extmetadata;

    if (meta) {
      const license = meta.LicenseShortName?.value || meta.License?.value || "unknown";
      const artist = stripHtml(meta.Artist?.value || "");
      const credit = stripHtml(meta.Credit?.value || "");
      const attribution = artist || credit || "Wikimedia Commons";
      return { license, attribution };
    }
  }

  // Fallback to English Wikipedia for locally-hosted images
  const wikiUrl = `${WIKI_API}?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=extmetadata&format=json&formatversion=2`;
  resp = await fetchWithRetry(wikiUrl);
  if (!resp) return { license: "unknown", attribution: "" };

  const data = await resp.json();
  const page = data.query?.pages?.[0];
  const meta = page?.imageinfo?.[0]?.extmetadata;

  if (!meta) return { license: "unknown", attribution: "" };

  const license = meta.LicenseShortName?.value || meta.License?.value || "unknown";
  const artist = stripHtml(meta.Artist?.value || "");
  const credit = stripHtml(meta.Credit?.value || "");
  const attribution = artist || credit || "Wikimedia Commons";

  return { license, attribution };
}

/**
 * Check if a license string is in our allowed list.
 */
function isLicenseAllowed(license) {
  const normalized = license.toLowerCase().replace(/\s+/g, "-");
  return ALLOWED_LICENSES.some((allowed) =>
    normalized.includes(allowed) || normalized === allowed
  );
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

  if (!existsSync(CURATED_FILE)) {
    console.error(`Error: ${CURATED_FILE} not found. Run steps 01-06 first.`);
    process.exit(1);
  }

  const curated = JSON.parse(readFileSync(CURATED_FILE, "utf-8"));
  console.log(`Loaded ${curated.length} species from curated data.\n`);

  // Load progress
  const progress = loadProgress();
  const completedCount = Object.keys(progress.completed).length;
  if (completedCount > 0) {
    console.log(`Resuming — ${completedCount} already completed, ${progress.missing.length} missing, ${progress.failed.length} failed.\n`);
  }

  // Fetch species ID mapping from DB
  console.log("Fetching species ID mapping from database...");
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
  console.log(`  Fetched ${allSpecies.length} species IDs.\n`);

  const speciesIdMap = new Map(allSpecies.map((sp) => [sp.scientific_name, sp.id]));

  // Process each species
  let processed = 0;
  let newCompleted = 0;
  let newMissing = 0;
  let newFailed = 0;
  let skippedNoLicense = 0;

  for (let i = 0; i < curated.length; i++) {
    const sp = curated[i];
    const sciName = sp.scientific_name;

    // Skip if already processed
    if (progress.completed[sciName] || progress.missing.includes(sciName)) {
      continue;
    }

    const speciesId = speciesIdMap.get(sciName);
    if (!speciesId) {
      console.log(`  [${i + 1}/${curated.length}] SKIP ${sp.common_name} — not in DB`);
      continue;
    }

    try {
      // 1. Query Wikipedia for page image
      let result = await getWikipediaImage(sciName);
      await sleep(RATE_LIMIT_MS);

      // 2. Fallback: common name
      if (!result) {
        result = await getWikipediaImage(sp.common_name);
        await sleep(RATE_LIMIT_MS);
      }

      // 3. Fallback: search
      if (!result) {
        result = await searchWikipediaImage(sp.common_name);
        await sleep(RATE_LIMIT_MS);
      }

      if (!result) {
        console.log(`  [${i + 1}/${curated.length}] MISSING ${sp.common_name} — no Wikipedia image`);
        progress.missing.push(sciName);
        newMissing++;
        processed++;
        if (processed % SAVE_INTERVAL === 0) saveProgress(progress);
        continue;
      }

      // 4. Check license
      const { license, attribution } = await getImageLicense(result.filename);
      await sleep(RATE_LIMIT_MS);

      if (!isLicenseAllowed(license)) {
        console.log(`  [${i + 1}/${curated.length}] SKIP LICENSE ${sp.common_name} — ${license}`);
        progress.missing.push(sciName);
        skippedNoLicense++;
        newMissing++;
        processed++;
        if (processed % SAVE_INTERVAL === 0) saveProgress(progress);
        continue;
      }

      // 5. Download image
      const imageResp = await fetchWithRetry(result.imageUrl);
      if (!imageResp) {
        console.log(`  [${i + 1}/${curated.length}] FAILED download ${sp.common_name}`);
        progress.failed.push({ scientific_name: sciName, error: "Download failed" });
        newFailed++;
        processed++;
        continue;
      }

      const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
      const ext = detectExtension(result.imageUrl);
      const contentType = detectContentType(ext);
      const slug = slugify(sciName);
      const storagePath = `illustrations/${slug}.${ext}`;

      // 6. Upload to Supabase Storage
      await uploadToSupabase(imageBuffer, storagePath, contentType);

      // 7. Build public URL
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/species-assets/${storagePath}`;

      // 8. Upsert into species_illustrations
      await supabaseRequest(
        "species_illustrations?on_conflict=species_id,variant",
        {
          method: "POST",
          body: [
            {
              species_id: speciesId,
              illustration_url: publicUrl,
              variant: "reference",
              source: "wikipedia",
              license,
              attribution,
            },
          ],
          prefer: "resolution=merge-duplicates",
        }
      );

      // 9. Record progress
      progress.completed[sciName] = {
        illustration_url: publicUrl,
        license,
        attribution,
        wikipedia_filename: result.filename,
      };
      newCompleted++;

      console.log(`  [${i + 1}/${curated.length}] OK ${sp.common_name} — ${license}`);
    } catch (err) {
      console.error(`  [${i + 1}/${curated.length}] ERROR ${sp.common_name}: ${err.message}`);
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

  console.log("\n═══════════════════════════════════════");
  console.log("  Wikipedia Image Scrape Complete");
  console.log("═══════════════════════════════════════");
  console.log(`  Total species:     ${curated.length}`);
  console.log(`  Completed:         ${totalCompleted}`);
  console.log(`  Missing (no image):${totalMissing}`);
  console.log(`  Failed (errors):   ${totalFailed}`);
  console.log(`  Skipped (license): ${skippedNoLicense}`);
  console.log(`  Coverage:          ${((totalCompleted / curated.length) * 100).toFixed(1)}%`);
  console.log("═══════════════════════════════════════");

  if (totalMissing > 0) {
    console.log(`\nMissing species saved to ${PROGRESS_FILE}`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
