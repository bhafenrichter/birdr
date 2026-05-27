/**
 * 11-rescrape-portrait-images.js
 *
 * Re-scrapes Wikimedia Commons for landscape alternatives to portrait images.
 * Searches for multiple candidates per species and picks the best landscape one.
 *
 * Environment variables:
 *   SUPABASE_URL         — e.g. https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY — service_role key (bypasses RLS)
 *
 * Input:  List of scientific names (hardcoded or from args)
 * Output: Replaces images in species-assets/illustrations/ bucket
 *         Updates species_illustrations rows
 *
 * Usage: node 11-rescrape-portrait-images.js
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import "dotenv/config";

// ── Config ────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const RATE_LIMIT_MS = 400;
const MAX_RETRIES = 3;
const USER_AGENT = "BirdrBot/1.0 (birdr bird-watching app; hello@hoftware.io)";
const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const PROGRESS_FILE = `${DATA_DIR}portrait-rescrape-progress.json`;

const ALLOWED_LICENSES = [
  "cc-by-sa-4.0", "cc-by-sa-3.0", "cc-by-sa-2.5", "cc-by-sa-2.0",
  "cc-by-4.0", "cc-by-3.0", "cc-by-2.5", "cc-by-2.0",
  "cc0", "cc-zero",
  "public domain", "pd", "pd-self", "pd-old", "pd-us", "pd-usgov",
  "pd-author", "pd-ineligible",
];

// Species with portrait images (ratio >= 1.50)
const PORTRAIT_SPECIES = `Toxostoma cinereum
Porphyrio flavirostris
Ara chloropterus
Cacatua galerita
Astur gentilis
Thalassarche chlororhynchos
Lampornis clemenciae
Myiarchus nuttingi
Tyrannus dominicensis
Patagioenas squamosa
Buteo platypterus
Amazona autumnalis
Polytelis anthopeplus
Egretta tricolor
Circus hudsonius
Cyanocorax yucatanicus
Cyanocitta stelleri
Dendrocygna viduata
Pavo cristatus
Columbina inca
Crotophaga sulcirostris
Coccyzus erythropthalmus
Basilinna leucotis
Saucerottia beryllina
Grus virgo
Phoebastria nigripes
Ephippiorhynchus asiaticus
Nannopterum brasilianum
Eudocimus ruber
Botaurus stellaris
Nyctanassa violacea
Egretta gularis
Cathartes aura
Milvus migrans
Rostrhamus sociabilis
Parabuteo unicinctus
Geranoaetus albicaudatus
Buteo solitarius
Megascops asio
Glaucidium brasilianum
Asio otus
Upupa epops
Bycanistes bucinator
Dacelo novaeguineae
Sphyrapicus thyroideus
Melanerpes lewis
Melanerpes uropygialis
Picoides arcticus
Dryobates scalaris
Leuconotopicus arizonae
Nymphicus hollandicus
Cacatua moluccensis
Psittacula eupatria
Amazona pretrei
Amazona finschi
Aratinga solstitialis
Guaruba guarouba
Vermivora bachmanii
Leiothlypis luciae
Mitrephanes phaeocercus
Sayornis nigricans
Aphelocoma woodhouseii
Progne subis
Certhia americana
Foudia madagascariensis
Vidua macroura
Vidua paradisaea
Icterus cayanensis
Icterus pustulatus
Agelaius phoeniceus
Spizella wortheni
Sporophila morelleti
Melanerpes aurifrons`.split("\n").map(s => s.trim()).filter(Boolean);

// ── Helpers ───────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
}

function isLicenseAllowed(license) {
  const normalized = license.toLowerCase().replace(/\s+/g, "-");
  return ALLOWED_LICENSES.some((a) => normalized.includes(a) || normalized === a);
}

async function fetchWithRetry(url, opts = {}, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const resp = await fetch(url, { ...opts, headers: { "User-Agent": USER_AGENT, ...opts.headers } });
      if (resp.ok || resp.status === 206) return resp;
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

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase ${method} ${path}: ${response.status} ${text}`);
  }
  const ct = response.headers.get("content-type");
  if (ct?.includes("application/json")) return response.json();
  return null;
}

// ── Image dimension check ─────────────────────────────────────────────────

function readJpegDimensions(buf) {
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let pos = 2;
  while (pos < buf.length - 8) {
    if (buf[pos] !== 0xFF) { pos++; continue; }
    const marker = buf[pos + 1];
    if (marker === 0xC0 || marker === 0xC2) {
      return { height: buf.readUInt16BE(pos + 5), width: buf.readUInt16BE(pos + 7) };
    }
    const len = buf.readUInt16BE(pos + 2);
    pos += 2 + len;
  }
  return null;
}

function readPngDimensions(buf) {
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function readDimensions(buf) {
  return readJpegDimensions(buf) || readPngDimensions(buf);
}

// ── Commons search for landscape images ───────────────────────────────────

async function findLandscapeImage(searchTerm) {
  // Search Commons with more results to find a landscape one
  const url = `${COMMONS_API}?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=800&format=json&formatversion=2`;

  const resp = await fetchWithRetry(url);
  if (!resp) return null;

  const data = await resp.json();
  const pages = data.query?.pages;
  if (!pages || pages.length === 0) return null;

  for (const page of pages) {
    const ii = page.imageinfo?.[0];
    if (!ii) continue;

    const meta = ii.extmetadata || {};
    const license = meta.LicenseShortName?.value || "unknown";
    const title = page.title.toLowerCase();

    // Skip non-photos
    if (title.endsWith(".svg") || title.includes("map") || title.includes("range") || title.includes("distribution") || title.includes("logo")) continue;

    // Check license
    if (!isLicenseAllowed(license)) continue;

    // Check dimensions — we want landscape (width > height)
    const imgWidth = ii.thumbwidth || ii.width || 0;
    const imgHeight = ii.thumbheight || ii.height || 0;

    if (imgWidth <= 0 || imgHeight <= 0) continue;
    if (imgHeight > imgWidth) continue; // Still portrait, skip

    const thumbUrl = ii.thumburl || ii.url;
    if (!thumbUrl) continue;

    const artist = stripHtml(meta.Artist?.value || "");
    const credit = stripHtml(meta.Credit?.value || "");
    const attribution = artist || credit || "Wikimedia Commons";

    return {
      imageUrl: thumbUrl,
      license: meta.LicenseShortName?.value,
      attribution,
      filename: page.title.replace("File:", ""),
      width: imgWidth,
      height: imgHeight,
    };
  }

  return null;
}

// ── Progress ──────────────────────────────────────────────────────────────

function loadProgress() {
  if (existsSync(PROGRESS_FILE)) return JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
  return { replaced: {}, noLandscape: [], failed: [] };
}

function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY required.");
    process.exit(1);
  }

  console.log(`Re-scraping ${PORTRAIT_SPECIES.length} portrait species for landscape alternatives...\n`);

  const progress = loadProgress();

  // Get species IDs
  console.log("Fetching species ID mapping...");
  const allSpecies = [];
  let offset = 0;
  while (true) {
    const page = await supabaseRequest(`species?select=id,scientific_name,common_name&offset=${offset}&limit=500`);
    allSpecies.push(...page);
    if (page.length < 500) break;
    offset += 500;
  }
  const speciesMap = new Map(allSpecies.map((sp) => [sp.scientific_name, sp]));
  console.log(`  Fetched ${allSpecies.length} species.\n`);

  let replaced = 0;
  let noLandscape = 0;
  let failed = 0;

  for (let i = 0; i < PORTRAIT_SPECIES.length; i++) {
    const sciName = PORTRAIT_SPECIES[i];
    const sp = speciesMap.get(sciName);
    if (!sp) { console.log(`  [${i + 1}/${PORTRAIT_SPECIES.length}] SKIP ${sciName} — not in DB`); continue; }
    if (progress.replaced[sciName]) { continue; }
    if (progress.noLandscape.includes(sciName)) { continue; }

    const commonName = sp.common_name;

    try {
      // Search by scientific name
      let result = await findLandscapeImage(sciName);
      await sleep(RATE_LIMIT_MS);

      // Fallback: common name
      if (!result) {
        result = await findLandscapeImage(commonName);
        await sleep(RATE_LIMIT_MS);
      }

      // Fallback: common name + "bird"
      if (!result) {
        result = await findLandscapeImage(`${commonName} bird`);
        await sleep(RATE_LIMIT_MS);
      }

      if (!result) {
        console.log(`  [${i + 1}/${PORTRAIT_SPECIES.length}] NO LANDSCAPE ${commonName}`);
        progress.noLandscape.push(sciName);
        noLandscape++;
        saveProgress(progress);
        continue;
      }

      // Download
      const imageResp = await fetchWithRetry(result.imageUrl);
      if (!imageResp) {
        progress.failed.push({ scientific_name: sciName, error: "Download failed" });
        failed++;
        continue;
      }

      const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
      const slug = slugify(sciName);
      const ext = result.imageUrl.match(/\.(\w+)(?:\?|$)/)?.[1]?.toLowerCase() || "jpg";
      const contentType = ext === "png" ? "image/png" : "image/jpeg";
      const storagePath = `illustrations/${slug}.${ext === "jpeg" ? "jpg" : ext}`;

      // Upload (upsert replaces existing)
      const upResp = await fetch(`${SUPABASE_URL}/storage/v1/object/species-assets/${storagePath}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": contentType, "x-upsert": "true" },
        body: imageBuffer,
      });
      if (!upResp.ok) {
        console.log(`  [${i + 1}/${PORTRAIT_SPECIES.length}] UPLOAD FAILED ${commonName}: ${await upResp.text()}`);
        failed++;
        continue;
      }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/species-assets/${storagePath}`;

      // Update DB
      await supabaseRequest("species_illustrations?on_conflict=species_id,variant", {
        method: "POST",
        body: [{ species_id: sp.id, illustration_url: publicUrl, variant: "reference", source: "commons", license: result.license, attribution: result.attribution }],
        prefer: "resolution=merge-duplicates",
      });

      progress.replaced[sciName] = {
        illustration_url: publicUrl,
        license: result.license,
        dimensions: `${result.width}x${result.height}`,
      };
      replaced++;

      console.log(`  [${i + 1}/${PORTRAIT_SPECIES.length}] REPLACED ${commonName} — ${result.width}x${result.height} ${result.license}`);
    } catch (err) {
      console.error(`  [${i + 1}/${PORTRAIT_SPECIES.length}] ERROR ${commonName}: ${err.message}`);
      progress.failed.push({ scientific_name: sciName, error: err.message });
      failed++;
    }

    saveProgress(progress);
    await sleep(RATE_LIMIT_MS);
  }

  saveProgress(progress);

  console.log("\n═══════════════════════════════════════");
  console.log("  Portrait Re-scrape Complete");
  console.log("═══════════════════════════════════════");
  console.log(`  Total portrait species: ${PORTRAIT_SPECIES.length}`);
  console.log(`  Replaced with landscape: ${replaced}`);
  console.log(`  No landscape available:  ${noLandscape}`);
  console.log(`  Failed:                  ${failed}`);
  console.log("═══════════════════════════════════════");
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
