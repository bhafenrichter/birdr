/**
 * 02-download-iucn-status.js
 *
 * Downloads IUCN Red List conservation status for North American bird species.
 *
 * The IUCN API requires a token. Get one at: https://apiv3.iucnredlist.org/api/v3/token
 * Set the IUCN_API_TOKEN environment variable before running.
 *
 * This script queries the IUCN API for each species from the parsed taxonomy
 * (output of step 04) and saves the results as a JSON lookup file.
 *
 * If the IUCN API is unavailable or rate-limited, you can also manually download
 * the data from https://www.iucnredlist.org/ and place it in data/iucn-status.json
 *
 * Input:  data/na-species-parsed.json (from step 04)
 * Output: data/iucn-status.json
 *
 * Usage: IUCN_API_TOKEN=your_token node 02-download-iucn-status.js
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import "dotenv/config";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const INPUT_FILE = `${DATA_DIR}na-species-parsed.json`;
const OUTPUT_FILE = `${DATA_DIR}iucn-status.json`;

const IUCN_API_TOKEN = process.env.IUCN_API_TOKEN;
const IUCN_API_BASE = "https://apiv3.iucnredlist.org/api/v3";

// Rate limit: max 10 requests per second
const DELAY_MS = 120;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchIucnStatus(scientificName) {
  const url = `${IUCN_API_BASE}/species/${encodeURIComponent(scientificName)}?token=${IUCN_API_TOKEN}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`IUCN API ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.result || data.result.length === 0) return null;

  const species = data.result[0];
  return {
    scientific_name: scientificName,
    iucn_category: species.category, // LC, NT, VU, EN, CR, DD, NE
    population_trend: species.population_trend,
  };
}

// Map IUCN category codes to our conservation_status enum
function mapCategory(iucnCategory) {
  const mapping = {
    LC: "LC",
    NT: "NT",
    VU: "VU",
    EN: "EN",
    CR: "CR",
    // Data Deficient or Not Evaluated default to LC for our purposes
    DD: "LC",
    NE: "LC",
    LR: "LC", // Lower Risk (old category)
    "LR/lc": "LC",
    "LR/nt": "NT",
    "LR/cd": "NT",
  };
  return mapping[iucnCategory] || "LC";
}

async function main() {
  if (!IUCN_API_TOKEN) {
    console.error("Error: IUCN_API_TOKEN environment variable is required.");
    console.error("Get a token at: https://apiv3.iucnredlist.org/api/v3/token");
    console.error("");
    console.error("Alternative: manually create data/iucn-status.json with format:");
    console.error(
      '  [{"scientific_name": "Turdus migratorius", "conservation_status": "LC"}, ...]'
    );
    process.exit(1);
  }

  if (!existsSync(INPUT_FILE)) {
    console.error(`Error: ${INPUT_FILE} not found.`);
    console.error("Run step 04 (parse-species) first to generate the parsed species list.");
    process.exit(1);
  }

  const species = JSON.parse(readFileSync(INPUT_FILE, "utf-8"));
  console.log(`Fetching IUCN status for ${species.length} species...`);

  const results = [];
  let found = 0;
  let notFound = 0;

  for (let i = 0; i < species.length; i++) {
    const sp = species[i];
    try {
      const status = await fetchIucnStatus(sp.scientific_name);
      if (status) {
        results.push({
          scientific_name: sp.scientific_name,
          conservation_status: mapCategory(status.iucn_category),
          iucn_raw_category: status.iucn_category,
          population_trend: status.population_trend,
        });
        found++;
      } else {
        // Default to LC if not found
        results.push({
          scientific_name: sp.scientific_name,
          conservation_status: "LC",
          iucn_raw_category: null,
          population_trend: null,
        });
        notFound++;
      }
    } catch (err) {
      console.warn(`  Warning: failed for ${sp.scientific_name}: ${err.message}`);
      results.push({
        scientific_name: sp.scientific_name,
        conservation_status: "LC",
        iucn_raw_category: null,
        population_trend: null,
      });
      notFound++;
    }

    if ((i + 1) % 50 === 0) {
      console.log(`  Progress: ${i + 1}/${species.length} (${found} found, ${notFound} not found)`);
    }

    await sleep(DELAY_MS);
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nSaved ${results.length} entries to ${OUTPUT_FILE}`);
  console.log(`Found: ${found}, Not found (defaulted to LC): ${notFound}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
