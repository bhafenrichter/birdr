/**
 * 05-generate-llm-prompts.js
 *
 * Generates structured LLM prompts for batch curation of species data.
 * Each prompt asks for: species_type, primary_habitat, size, about_text,
 * distinguishing_feature.
 *
 * Output is a JSONL file suitable for the OpenAI Batch API or similar.
 * Each line is a self-contained prompt with the species context.
 *
 * Input:  data/na-species-parsed.json
 * Output: data/llm-prompts.jsonl
 *         data/llm-prompts-manifest.json (maps request IDs to species)
 *
 * Usage: node 05-generate-llm-prompts.js
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;
const INPUT_FILE = `${DATA_DIR}na-species-parsed.json`;
const OUTPUT_JSONL = `${DATA_DIR}llm-prompts.jsonl`;
const OUTPUT_MANIFEST = `${DATA_DIR}llm-prompts-manifest.json`;

const SPECIES_TYPES = [
  "Songbirds",
  "Birds of prey",
  "Waterfowl",
  "Wading birds",
  "Shorebirds",
  "Seabirds",
  "Game birds",
  "Woodpeckers",
  "Aerial specialists",
];

const HABITATS = [
  "Forests",
  "Grasslands & farmland",
  "Deserts & scrublands",
  "Wetlands",
  "Freshwater",
  "Coasts & ocean",
  "Mountains",
  "Tundra",
  "Cities & towns",
];

const SYSTEM_PROMPT = `You are a bird taxonomy expert helping curate a North American bird species database for a mobile app called birdr. For each species, provide accurate, factual data in the requested JSON format.

Rules:
- species_type must be exactly one of: ${SPECIES_TYPES.join(", ")}
- primary_habitat must be exactly one of: ${HABITATS.join(", ")}
- size should be a range in cm (body length), e.g. "12-15 cm"
- about_text should be 2-3 sentences of engaging, accurate editorial copy suitable for a casual audience. Focus on what makes this bird interesting or distinctive.
- distinguishing_feature should be 5-8 words describing the key visual identifier, e.g. "Bright red body, black face mask"

Respond with valid JSON only. No markdown, no explanation.`;

function buildUserPrompt(species) {
  return `Classify and describe this North American bird species:

Common name: ${species.common_name}
Scientific name: ${species.scientific_name}
Family: ${species.family || "Unknown"}
Order: ${species.taxonomic_order || "Unknown"}

Respond with this exact JSON structure:
{
  "species_type": "<one of the 9 types>",
  "primary_habitat": "<one of the 9 habitats>",
  "size": "<body length range in cm>",
  "about_text": "<2-3 sentence description>",
  "distinguishing_feature": "<5-8 word visual identifier>"
}`;
}

function main() {
  if (!existsSync(INPUT_FILE)) {
    console.error(`Error: ${INPUT_FILE} not found.`);
    console.error("Run step 04 (parse-species) first.");
    process.exit(1);
  }

  const species = JSON.parse(readFileSync(INPUT_FILE, "utf-8"));
  console.log(`Generating LLM prompts for ${species.length} species...`);

  const lines = [];
  const manifest = [];

  for (let i = 0; i < species.length; i++) {
    const sp = species[i];
    const requestId = `species-${i.toString().padStart(4, "0")}`;

    // OpenAI Batch API format
    const request = {
      custom_id: requestId,
      method: "POST",
      url: "/v1/chat/completions",
      body: {
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 500,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(sp) },
        ],
      },
    };

    lines.push(JSON.stringify(request));
    manifest.push({
      request_id: requestId,
      scientific_name: sp.scientific_name,
      common_name: sp.common_name,
    });
  }

  writeFileSync(OUTPUT_JSONL, lines.join("\n") + "\n");
  writeFileSync(OUTPUT_MANIFEST, JSON.stringify(manifest, null, 2));

  console.log(`\nGenerated ${lines.length} prompts`);
  console.log(`Prompts:  ${OUTPUT_JSONL}`);
  console.log(`Manifest: ${OUTPUT_MANIFEST}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Upload ${OUTPUT_JSONL} to OpenAI Batch API`);
  console.log(`  2. Download results when complete`);
  console.log(`  3. Save results to data/llm-results.jsonl`);
  console.log(`  4. Run step 06 to process results`);
}

main();
