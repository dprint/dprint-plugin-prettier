// evaluates prettier's `*.evaluate.js` files as its own build does and writes what they export to
// `src/generated`, which `src/nts.json` puts in their place:
//   node scripts/generate.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "prettier/src");
const outDir = path.join(root, "src/generated");
// these are compiled from their source since they are typed and only build the options
const compiled = new Set(["common/common-options.evaluate.js", "main/core-options.evaluate.js"]);

const files = fs.readdirSync(sourceDir, { recursive: true })
  .map((file) => file.replaceAll("\\", "/"))
  .filter((file) => file.endsWith(".evaluate.js") && !/^(cli|experimental-cli)\//.test(file) && !compiled.has(file))
  .sort();

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir);
const replace = {};
for (const file of files) {
  const module = await import(pathToFileURL(path.join(sourceDir, file)).href);
  const name = generatedName(file);
  fs.writeFileSync(path.join(outDir, name), serializeModule(module));
  replace[`../prettier/src/${file}`] = `./generated/${name}`;
}

// keeps the replacements of `src/nts.json` that are not of the generated files
const configPath = path.join(root, "src/nts.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
for (const [from, to] of Object.entries(config.replace)) {
  if (!to.startsWith("./generated/")) replace[from] = to;
}
config.replace = replace;
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
console.log(`generated ${files.length} files`);

/**
 * Names the generated file of `language-html/utilities/html-tags.evaluate.js` `html-html-tags.js`.
 * @param {string} file
 */
function generatedName(file) {
  const [dir] = file.split("/");
  const prefix = dir.replace(/^language-/, "");
  return `${prefix}-${path.basename(file, ".evaluate.js")}.js`;
}

/** @param {Record<string, unknown>} module */
function serializeModule(module) {
  const counts = new Map();
  for (const value of Object.values(module)) countReferences(value, counts);
  const shared = new Map();
  const lines = [];
  const write = (value) => serialize(value, counts, shared, lines);
  const exports = [];
  for (const [name, value] of Object.entries(module)) {
    const text = write(value);
    exports.push(name === "default" ? `export default ${text};` : `export const ${name} = ${text};`);
  }
  return [...lines, ...exports].join("\n") + "\n";
}

/**
 * Counts how often each object is referenced so that objects referenced more than once stay shared.
 * @param {unknown} value
 * @param {Map<object, number>} counts
 */
function countReferences(value, counts) {
  if (typeof value !== "object" || value === null || value instanceof RegExp) return;
  const count = counts.get(value) ?? 0;
  counts.set(value, count + 1);
  if (count > 0) return;
  const children = value instanceof Map ? [...value].flat() : value instanceof Set ? [...value] : Object.values(value);
  for (const child of children) countReferences(child, counts);
}

/**
 * @param {unknown} value
 * @param {Map<object, number>} counts
 * @param {Map<object, string>} shared
 * @param {string[]} lines
 * @returns {string}
 */
function serialize(value, counts, shared, lines) {
  if (value === undefined) return "undefined";
  if (typeof value === "number") return Object.is(value, -0) ? "-0" : String(value);
  if (typeof value === "string" || typeof value === "boolean" || value === null) return JSON.stringify(value);
  if (value instanceof RegExp) return `/${value.source}/${value.flags}`;
  if (typeof value !== "object") throw new Error(`cannot serialize ${typeof value}`);
  const existing = shared.get(value);
  if (existing !== undefined) return existing;
  const write = (child) => serialize(child, counts, shared, lines);
  let text;
  if (value instanceof Map) {
    text = `new Map([${[...value].map(([key, item]) => `[${write(key)}, ${write(item)}]`).join(", ")}])`;
  } else if (value instanceof Set) {
    text = `new Set([${[...value].map(write).join(", ")}])`;
  } else if (Array.isArray(value)) {
    text = `[${value.map(write).join(", ")}]`;
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) throw new Error("cannot serialize a class instance");
    text = `{ ${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}: ${write(item)}`).join(", ")} }`;
  }
  if (counts.get(value) > 1) {
    const name = `shared${shared.size}`;
    lines.push(`const ${name} = ${text};`);
    shared.set(value, name);
    return name;
  }
  return text;
}
