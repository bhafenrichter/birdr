/**
 * 03-download-frequency-data.js
 *
 * Downloads species presence data per US state from the eBird API.
 * Uses the /v2/product/spplist endpoint to get all species codes ever
 * observed in each state.
 *
 * Requires EBIRD_API_KEY environment variable.
 *
 * Output: data/frequency-by-state.json
 *   Format: { "US-NC": ["norcar", "amerob", ...], ... }
 *
 * Usage: node 03-download-frequency-data.js
 */

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import "dotenv/config";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const OUTPUT_FILE = `${DATA_DIR}frequency-by-state.json`;

const EBIRD_API_KEY = process.env.EBIRD_API_KEY;
const EBIRD_API_BASE = "https://api.ebird.org/v2";

// All 50 US state codes
const US_STATES = [
  "US-AL", "US-AK", "US-AZ", "US-AR", "US-CA", "US-CO", "US-CT", "US-DE",
  "US-FL", "US-GA", "US-HI", "US-ID", "US-IL", "US-IN", "US-IA", "US-KS",
  "US-KY", "US-LA", "US-ME", "US-MD", "US-MA", "US-MI", "US-MN", "US-MS",
  "US-MO", "US-MT", "US-NE", "US-NV", "US-NH", "US-NJ", "US-NM", "US-NY",
  "US-NC", "US-ND", "US-OH", "US-OK", "US-OR", "US-PA", "US-RI", "US-SC",
  "US-SD", "US-TN", "US-TX", "US-UT", "US-VT", "US-VA", "US-WA", "US-WV",
  "US-WI", "US-WY",
];

const DELAY_MS = 500; // Rate limiting — polite delay between requests

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchSpeciesForState(stateCode) {
  const url = `${EBIRD_API_BASE}/product/spplist/${stateCode}`;
  const response = await fetch(url, {
    headers: { "X-eBirdApiToken": EBIRD_API_KEY },
  });

  if (!response.ok) {
    throw new Error(`eBird API ${response.status}: ${response.statusText} for ${stateCode}`);
  }

  return response.json(); // Returns array of species codes e.g. ["norcar", "amerob", ...]
}

async function main() {
  if (!EBIRD_API_KEY) {
    console.error("Error: EBIRD_API_KEY environment variable is required.");
    console.error("Get a key at: https://ebird.org/api/keygen");
    process.exit(1);
  }

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  console.log("Downloading species lists per state from eBird API...");
  console.log(`Using ${US_STATES.length} state regions with ${DELAY_MS}ms delay.\n`);

  const allData = {};
  let totalEntries = 0;

  for (let i = 0; i < US_STATES.length; i++) {
    const state = US_STATES[i];
    console.log(`[${i + 1}/${US_STATES.length}] Fetching ${state}...`);

    try {
      const speciesCodes = await fetchSpeciesForState(state);
      allData[state] = speciesCodes;
      totalEntries += speciesCodes.length;
      console.log(`  → ${speciesCodes.length} species`);
    } catch (err) {
      console.warn(`  Warning: failed for ${state}: ${err.message}`);
      allData[state] = [];
    }

    if (i < US_STATES.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(allData, null, 2));
  console.log(`\nSaved species presence data to ${OUTPUT_FILE}`);
  console.log(`Total species-state entries: ${totalEntries}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
