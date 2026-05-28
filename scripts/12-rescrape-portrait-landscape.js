/**
 * 12-rescrape-portrait-landscape.js
 *
 * Re-scrapes Wikimedia Commons for landscape alternatives to specific bird
 * images that have been identified as having defects (portrait orientation,
 * wrong image, low resolution, etc.)
 *
 * Environment variables:
 *   SUPABASE_URL         — e.g. https://xxx.supabase.co
 *   SUPABASE_SERVICE_KEY — service_role key (bypasses RLS)
 *
 * Usage: node 12-rescrape-portrait-landscape.js
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import "dotenv/config";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";
const RATE_LIMIT_MS = 400;
const MAX_RETRIES = 3;
const USER_AGENT = "BirdrBot/1.0 (birdr bird-watching app; hello@hoftware.io)";
const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const PROGRESS_FILE = `${DATA_DIR}landscape-rescrape-progress.json`;

const ALLOWED_LICENSES = [
  "cc-by-sa-4.0", "cc-by-sa-3.0", "cc-by-sa-2.5", "cc-by-sa-2.0",
  "cc-by-4.0", "cc-by-3.0", "cc-by-2.5", "cc-by-2.0",
  "cc0", "cc-zero",
  "public domain", "pd", "pd-self", "pd-old", "pd-us", "pd-usgov",
  "pd-author", "pd-ineligible",
];

// Birds that need new images — from manual audit
const TARGET_SPECIES = [
  { sci: "Hydrobates cheimomnestes", common: "Ainley's Storm-Petrel" },
  { sci: "Loxops caeruleirostris", common: "Akekee" },
  { sci: "Hemignathus wilsoni", common: "Akiapolaau" },
  { sci: "Psittacula eupatria", common: "Alexandrine Parakeet" },
  { sci: "Recurvirostra americana", common: "American Avocet" },
  { sci: "Botaurus lentiginosus", common: "American Bittern" },
  { sci: "Magumma parva", common: "Anianiau" },
  { sci: "Leuconotopicus arizonae", common: "Arizona Woodpecker" },
  { sci: "Hydrobates homochroa", common: "Ashy Storm-Petrel" },
  { sci: "Fratercula arctica", common: "Atlantic Puffin" },
  { sci: "Branta leucopsis", common: "Barnacle Goose" },
  { sci: "Melanoptila glabrirostris", common: "Black Catbird" },
  { sci: "Sayornis nigricans", common: "Black Phoebe" },
  { sci: "Bycanistes subcylindricus", common: "Black-and-white-casqued Hornbill" },
  { sci: "Icterus abeillei", common: "Black-backed Oriole" },
  { sci: "Poecile atricapillus", common: "Black-capped Chickadee" },
  { sci: "Pionites melanocephalus", common: "Black-headed Parrot" },
  { sci: "Himantopus mexicanus", common: "Black-necked Stilt" },
  { sci: "Cyanocorax colliei", common: "Black-throated Magpie-Jay" },
  { sci: "Passerina caerulea", common: "Blue Grosbeak" },
  { sci: "Cyanocitta cristata", common: "Blue Jay" },
  { sci: "Gygis candida", common: "Blue-billed White-Tern" },
  { sci: "Uraeginthus cyanocephalus", common: "Blue-capped Cordonbleu" },
  { sci: "Thectocercus acuticaudatus", common: "Blue-crowned Parakeet" },
  { sci: "Urile penicillatus", common: "Brandt's Cormorant" },
  { sci: "Buteo platypterus", common: "Broad-winged Hawk" },
  { sci: "Bombycilla cedrorum", common: "Cedar Waxwing" },
  { sci: "Lorius garrulus", common: "Chattering Lory" },
  { sci: "Ara severus", common: "Chestnut-fronted Macaw" },
  { sci: "Puffinus nativitatis", common: "Christmas Shearwater" },
  { sci: "Nymphicus hollandicus", common: "Cockatiel" },
  { sci: "Micrastur semitorquatus", common: "Collared Forest-Falcon" },
  { sci: "Gallinula galeata", common: "Common Gallinule" },
  { sci: "Columbina passerina", common: "Common Ground Dove" },
  { sci: "Coturnix coturnix", common: "Common Quail" },
  { sci: "Phoenicurus phoenicurus", common: "Common Redstart" },
  { sci: "Amadina fasciata", common: "Cut-throat" },
  { sci: "Chalcopsitta fuscata", common: "Dusky Lory" },
  { sci: "Antrostomus vociferus", common: "Eastern Whip-poor-will" },
  { sci: "Micrathene whitneyi", common: "Elf Owl" },
  { sci: "Anser canagicus", common: "Emperor Goose" },
  { sci: "Numenius borealis", common: "Eskimo Curlew" },
  { sci: "Falco subbuteo", common: "Eurasian Hobby" },
  { sci: "Passer montanus", common: "Eurasian Tree Sparrow" },
  { sci: "Perdix perdix", common: "Gray Partridge" },
  { sci: "Cyanocorax yncas", common: "Green Jay" },
  { sci: "Astur gundlachi", common: "Gundlach's Hawk" },
  { sci: "Buteo solitarius", common: "Hawaiian Hawk" },
  { sci: "Aratinga jandaya", common: "Jandaya Parakeet" },
  { sci: "Myadestes myadestinus", common: "Kamao" },
  { sci: "Passerina amoena", common: "Lazuli Bunting" },
  { sci: "Aethia pusilla", common: "Least Auklet" },
  { sci: "Melanerpes lewis", common: "Lewis's Woodpecker" },
  { sci: "Asio otus", common: "Long-eared Owl" },
  { sci: "Loxops ochraceus", common: "Maui Akepa" },
  { sci: "Ara militaris", common: "Military Macaw" },
  { sci: "Oreortyx pictus", common: "Mountain Quail" },
  { sci: "Aratinga nenday", common: "Nanday Parakeet" },
  { sci: "Telespiza ultima", common: "Nihoa Finch" },
  { sci: "Ninox japonica", common: "Northern Boobook" },
  { sci: "Cardinalis cardinalis", common: "Northern Cardinal" },
  { sci: "Colaptes auratus", common: "Northern Flicker" },
  { sci: "Jacana spinosa", common: "Northern Jacana" },
  { sci: "Eclectus polychloros", common: "Papuan Eclectus" },
  { sci: "Ectopistes migratorius", common: "Passenger Pigeon" },
  { sci: "Falco peregrinus", common: "Peregrine Falcon" },
  { sci: "Melamprosops phaeosoma", common: "Poo-uli" },
  { sci: "Spinus cucullatus", common: "Red Siskin" },
  { sci: "Amazona viridigenalis", common: "Red-crowned Amazon" },
  { sci: "Sula sula", common: "Red-footed Booby" },
  { sci: "Ara rubrogenys", common: "Red-fronted Macaw" },
  { sci: "Cyanerpes cyaneus", common: "Red-legged Honeycreeper" },
  { sci: "Buteo lineatus", common: "Red-shouldered Hawk" },
  { sci: "Diopsittaca nobilis", common: "Red-shouldered Macaw" },
  { sci: "Rupornis magnirostris", common: "Roadside Hawk" },
  { sci: "Sporophila minuta", common: "Ruddy-breasted Seedeater" },
  { sci: "Antigone canadensis", common: "Sandhill Crane" },
  { sci: "Buteogallus meridionalis", common: "Savanna Hawk" },
  { sci: "Pionus maximiliani", common: "Scaly-headed Parrot" },
  { sci: "Psittacara wagleri", common: "Scarlet-fronted Parakeet" },
  { sci: "Ammospiza maritima", common: "Seaside Sparrow" },
  { sci: "Accipiter striatus", common: "Sharp-shinned Hawk" },
  { sci: "Mergellus albellus", common: "Smew" },
  { sci: "Spilopelia chinensis", common: "Spotted Dove" },
  { sci: "Cyanocitta stelleri", common: "Steller's Jay" },
  { sci: "Asio stygius", common: "Stygian Owl" },
  { sci: "Melospiza georgiana", common: "Swamp Sparrow" },
  { sci: "Hydrobates monorhis", common: "Swinhoe's Storm-Petrel" },
  { sci: "Lonchura malacca", common: "Tricolored Munia" },
  { sci: "Empidonomus varius", common: "Variegated Flycatcher" },
  { sci: "Pycnonotus leucotis", common: "White-eared Bulbul" },
  { sci: "Grus americana", common: "Whooping Crane" },
  { sci: "Tringa glareola", common: "Wood Sandpiper" },
  { sci: "Icteria virens", common: "Yellow-breasted Chat" },
  { sci: "Crithagra mozambica", common: "Yellow-fronted Canary" },
  { sci: "Amazona oratrix", common: "Yellow-headed Amazon" },
  { sci: "Xanthocephalus xanthocephalus", common: "Yellow-headed Blackbird" },
  { sci: "Daptrius chimachima", common: "Yellow-headed Caracara" },
  { sci: "Amazona barbadensis", common: "Yellow-shouldered Amazon" },
];

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

async function findLandscapeOnCommons(searchTerm) {
  const url = `${COMMONS_API}?action=query&generator=search&gsrsearch=${encodeURIComponent(searchTerm)}&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=800&format=json&formatversion=2`;
  const resp = await fetchWithRetry(url);
  if (!resp) return null;
  const data = await resp.json();
  const pages = data.query?.pages;
  if (!pages) return null;

  for (const page of pages) {
    const ii = page.imageinfo?.[0];
    if (!ii) continue;
    const meta = ii.extmetadata || {};
    const license = meta.LicenseShortName?.value || "unknown";
    const title = page.title.toLowerCase();

    if (title.endsWith(".svg") || title.endsWith(".ogg") || title.endsWith(".wav") || title.endsWith(".mp3") || title.endsWith(".flac")) continue;
    if (title.includes("map") || title.includes("range") || title.includes("distribution") || title.includes("logo") || title.includes("spectrogram")) continue;
    if (!isLicenseAllowed(license)) continue;

    const w = ii.thumbwidth || ii.width || 0;
    const h = ii.thumbheight || ii.height || 0;
    if (w < 300 || h < 200) continue;
    if (h > w) continue; // still portrait

    return {
      imageUrl: ii.thumburl || ii.url,
      license: meta.LicenseShortName?.value,
      attribution: stripHtml(meta.Artist?.value || "") || "Wikimedia Commons",
      width: w, height: h,
      filename: page.title.replace("File:", ""),
    };
  }
  return null;
}

function loadProgress() {
  if (existsSync(PROGRESS_FILE)) return JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
  return { replaced: {}, noLandscape: [], failed: [] };
}

function saveProgress(progress) {
  writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function main() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY required.");
    process.exit(1);
  }

  const progress = loadProgress();
  const alreadyDone = new Set([...Object.keys(progress.replaced), ...progress.noLandscape]);

  const toProcess = TARGET_SPECIES.filter((sp) => !alreadyDone.has(sp.sci));
  console.log(`${TARGET_SPECIES.length} species to fix, ${toProcess.length} remaining.\n`);

  // Fetch species IDs
  console.log("Fetching species ID mapping...");
  const allSpecies = [];
  let offset = 0;
  while (true) {
    const resp = await fetch(
      `${SUPABASE_URL}/rest/v1/species?select=id,scientific_name&offset=${offset}&limit=500`,
      { headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } }
    );
    const data = await resp.json();
    allSpecies.push(...data);
    if (data.length < 500) break;
    offset += 500;
  }
  const speciesIdMap = new Map(allSpecies.map((sp) => [sp.scientific_name, sp.id]));
  console.log(`  Fetched ${allSpecies.length} species.\n`);

  let replaced = 0, noLandscape = 0, failed = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const sp = toProcess[i];
    const speciesId = speciesIdMap.get(sp.sci);
    if (!speciesId) { console.log(`  [${i + 1}/${toProcess.length}] SKIP ${sp.common} — not in DB`); continue; }

    try {
      let result = await findLandscapeOnCommons(sp.sci);
      await sleep(RATE_LIMIT_MS);

      if (!result) {
        result = await findLandscapeOnCommons(sp.common);
        await sleep(RATE_LIMIT_MS);
      }

      if (!result) {
        result = await findLandscapeOnCommons(`${sp.common} bird`);
        await sleep(RATE_LIMIT_MS);
      }

      if (!result) {
        console.log(`  [${i + 1}/${toProcess.length}] NO LANDSCAPE ${sp.common}`);
        progress.noLandscape.push(sp.sci);
        noLandscape++;
        if ((i + 1) % 10 === 0) saveProgress(progress);
        continue;
      }

      // Download
      const imageResp = await fetchWithRetry(result.imageUrl);
      if (!imageResp) { progress.failed.push(sp.sci); failed++; continue; }
      const imageBuffer = Buffer.from(await imageResp.arrayBuffer());

      const slug = slugify(sp.sci);
      const ext = result.imageUrl.match(/\.(\w+)(?:\?|$)/)?.[1]?.toLowerCase() || "jpg";
      const contentType = ext === "png" ? "image/png" : "image/jpeg";
      const storagePath = `illustrations/${slug}.${ext === "jpeg" ? "jpg" : ext}`;

      // Upload
      const upResp = await fetch(`${SUPABASE_URL}/storage/v1/object/species-assets/${storagePath}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": contentType, "x-upsert": "true" },
        body: imageBuffer,
      });
      if (!upResp.ok) { console.log(`  UPLOAD FAILED ${sp.common}`); progress.failed.push(sp.sci); failed++; continue; }

      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/species-assets/${storagePath}`;

      // Upsert DB
      const dbResp = await fetch(`${SUPABASE_URL}/rest/v1/species_illustrations?on_conflict=species_id,variant`, {
        method: "POST",
        headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" },
        body: JSON.stringify([{ species_id: speciesId, illustration_url: publicUrl, variant: "reference", source: "commons", license: result.license, attribution: result.attribution }]),
      });
      if (!dbResp.ok) { console.log(`  DB FAILED ${sp.common}`); progress.failed.push(sp.sci); failed++; continue; }

      progress.replaced[sp.sci] = { url: publicUrl, dimensions: `${result.width}x${result.height}`, license: result.license };
      replaced++;
      console.log(`  [${i + 1}/${toProcess.length}] REPLACED ${sp.common} — ${result.width}x${result.height} ${result.license}`);
    } catch (err) {
      console.error(`  [${i + 1}/${toProcess.length}] ERROR ${sp.common}: ${err.message}`);
      progress.failed.push(sp.sci);
      failed++;
    }

    if ((i + 1) % 10 === 0) saveProgress(progress);
    await sleep(RATE_LIMIT_MS);
  }

  saveProgress(progress);

  console.log("\n═══════════════════════════════════════");
  console.log("  Landscape Re-scrape Complete");
  console.log("═══════════════════════════════════════");
  console.log(`  Target species:            ${TARGET_SPECIES.length}`);
  console.log(`  Replaced with landscape:   ${replaced}`);
  console.log(`  No landscape available:    ${noLandscape}`);
  console.log(`  Failed:                    ${failed}`);
  console.log("═══════════════════════════════════════");
}

main().catch((err) => { console.error("Fatal error:", err.message); process.exit(1); });
