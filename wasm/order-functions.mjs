// names the functions of a module that NativeAOT-LLVM linked so that sorting them by name, which wasm-opt does with
// --reorder-functions-by-name, puts the ones that a profile gives (hot-functions.txt) first in the profile's order and
// keeps the rest in the order they were linked in. Code that runs together is then together in the code that wasmtime
// compiles, which makes formatting faster. The linker leaves out the names of functions, so they come from its map:
//   node order-functions.mjs <in.wasm> <link map> <hot functions> <out.wasm>
import fs from "node:fs";

const [inPath, mapPath, hotPath, outPath] = process.argv.slice(2);
const bytes = fs.readFileSync(inPath);
const sections = readSections(bytes);
const importedCount = countImportedFunctions(bytes, sections.find(s => s.id === 2));
const definedCount = readU32(bytes, sections.find(s => s.id === 3).start).value;
const linkedNames = readCodeNames(fs.readFileSync(mapPath, "utf8"));
if (linkedNames.length !== definedCount) {
  throw new Error(`The link map has ${linkedNames.length} functions and the module ${definedCount}.`);
}

const indexByName = new Map();
linkedNames.forEach((names, i) => {
  for (const name of names) if (!indexByName.has(name)) indexByName.set(name, i);
});
const rankByIndex = new Map();
const hotLines = fs.readFileSync(hotPath, "utf8").split("\n").map(line => line.trimEnd());
for (const name of hotLines.filter(line => line !== "" && !line.startsWith("#"))) {
  const i = indexByName.get(name);
  if (i != null && !rankByIndex.has(i)) rankByIndex.set(i, rankByIndex.size);
}

const entries = [];
for (let i = 0; i < definedCount; i++) {
  const rank = rankByIndex.get(i);
  const name = rank != null ? "!" + String(rank).padStart(6, "0") : "~" + String(i).padStart(7, "0");
  entries.push(u32(importedCount + i), vec(Buffer.from(name)));
}
const functionNames = Buffer.concat([u32(definedCount), ...entries]);
const nameContent = Buffer.concat([vec(Buffer.from("name")), Buffer.from([1]), vec(functionNames)]);
const kept = sections.filter(s => !(s.id === 0 && s.name === "name"));
fs.writeFileSync(outPath, Buffer.concat([
  bytes.subarray(0, 8),
  ...kept.map(s => bytes.subarray(s.headerStart, s.end)),
  Buffer.from([0]),
  vec(nameContent),
]));
console.log("functions", definedCount, "named first", rankByIndex.size);

/** Gives the sections of a module: their id, the custom ones' name, and where their header, content and end are. */
function readSections(bytes) {
  const sections = [];
  for (let at = 8; at < bytes.length;) {
    const headerStart = at;
    const id = bytes[at++];
    const size = readU32(bytes, at);
    const start = size.end;
    const section = { id, headerStart, start, end: start + size.value, name: null };
    if (id === 0) {
      const length = readU32(bytes, start);
      section.name = bytes.toString("utf8", length.end, length.end + length.value);
    }
    sections.push(section);
    at = section.end;
  }
  return sections;
}

/** Counts the functions that the import section imports, which come before the module's own in their indexes. */
function countImportedFunctions(bytes, section) {
  if (section == null) return 0;
  let count = 0;
  let at = section.start;
  const next = () => {
    const result = readU32(bytes, at);
    at = result.end;
    return result.value;
  };
  const skipLimits = () => {
    const flags = bytes[at++];
    next();
    if (flags & 1) next();
  };
  for (let n = next(); n > 0; n--) {
    // the module's name and then the import's
    for (let k = 0; k < 2; k++) {
      const length = next();
      at += length;
    }
    const kind = bytes[at++];
    if (kind === 0) {
      next();
      count++;
    } else if (kind === 1) {
      at++;
      skipLimits();
    } else if (kind === 2) {
      skipLimits();
    } else if (kind === 3) {
      at += 2;
    } else if (kind === 4) {
      at++;
      next();
    } else {
      throw new Error(`An import of kind ${kind} was not expected.`);
    }
  }
  return count;
}

/**
 * Gives the names of each function in the code section of a link map, in the order of the code. Each function is a
 * line of what it came from, eight spaces in from the section's line, followed by the names of its symbols, which
 * are eight spaces further in.
 */
function readCodeNames(map) {
  const functions = [];
  let inCode = false;
  for (const line of map.split("\n")) {
    const match = /^\s*\S+\s+[0-9a-f]+\s+[0-9a-f]+ ( *)(.*?)\r?$/.exec(line);
    if (match == null) continue;
    const indent = match[1].length;
    if (indent === 0) {
      inCode = match[2] === "CODE";
    } else if (inCode && indent === 8) {
      functions.push([]);
    } else if (inCode && indent === 16) {
      functions[functions.length - 1].push(match[2]);
    }
  }
  return functions;
}

function readU32(bytes, at) {
  let value = 0;
  let shift = 0;
  let byte;
  do {
    byte = bytes[at++];
    value += (byte & 0x7f) * 2 ** shift;
    shift += 7;
  } while (byte & 0x80);
  return { value, end: at };
}

function u32(value) {
  const out = [];
  do {
    let byte = value & 0x7f;
    value = Math.floor(value / 128);
    if (value !== 0) byte |= 0x80;
    out.push(byte);
  } while (value !== 0);
  return Buffer.from(out);
}

function vec(content) {
  return Buffer.concat([u32(content.length), content]);
}
