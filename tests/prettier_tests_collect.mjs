// Collects the format tests of prettier's repository as tests/prettier_tests_test.ts runs them: each fixture with
// each parser that its format.test.js gives, with the options it gives, as prettier's own test runner makes them.
// Left out are the parsers of other packages (oxc, hermes, yuku), the fixtures that mark a cursor or a range,
// which dprint never gives a plugin, and the tests that give prettier plugins.
//   node prettier_tests_collect.mjs <prettier repository> <out.json>
// Runs on Node.js, since the format.test.js files are written for it.
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const [repoDir, outPath] = process.argv.slice(2);
const formatDir = path.join(repoDir, "tests/format") + path.sep;
const placeholders = ["<|>", "<<<PRETTIER_RANGE_START>>>", "<<<PRETTIER_RANGE_END>>>"];

const calls = [];
globalThis.runFormatTest = (rawFixtures, explicitParsers, rawOptions) => {
  calls.push({ rawFixtures, explicitParsers, rawOptions });
};
const unimportable = [];
for (const spec of findSpecs(formatDir)) {
  const before = calls.length;
  try {
    await import(url.pathToFileURL(spec).href);
  } catch (error) {
    // such as the tests of the cursor, which use what only jest has
    unimportable.push(`${path.relative(formatDir, spec)}: ${String(error.message).split("\n")[0]}`);
    calls.length = before;
  }
}

const cases = [];
let skipped = 0;
for (const { rawFixtures, explicitParsers, rawOptions } of calls) {
  const { importMeta, snippets = [] } = rawFixtures.importMeta ? rawFixtures : { importMeta: rawFixtures };
  const dirname = path.dirname(url.fileURLToPath(importMeta.url));
  if (rawOptions?.plugins) {
    skipped++;
    continue;
  }
  for (const fixture of getFixtures(dirname, snippets)) {
    if (placeholders.some((placeholder) => fixture.code.includes(placeholder))) {
      skipped++;
      continue;
    }
    for (const parser of getParsers(dirname, explicitParsers)) {
      const options = { ...rawOptions, parser };
      delete options.errors;
      cases.push({ name: fixture.name, filePath: fixture.filePath, options, input: fixture.code });
    }
  }
}
// JSON has no Infinity, which some tests give as the width
fs.writeFileSync(outPath, JSON.stringify(cases, (_key, value) => (value === Infinity ? "Infinity" : value)));
console.log(JSON.stringify({ cases: cases.length, skipped, unimportable }));

function findSpecs(dir) {
  const specs = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) specs.push(...findSpecs(full));
    else if (entry.name === "format.test.js") specs.push(full);
  }
  return specs;
}

// as tests/config/format-test/get-fixtures.js
function getFixtures(dirname, snippets) {
  const fixtures = [];
  for (const entry of fs.readdirSync(dirname, { withFileTypes: true })) {
    const name = entry.name;
    if (
      !entry.isFile() || name[0] === "." || name === "format.test.js" || name === "debug.log"
      || name.endsWith(".snap")
    ) {
      continue;
    }
    const filePath = path.join(dirname, name);
    fixtures.push({ name: path.relative(formatDir, filePath), filePath, code: fs.readFileSync(filePath, "utf8") });
  }
  for (const [index, snippet] of snippets.entries()) {
    const testCase = typeof snippet === "string" ? { code: snippet } : snippet;
    fixtures.push({
      name: `${path.relative(formatDir, dirname)} snippet #${index}`,
      filePath: typeof testCase.filename === "string" ? path.join(dirname, testCase.filename) : undefined,
      code: testCase.code,
    });
  }
  return fixtures;
}

// as tests/config/format-test/get-parsers.js, without the parsers of other packages
function getParsers(dirname, parsers) {
  const isLanguage = (language) =>
    dirname.startsWith(path.join(formatDir, language) + path.sep)
    || dirname === path.join(formatDir, language);
  const isErrorTest = dirname.includes(`${path.sep}_errors_${path.sep}`) || dirname.endsWith(`${path.sep}_errors_`);
  const all = [...parsers];
  const add = (...more) => {
    if (isErrorTest) return;
    for (const parser of more) if (!all.includes(parser)) all.push(parser);
  };
  if (parsers.includes("babel") && (isLanguage("js") || isLanguage("jsx"))) add("acorn", "espree", "meriyah");
  if (parsers.includes("typescript")) add("babel-ts");
  if (parsers.includes("babel")) add("__babel_estree");
  return all.filter((parser) => !/^(oxc|yuku|hermes)/.test(parser));
}
