/**
 * 03-download-frequency-data.js
 *
 * Downloads eBird bar chart frequency data for all 50 US states.
 * Parses the data into season tags per species per state.
 *
 * eBird provides bar chart data at:
 *   https://ebird.org/barchartData?r={regionCode}&bmo=1&emo=12&byr=1900&eyr=2024&fmt=tsv
 *
 * This requires an eBird API key set as EBIRD_API_KEY environment variable.
 *
 * Output: data/frequency-by-state.json
 *   Format: { "US-NC": [{ scientific_name, common_name, season, peak_frequency }, ...], ... }
 *
 * Usage: EBIRD_API_KEY=your_key node 03-download-frequency-data.js
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

const DELAY_MS = 500; // Rate limiting

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * eBird bar chart data has 48 columns representing 4 periods per month (12 months).
 * Each column is a frequency value (0.0 - 1.0).
 * We classify season based on when the species is present:
 *
 * - year_round: present in all 4 seasons (frequency > threshold in each)
 * - summer:     present primarily May-Aug
 * - winter:     present primarily Nov-Feb
 * - migratory:  present primarily in spring (Mar-May) and/or fall (Aug-Nov)
 * - rare:       overall frequency is very low
 */
function classifySeason(frequencies) {
  if (!frequencies || frequencies.length < 48) return { season: "rare", peak: 0 };

  const freqs = frequencies.map((f) => (f === "" || f === null ? 0 : parseFloat(f)));
  const peak = Math.max(...freqs);

  if (peak === 0) return { season: "rare", peak: 0 };
  if (peak < 0.01) return { season: "rare", peak };

  // Aggregate by quarter
  // Q1 (winter):  Jan-Mar  → indices 0-11
  // Q2 (spring):  Apr-Jun  → indices 12-23
  // Q3 (summer):  Jul-Sep  → indices 24-35
  // Q4 (fall):    Oct-Dec  → indices 36-47
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  const winter = avg(freqs.slice(0, 12));
  const spring = avg(freqs.slice(12, 24));
  const summer = avg(freqs.slice(24, 36));
  const fall = avg(freqs.slice(36, 48));

  const threshold = peak * 0.15;
  const present = { winter: winter > threshold, spring: spring > threshold, summer: summer > threshold, fall: fall > threshold };
  const seasonCount = Object.values(present).filter(Boolean).length;

  if (seasonCount === 4) return { season: "year_round", peak };
  if (present.summer && present.spring && !present.winter) return { season: "summer", peak };
  if (present.winter && present.fall && !present.summer) return { season: "winter", peak };
  if (seasonCount <= 2) return { season: "migratory", peak };
  return { season: "year_round", peak };
}

async function fetchStateSpeciesList(stateCode) {
  // Use eBird API to get species list for a region
  const url = `${EBIRD_API_BASE}/product/spplist/${stateCode}`;
  const response = await fetch(url, {
    headers: { "X-eBirdApiToken": EBIRD_API_KEY },
  });

  if (!response.ok) {
    throw new Error(`eBird API ${response.status}: ${response.statusText} for ${stateCode}`);
  }

  return response.json(); // Returns array of species codes
}

async function fetchBarChartData(stateCode) {
  // Bar chart data endpoint (TSV format)
  const url = `https://ebird.org/barchartData?r=${stateCode}&bmo=1&emo=12&byr=1900&eyr=2024&fmt=tsv`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Bar chart download failed ${response.status} for ${stateCode}`);
  }

  const text = await response.text();
  const lines = text.split("\n").filter((l) => l.trim());

  const results = [];
  for (const line of lines) {
    const cols = line.split("\t");
    if (cols.length < 49) continue; // Need species name + 48 frequency columns

    const speciesName = cols[0].trim();
    if (!speciesName || speciesName.startsWith("//") || speciesName === "Species") continue;

    const frequencies = cols.slice(1, 49);
    const { season, peak } = classifySeason(frequencies);

    results.push({
      common_name: speciesName,
      season,
      peak_frequency: Math.round(peak * 1000) / 1000,
    });
  }

  return results;
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

  console.log("Downloading eBird frequency data for all 50 US states...");
  console.log("This will take a few minutes due to rate limiting.\n");

  const allData = {};

  for (let i = 0; i < US_STATES.length; i++) {
    const state = US_STATES[i];
    console.log(`[${i + 1}/${US_STATES.length}] Fetching ${state}...`);

    try {
      const barData = await fetchBarChartData(state);
      allData[state] = barData;
      console.log(`  → ${barData.length} species`);
    } catch (err) {
      console.warn(`  Warning: failed for ${state}: ${err.message}`);
      allData[state] = [];
    }

    await sleep(DELAY_MS);
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(allData, null, 2));
  console.log(`\nSaved frequency data to ${OUTPUT_FILE}`);

  const totalEntries = Object.values(allData).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`Total species-state entries: ${totalEntries}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
