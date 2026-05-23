/**
 * 01-download-taxonomy.js
 *
 * Downloads the eBird/Clements taxonomy CSV from Cornell Lab and saves it locally.
 * The Clements checklist is the authoritative source for bird taxonomy used by eBird.
 *
 * Output: data/clements-taxonomy.csv
 *
 * Usage: node 01-download-taxonomy.js
 */

import { createWriteStream, mkdirSync, existsSync } from "node:fs";
import { pipeline } from "node:stream/promises";

const DATA_DIR = new URL("../data/", import.meta.url).pathname;

// eBird/Clements taxonomy download URL
// This URL may change with new releases — check https://www.birds.cornell.edu/clementschecklist/download/
const TAXONOMY_URL =
  "https://www.birds.cornell.edu/clementschecklist/wp-content/uploads/2024/08/eBird-Clements-v2024-integrated-checklist-August-2024.csv";

const OUTPUT_FILE = `${DATA_DIR}clements-taxonomy.csv`;

async function main() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  console.log("Downloading eBird/Clements taxonomy CSV...");
  console.log(`URL: ${TAXONOMY_URL}`);

  const response = await fetch(TAXONOMY_URL);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const dest = createWriteStream(OUTPUT_FILE);
  await pipeline(response.body, dest);

  console.log(`Saved to ${OUTPUT_FILE}`);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Error downloading taxonomy:", err.message);
  console.error(
    "\nIf the URL has changed, check https://www.birds.cornell.edu/clementschecklist/download/"
  );
  console.error("and update TAXONOMY_URL in this script.");
  process.exit(1);
});
