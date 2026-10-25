// Collects the tests of the Prettier plugins that the plugin includes, with what Prettier from npm gives for each of
// them with the plugin, for tests/plugin_tests_test.ts to check target/plugin.wasm against:
//
// - prettier-plugin-svelte: every sample of its printer and formatting tests, with the options of the test, including
//   those that the tests skip.
// - prettier-plugin-jsdoc: everything its tests format, including what they format again of what formatting gave, and
//   every case of Prettier's own format tests that a parser of JavaScript formats (target/prettier-tests/cases.json,
//   which `deno task test:prettier` writes), with the plugin.
//
// It also checks that the plugins' tests pass on Prettier from npm, so that giving what it gives is formatting as the
// tests expect, and writes the tests that don't pass to the output as `failedTests`.
//
// Prettier and the plugins are those of plugins/package.json, which is what the plugin is compiled from.
//   node plugin_tests_collect.mjs <folder of the plugins' repositories> <prettier's cases.json> <out.json>
// Runs on Node.js, which the plugins' tests are written for.
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import util from "node:util";

const [testsDir, prettierCasesPath, outPath] = process.argv.slice(2).map(arg => path.resolve(arg));
const rootDir = path.resolve(import.meta.dirname, "..");
const modulesDir = path.join(rootDir, "plugins/node_modules");
const importModule = (file) => import(url.pathToFileURL(path.join(modulesDir, file)).href);
const prettier = await importModule("prettier/index.mjs");
const sveltePlugin = await importModule("prettier-plugin-svelte/plugin.js");
const jsDocPlugin = await importModule("prettier-plugin-jsdoc/dist/index.js");
const ts =
  (await import(url.pathToFileURL(path.join(rootDir, "prettier/node_modules/typescript/lib/typescript.js")).href))
    .default;
// the parsers of JavaScript whose comments prettier-plugin-jsdoc formats
const jsDocParsers = new Set(["babel", "babel-flow", "babel-ts", "flow", "typescript"]);
const snapshotsByFile = new Map();

const failedTests = [];
const cases = [
  ...collectSvelteCases(path.join(testsDir, "prettier-plugin-svelte")),
  ...await collectJsDocCases(path.join(testsDir, "prettier-plugin-jsdoc"), failedTests),
  ...collectPrettierJsDocCases(prettierCasesPath),
];
for (const testCase of cases) {
  testCase.expected = await formatWithPrettier(testCase);
  if (testCase.testExpects !== undefined && testCase.expected !== testCase.testExpects) {
    failedTests.push(testCase.name);
  }
  delete testCase.testExpects;
}
fs.writeFileSync(outPath, JSON.stringify({ cases, failedTests }));
console.log(JSON.stringify({ cases: cases.length, failedTests: failedTests.length }));

/**
 * The printer samples, which are their own output, and the input and output of the formatting samples, with what the
 * tests expect of them. The samples that the tests skip are in too, without what the tests expect.
 */
function collectSvelteCases(repoDir) {
  const cases = [];
  const printerDir = path.join(repoDir, "test/printer/samples");
  for (const file of fs.readdirSync(printerDir)) {
    const match = /^(.*)\.(html|md)(\.skip)?$/.exec(file);
    if (match == null) {
      continue;
    }
    const [, name, ending, skip] = match;
    const options = readOptions(path.join(printerDir, `${name}.options.json`));
    const input = readText(path.join(printerDir, file));
    cases.push({
      name: `svelte printer: ${file}`,
      filePath: `${name}.${ending === "html" ? "svelte" : "md"}`,
      options: { parser: ending === "html" ? "svelte" : "markdown", tabWidth: 4, ...options },
      input,
      jsDoc: false,
      testExpects: skip == null ? input : undefined,
    });
  }
  const formattingDir = path.join(repoDir, "test/formatting/samples");
  for (const dir of fs.readdirSync(formattingDir)) {
    const skip = dir.endsWith(".skip");
    const options = readOptions(path.join(formattingDir, dir, "options.json"));
    delete options.expectSyntaxErrors;
    const output = readText(path.join(formattingDir, dir, "output.html"));
    for (const file of ["input.html", "output.html"]) {
      cases.push({
        name: `svelte formatting: ${dir}/${file}`,
        filePath: `${dir.replace(/\.skip$/, "")}.svelte`,
        options: { parser: "svelte", tabWidth: 4, ...options },
        input: readText(path.join(formattingDir, dir, file)),
        jsDoc: false,
        // the test formats the input, and formats again what that gives, which is the output
        testExpects: skip ? undefined : output,
      });
    }
  }
  return cases;
}

/**
 * Runs the tests of prettier-plugin-jsdoc on Prettier from npm, checking what they expect against their snapshots, and
 * takes every text that they format with only the plugin or with no plugin as a case. That includes what a test formats
 * again of what formatting gave it. The tests that fail are added to `failedTests`, except those that give other
 * plugins, which also run the command line with packages that aren't installed here.
 */
async function collectJsDocCases(repoDir, failedTests) {
  const calls = [];
  const tests = [];
  const describeNames = [];
  let currentTest;
  let snapshotFile;
  // as in Jest, a test file's snapshots are counted by the name of the test, which more than one test can have
  let snapshotCounts;
  globalThis.__pluginTestsPrettier = {
    format: (input, options) => {
      const plugins = (options.plugins ?? []).map(plugin =>
        plugin === "prettier-plugin-jsdoc"
          ? jsDocPlugin
          : plugin.startsWith("./")
          ? url.pathToFileURL(path.join(repoDir, plugin)).href
          : plugin
      );
      if (plugins.some(plugin => plugin !== jsDocPlugin)) {
        currentTest.otherPlugins = true;
      } else {
        calls.push({ input, options });
      }
      return prettier.format(input, { ...options, plugins });
    },
  };
  globalThis.describe = (name, fn) => {
    if (name === "CLI Compatibility") {
      // runs Prettier's command line with prettier-plugin-tailwindcss, which isn't installed here
      return;
    }
    describeNames.push(name);
    try {
      fn();
    } finally {
      describeNames.pop();
    }
  };
  globalThis.test = globalThis.it = (name, fn) => tests.push({ name: [...describeNames, name].join(" "), fn });
  globalThis.test.only = globalThis.test;
  globalThis.test.skip = () => {};
  globalThis.beforeEach =
    globalThis.afterEach =
    globalThis.beforeAll =
    globalThis.afterAll =
      () => {};
  globalThis.expect = received => createMatchers(received, false);
  const previousDir = process.cwd();
  process.chdir(repoDir);
  try {
    const testsDir = path.join(repoDir, "tests");
    for (const file of fs.readdirSync(testsDir).filter(file => file.endsWith(".test.ts")).sort()) {
      const source = fs.readFileSync(path.join(testsDir, file), "utf8");
      const js = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText
        .replace(/import \* as prettier from "prettier";/, "const prettier = globalThis.__pluginTestsPrettier;")
        .replace(/import \{ format \} from "prettier";/, "const { format } = globalThis.__pluginTestsPrettier;")
        .replace(/import "jest-specific-snapshot";/, "");
      tests.length = 0;
      snapshotCounts = new Map();
      snapshotFile = path.join(testsDir, "__snapshots__", `${file}.snap`);
      await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
      for (const test of tests) {
        currentTest = { name: test.name, otherPlugins: false };
        try {
          await test.fn();
        } catch {
          if (!currentTest.otherPlugins) {
            failedTests.push(`jsdoc ${file}: ${test.name}`);
          }
        }
      }
    }
  } finally {
    process.chdir(previousDir);
  }
  const cases = [];
  const seen = new Set();
  for (const { input, options } of calls) {
    const { plugins = [], filepath, ...rest } = options;
    const jsDoc = plugins.length > 0;
    const key = JSON.stringify([input, rest, filepath, jsDoc]);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    cases.push({
      name: `jsdoc test ${cases.length}`,
      filePath: filepath == null ? undefined : path.basename(filepath),
      options: rest,
      input,
      jsDoc,
    });
  }
  return cases;

  // the matchers of Jest that the tests use
  function createMatchers(received, negated) {
    const check = (pass, matcher) => {
      if (pass === negated) {
        throw new Error(`expect(...)${negated ? ".not" : ""}.${matcher} failed`);
      }
    };
    const matchSnapshot = (file, matcher, escape) => {
      const countKey = JSON.stringify([file, currentTest.name]);
      const count = (snapshotCounts.get(countKey) ?? 0) + 1;
      snapshotCounts.set(countKey, count);
      const key = `${currentTest.name} ${count}`;
      check(readSnapshots(file)[key] === serializeForSnapshot(received, escape), `${matcher} of \`${key}\``);
    };
    return {
      get not() {
        return createMatchers(received, !negated);
      },
      toBe: expected => check(Object.is(received, expected), "toBe"),
      toEqual: expected => check(util.isDeepStrictEqual(received, expected), "toEqual"),
      toContain: expected => check(received.includes(expected), "toContain"),
      toMatch: expected =>
        check(typeof expected === "string" ? received.includes(expected) : expected.test(received), "toMatch"),
      toBeDefined: () => check(received !== undefined, "toBeDefined"),
      toMatchSnapshot: () => matchSnapshot(snapshotFile, "toMatchSnapshot", false),
      // jest-specific-snapshot writes with the old default of escaping quotes and backslashes
      toMatchSpecificSnapshot: file =>
        matchSnapshot(path.resolve(repoDir, "tests", file), "toMatchSpecificSnapshot", true),
    };
  }
}

/** Prettier's own cases of the parsers of JavaScript, formatted with prettier-plugin-jsdoc. */
function collectPrettierJsDocCases(casesPath) {
  return JSON.parse(fs.readFileSync(casesPath, "utf8"))
    .filter(testCase => jsDocParsers.has(testCase.options.parser))
    .map(testCase => ({ ...testCase, name: `jsdoc prettier: ${testCase.name}`, jsDoc: true }));
}

async function formatWithPrettier(testCase) {
  // as tests/prettier_tests_worker.ts gives Prettier a case
  const options = Object.fromEntries(
    Object.entries(testCase.options).map(([key, value]) => [key, value === "Infinity" ? Infinity : value]),
  );
  try {
    return await prettier.format(testCase.input.replace(/^﻿/, ""), {
      ...options,
      filepath: testCase.filePath ?? "snippet",
      plugins: [testCase.jsDoc ? jsDocPlugin : sveltePlugin],
    });
  } catch (error) {
    return "error: " + String(error);
  }
}

function readOptions(filePath) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, "utf8")) : {};
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/\r?\n/g, "\n");
}

/** The snapshots of a file of Jest snapshots by their keys, which are the name of the test and a count. */
function readSnapshots(filePath) {
  let snapshots = snapshotsByFile.get(filePath);
  if (snapshots == null) {
    snapshots = {};
    if (fs.existsSync(filePath)) {
      new Function("exports", fs.readFileSync(filePath, "utf8"))(snapshots);
    }
    snapshotsByFile.set(filePath, snapshots);
  }
  return snapshots;
}

/** A text as Jest 29 writes it in a snapshot, which is all the tests compare to their snapshots. */
function serializeForSnapshot(value, escape) {
  const normalized = String(value).replace(/\r\n|\r/g, "\n");
  const text = `"${escape ? normalized.replace(/["\\]/g, "\\$&") : normalized}"`;
  return text.includes("\n") ? `\n${text}\n` : text;
}
