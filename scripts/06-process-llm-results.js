/**
 * 06-process-llm-results.js
 *
 * Processes LLM batch results and maps them back to species records.
 * Validates species_type and primary_habitat against allowed values,
 * resolves them to lookup table UUIDs from the seed data.
 *
 * Input:  data/llm-results.jsonl (from OpenAI Batch API)
 *         data/llm-prompts-manifest.json (from step 05)
 *         data/na-species-parsed.json (from step 04)
 * Output: data/species-curated.json (ready for database seeding)
 *
 * Usage: node 06-process-llm-results.js
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const RESULTS_FILE = `${DATA_DIR}llm-results.jsonl`;
const MANIFEST_FILE = `${DATA_DIR}llm-prompts-manifest.json`;
const SPECIES_FILE = `${DATA_DIR}na-species-parsed.json`;
const OUTPUT_FILE = `${DATA_DIR}species-curated.json`;

const VALID_SPECIES_TYPES = new Set([
  "Songbirds",
  "Birds of prey",
  "Waterfowl",
  "Wading birds",
  "Shorebirds",
  "Seabirds",
  "Game birds",
  "Woodpeckers",
  "Aerial specialists",
]);

const VALID_HABITATS = new Set([
  "Forests",
  "Grasslands & farmland",
  "Deserts & scrublands",
  "Wetlands",
  "Freshwater",
  "Coasts & ocean",
  "Mountains",
  "Tundra",
  "Cities & towns",
]);

// Slug mapping for database FK resolution
const TYPE_SLUGS = {
  "Songbirds": "songbirds",
  "Birds of prey": "birds-of-prey",
  "Waterfowl": "waterfowl",
  "Wading birds": "wading-birds",
  "Shorebirds": "shorebirds",
  "Seabirds": "seabirds",
  "Game birds": "game-birds",
  "Woodpeckers": "woodpeckers",
  "Aerial specialists": "aerial-specialists",
};

const HABITAT_SLUGS = {
  "Forests": "forests",
  "Grasslands & farmland": "grasslands-farmland",
  "Deserts & scrublands": "deserts-scrublands",
  "Wetlands": "wetlands",
  "Freshwater": "freshwater",
  "Coasts & ocean": "coasts-ocean",
  "Mountains": "mountains",
  "Tundra": "tundra",
  "Cities & towns": "cities-towns",
};

function fuzzyMatchType(value) {
  const lower = value.toLowerCase().trim();
  for (const valid of VALID_SPECIES_TYPES) {
    if (valid.toLowerCase() === lower) return valid;
  }
  // Common LLM variants
  if (lower.includes("songbird") || lower.includes("passerine")) return "Songbirds";
  if (lower.includes("raptor") || lower.includes("prey")) return "Birds of prey";
  if (lower.includes("waterfowl") || lower.includes("duck") || lower.includes("goose")) return "Waterfowl";
  if (lower.includes("wading") || lower.includes("heron")) return "Wading birds";
  if (lower.includes("shore")) return "Shorebirds";
  if (lower.includes("seabird") || lower.includes("pelagic")) return "Seabirds";
  if (lower.includes("game") || lower.includes("gallinaceous")) return "Game birds";
  if (lower.includes("woodpecker")) return "Woodpeckers";
  if (lower.includes("aerial") || lower.includes("hummingbird") || lower.includes("swift")) return "Aerial specialists";
  return null;
}

const VALID_SEASONS = new Set(["year_round", "summer", "winter", "migratory"]);

function normalizeseason(value) {
  if (!value) return "year_round";
  const lower = value.toLowerCase().trim().replace(/[\s-]+/g, "_");
  if (VALID_SEASONS.has(lower)) return lower;
  if (lower.includes("year") || lower.includes("resident")) return "year_round";
  if (lower.includes("summer") || lower.includes("breed")) return "summer";
  if (lower.includes("winter")) return "winter";
  if (lower.includes("migrat") || lower.includes("passage")) return "migratory";
  return "year_round";
}

function fuzzyMatchHabitat(value) {
  const lower = value.toLowerCase().trim();
  for (const valid of VALID_HABITATS) {
    if (valid.toLowerCase() === lower) return valid;
  }
  if (lower.includes("forest") || lower.includes("woodland")) return "Forests";
  if (lower.includes("grassland") || lower.includes("prairie") || lower.includes("farmland")) return "Grasslands & farmland";
  if (lower.includes("desert") || lower.includes("scrub") || lower.includes("arid")) return "Deserts & scrublands";
  if (lower.includes("wetland") || lower.includes("marsh") || lower.includes("swamp")) return "Wetlands";
  if (lower.includes("freshwater") || lower.includes("lake") || lower.includes("river")) return "Freshwater";
  if (lower.includes("coast") || lower.includes("ocean") || lower.includes("marine") || lower.includes("beach")) return "Coasts & ocean";
  if (lower.includes("mountain") || lower.includes("alpine")) return "Mountains";
  if (lower.includes("tundra") || lower.includes("arctic")) return "Tundra";
  if (lower.includes("city") || lower.includes("urban") || lower.includes("suburb") || lower.includes("town")) return "Cities & towns";
  return null;
}

function main() {
  for (const file of [RESULTS_FILE, MANIFEST_FILE, SPECIES_FILE]) {
    if (!existsSync(file)) {
      console.error(`Error: ${file} not found.`);
      process.exit(1);
    }
  }

  const manifest = JSON.parse(readFileSync(MANIFEST_FILE, "utf-8"));
  const speciesList = JSON.parse(readFileSync(SPECIES_FILE, "utf-8"));
  const resultLines = readFileSync(RESULTS_FILE, "utf-8").trim().split("\n");

  console.log(`Processing ${resultLines.length} LLM results...`);

  // Build lookup maps
  const manifestMap = new Map(manifest.map((m) => [m.request_id, m]));
  const speciesMap = new Map(speciesList.map((sp) => [sp.scientific_name, sp]));

  const curated = [];
  let validCount = 0;
  let fixedCount = 0;
  let errorCount = 0;

  for (const line of resultLines) {
    const result = JSON.parse(line);
    const requestId = result.custom_id;
    const manifestEntry = manifestMap.get(requestId);

    if (!manifestEntry) {
      console.warn(`  Unknown request ID: ${requestId}`);
      errorCount++;
      continue;
    }

    const baseSpecies = speciesMap.get(manifestEntry.scientific_name);
    if (!baseSpecies) {
      console.warn(`  Species not found: ${manifestEntry.scientific_name}`);
      errorCount++;
      continue;
    }

    // Extract LLM response content
    let llmData;
    try {
      const content = result.response?.body?.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content in response");
      llmData = JSON.parse(content);
    } catch (err) {
      console.warn(`  Failed to parse LLM response for ${manifestEntry.common_name}: ${err.message}`);
      errorCount++;
      continue;
    }

    // Validate and fix species_type
    let speciesType = llmData.species_type;
    if (!VALID_SPECIES_TYPES.has(speciesType)) {
      const fixed = fuzzyMatchType(speciesType || "");
      if (fixed) {
        speciesType = fixed;
        fixedCount++;
      } else {
        console.warn(`  Invalid species_type "${speciesType}" for ${manifestEntry.common_name}, defaulting to Songbirds`);
        speciesType = "Songbirds";
        fixedCount++;
      }
    }

    // Validate and fix primary_habitat
    let habitat = llmData.primary_habitat;
    if (!VALID_HABITATS.has(habitat)) {
      const fixed = fuzzyMatchHabitat(habitat || "");
      if (fixed) {
        habitat = fixed;
        fixedCount++;
      } else {
        console.warn(`  Invalid habitat "${habitat}" for ${manifestEntry.common_name}, defaulting to Forests`);
        habitat = "Forests";
        fixedCount++;
      }
    }

    curated.push({
      common_name: baseSpecies.common_name,
      scientific_name: baseSpecies.scientific_name,
      family: baseSpecies.family,
      taxonomic_order: baseSpecies.taxonomic_order,
      conservation_status: baseSpecies.conservation_status || "LC",
      species_type: speciesType,
      species_type_slug: TYPE_SLUGS[speciesType],
      primary_habitat: habitat,
      primary_habitat_slug: HABITAT_SLUGS[habitat],
      season: normalizeseason(llmData.season),
      size: llmData.size || null,
      about_text: llmData.about_text || null,
      distinguishing_feature: llmData.distinguishing_feature || null,
    });
    validCount++;
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(curated, null, 2));

  console.log(`\nResults:`);
  console.log(`  Valid: ${validCount}`);
  console.log(`  Auto-fixed: ${fixedCount}`);
  console.log(`  Errors: ${errorCount}`);
  console.log(`\nSaved to ${OUTPUT_FILE}`);
  console.log(`\nNext: run step 07 to seed the database.`);
}

main();
