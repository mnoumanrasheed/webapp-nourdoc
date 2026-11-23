import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const css = readFileSync(join(projectRoot, "app", "globals.css"), "utf8");
const defined = new Set([...css.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)].map((match) => match[1]));
const used = new Set();

function files(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? files(path) : path.endsWith(".tsx") ? [path] : [];
  });
}

for (const file of [...files(join(projectRoot, "app")), ...files(join(projectRoot, "components"))]) {
  const source = readFileSync(file, "utf8");
  const patterns = [/className="([^"]+)"/g, /className='([^']+)'/g, /className=\{`([^`]+)`\}/g];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      for (const className of match[1].replace(/\$\{[^}]+\}/g, " ").split(/\s+/)) {
        if (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(className) && !className.endsWith("-")) used.add(className);
      }
    }
  }
}

const missing = [...used].filter((className) => !defined.has(className)).sort();
const dynamicClasses = new Set([
  "active", "amber", "brand-small", "chosen", "error", "mint", "primary-row-action",
  "selected", "sidebar-open", "status-approved", "status-processing", "status-review-pending",
  "workflow-approved", "workflow-draft", "workflow-needs_revision", "org", "w3",
]);
const unused = [...defined].filter((className) => !used.has(className) && !dynamicClasses.has(className)).sort();
if (missing.length) {
  console.error(`Missing CSS selectors for static classes: ${missing.join(", ")}`);
  process.exitCode = 1;
} else {
  console.log(`CSS audit passed: ${used.size} static classes have matching selectors in app/globals.css.`);
  if (unused.length) console.log(`Selectors requiring manual usage review: ${unused.join(", ")}`);
}
