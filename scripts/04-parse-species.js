/**
 * 04-parse-species.js
 *
 * Parses the eBird/Clements taxonomy CSV and filters to ~900 North American species.
 *
 * Filtering criteria:
 *   - category = "species" (excludes subspecies, hybrids, slashes, spuhs)
 *   - range includes North America (US/Canada/Mexico overlap)
 *   - Currently present / regularly occurring (not extinct or hypothetical)
 *
 * Joins IUCN conservation status if data/iucn-status.json exists.
 * Joins eBird state presence data if data/frequency-by-state.json exists.
 *
 * Input:  data/clements-taxonomy.csv
 * Output: data/na-species-parsed.json
 *         data/species-regions-parsed.json
 *
 * Usage: node 04-parse-species.js
 */

import { readFileSync, writeFileSync, existsSync, createReadStream } from "node:fs";
import { parse } from "csv-parse";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const TAXONOMY_FILE = `${DATA_DIR}clements-taxonomy.csv`;
const IUCN_FILE = `${DATA_DIR}iucn-status.json`;
const FREQUENCY_FILE = `${DATA_DIR}frequency-by-state.json`;
const OUTPUT_SPECIES = `${DATA_DIR}na-species-parsed.json`;
const OUTPUT_REGIONS = `${DATA_DIR}species-regions-parsed.json`;

// North American region codes/keywords in the Clements range field
const NA_KEYWORDS = [
  "North America",
  "NA",
  "United States",
  "Canada",
  "Alaska",
  "Mexico",
  "Caribbean",
  "Hawaii",
  "Nearctic",
];

function isNorthAmerican(rangeField) {
  if (!rangeField) return false;
  const upper = rangeField.toUpperCase();
  return NA_KEYWORDS.some((kw) => upper.includes(kw.toUpperCase()));
}

async function parseTaxonomyCsv() {
  const records = [];

  const parser = createReadStream(TAXONOMY_FILE).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
      bom: true,
    })
  );

  for await (const record of parser) {
    records.push(record);
  }

  return records;
}

function findColumn(record, ...candidates) {
  for (const c of candidates) {
    // Try exact match first
    if (record[c] !== undefined) return record[c];
    // Try case-insensitive
    const key = Object.keys(record).find((k) => k.toLowerCase().replace(/\s+/g, "_") === c.toLowerCase().replace(/\s+/g, "_"));
    if (key) return record[key];
  }
  return null;
}

async function main() {
  if (!existsSync(TAXONOMY_FILE)) {
    console.error(`Error: ${TAXONOMY_FILE} not found.`);
    console.error("Run step 01 (download-taxonomy) first.");
    process.exit(1);
  }

  console.log("Parsing Clements taxonomy CSV...");
  const allRecords = await parseTaxonomyCsv();
  console.log(`Total records in CSV: ${allRecords.length}`);

  // Log column names for debugging
  if (allRecords.length > 0) {
    console.log(`\nCSV columns: ${Object.keys(allRecords[0]).join(", ")}`);
  }

  // Filter to species only (exclude subspecies, groups, slashes, hybrids, domestics)
  const speciesOnly = allRecords.filter((r) => {
    const category = findColumn(r, "category", "Category");
    return category && category.toLowerCase() === "species";
  });
  console.log(`Species-level records: ${speciesOnly.length}`);

  // Build species code → scientific name mapping from taxonomy
  const codeToSciName = new Map();
  for (const r of speciesOnly) {
    const code = findColumn(r, "species_code", "Species Code", "eBird species code", "eBird_species_code");
    const sciName = findColumn(r, "scientific name", "scientific_name", "Scientific name", "sci_name");
    if (code && sciName) {
      codeToSciName.set(code, sciName);
    }
  }
  console.log(`Species codes mapped: ${codeToSciName.size}`);

  // If we have eBird state data, use it to determine NA species
  let naSpeciesCodes = null;
  let stateData = null;
  if (existsSync(FREQUENCY_FILE)) {
    stateData = JSON.parse(readFileSync(FREQUENCY_FILE, "utf-8"));
    const totalEntries = Object.values(stateData).reduce((sum, arr) => sum + arr.length, 0);

    if (totalEntries > 0) {
      // Collect all unique species codes seen in any US state
      naSpeciesCodes = new Set();
      for (const codes of Object.values(stateData)) {
        for (const code of codes) {
          naSpeciesCodes.add(code);
        }
      }
      console.log(`\neBird state data: ${naSpeciesCodes.size} unique species codes across ${Object.keys(stateData).length} states`);
    }
  }

  // Filter to North American species
  let naSpecies;
  if (naSpeciesCodes && naSpeciesCodes.size > 0) {
    // Use eBird presence data as the authoritative NA filter
    naSpecies = speciesOnly.filter((r) => {
      const code = findColumn(r, "species_code", "Species Code", "eBird species code", "eBird_species_code");
      return code && naSpeciesCodes.has(code);
    });
    console.log(`North American species (from eBird state data): ${naSpecies.length}`);
  } else {
    // Fallback: filter by range description in taxonomy CSV
    naSpecies = speciesOnly.filter((r) => {
      const range = findColumn(r, "range", "Range", "breeding_range", "Breeding Range", "eBird range");
      return isNorthAmerican(range);
    });
    console.log(`North American species (from range text): ${naSpecies.length}`);
  }

  if (naSpecies.length < 500) {
    console.log("\nWarning: NA filter matched fewer than 500 species. Check filtering logic.");
  }

  // Map to our schema format
  const species = naSpecies.map((r) => ({
    common_name: findColumn(r, "English name", "common_name", "English_name", "primary_com_name") || "",
    scientific_name: findColumn(r, "scientific name", "scientific_name", "Scientific name", "sci_name") || "",
    family: findColumn(r, "family", "Family") || "",
    taxonomic_order: findColumn(r, "order", "Order", "taxonomic_order") || "",
    species_code: findColumn(r, "species_code", "Species Code", "eBird species code", "eBird_species_code") || "",
    sort_order: findColumn(r, "sort v2025", "sort v2024", "sort", "Sort") || "",
  }));

  // Deduplicate by scientific name
  const seen = new Set();
  const uniqueSpecies = species.filter((sp) => {
    if (!sp.scientific_name || seen.has(sp.scientific_name)) return false;
    seen.add(sp.scientific_name);
    return true;
  });

  console.log(`Unique species after dedup: ${uniqueSpecies.length}`);

  // Join IUCN status if available
  if (existsSync(IUCN_FILE)) {
    console.log("\nJoining IUCN conservation status...");
    const iucnData = JSON.parse(readFileSync(IUCN_FILE, "utf-8"));
    const iucnMap = new Map(iucnData.map((r) => [r.scientific_name, r.conservation_status]));

    for (const sp of uniqueSpecies) {
      sp.conservation_status = iucnMap.get(sp.scientific_name) || "LC";
    }
    const nonLC = uniqueSpecies.filter((sp) => sp.conservation_status !== "LC").length;
    console.log(`  ${nonLC} species with non-LC status`);
  } else {
    console.log("\nNo IUCN data found. All species will default to LC.");
    console.log("Run step 02 to download IUCN status data.");
    for (const sp of uniqueSpecies) {
      sp.conservation_status = "LC";
    }
  }

  // Build species_regions from eBird state presence data
  const regions = [];
  if (stateData) {
    console.log("\nBuilding species_regions from eBird state data...");
    const sciNameToCommon = new Map(uniqueSpecies.map((sp) => [sp.scientific_name, sp.common_name]));

    for (const [stateCode, speciesCodes] of Object.entries(stateData)) {
      for (const code of speciesCodes) {
        const sciName = codeToSciName.get(code);
        if (!sciName) continue;
        const commonName = sciNameToCommon.get(sciName);
        if (!commonName) continue; // Not in our filtered species list

        regions.push({
          common_name: commonName,
          scientific_name: sciName,
          species_code: code,
          state_code: stateCode,
          // Season will be populated by LLM curation (script 05/06)
          season: "year_round",
          peak_frequency: null,
        });
      }
    }
    console.log(`  ${regions.length} species-region entries`);
  } else {
    console.log("\nNo eBird state data found. Run step 03 to download.");
  }

  // Write outputs
  writeFileSync(OUTPUT_SPECIES, JSON.stringify(uniqueSpecies, null, 2));
  console.log(`\nSaved ${uniqueSpecies.length} species to ${OUTPUT_SPECIES}`);

  if (regions.length > 0) {
    writeFileSync(OUTPUT_REGIONS, JSON.stringify(regions, null, 2));
    console.log(`Saved ${regions.length} region entries to ${OUTPUT_REGIONS}`);
  }

  // Summary stats
  const families = new Set(uniqueSpecies.map((sp) => sp.family));
  const orders = new Set(uniqueSpecies.map((sp) => sp.taxonomic_order));
  console.log(`\nSummary:`);
  console.log(`  Species: ${uniqueSpecies.length}`);
  console.log(`  Families: ${families.size}`);
  console.log(`  Orders: ${orders.size}`);
  if (regions.length > 0) {
    const statesWithData = new Set(regions.map((r) => r.state_code));
    console.log(`  States with data: ${statesWithData.size}`);
    console.log(`  Avg species per state: ${Math.round(regions.length / statesWithData.size)}`);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
