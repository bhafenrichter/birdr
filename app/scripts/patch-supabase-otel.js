/**
 * Patches @supabase/supabase-js to remove the dynamic import() of
 * @opentelemetry/api which Hermes cannot parse.
 * Run via postinstall.
 */
const fs = require("fs");
const path = require("path");
const glob = require("path");

const root = path.resolve(__dirname, "..", "node_modules", "@supabase");

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  // Match any dynamic import referencing opentelemetry
  const patched = content
    .replace(/import\(`@opentelemetry\/api`\)/g, "Promise.resolve({})")
    .replace(/import\(`@opentelemetry\/api`\)/g, "Promise.resolve({})")
    .replace(/import\(\/\*[^*]*\*\/\s*\/\*[^*]*\*\/\s*\/\*[^*]*\*\/\s*OTEL_PKG\)/g, "Promise.resolve({})");

  if (patched !== content) {
    fs.writeFileSync(filePath, patched, "utf8");
    console.log(`Patched: ${path.relative(process.cwd(), filePath)}`);
  }
}

// Recursively find all .js files under @supabase
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".js")) patchFile(full);
  }
}

walk(root);
