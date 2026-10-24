// Collects the tests of the Prettier plugins that the plugin includes, with what Prettier from npm gives for each of
// them with the plugin, for tests/plugin_tests_test.ts to check target/plugin.wasm against:
//
// - prettier-plugin-svelte: every sample of its printer and formatting tests, with the options of the test.
// - prettier-plugin-jsdoc: what its tests format, and every case of Prettier's own format tests that a parser of
//   JavaScript formats (target/prettier-tests/cases.json, which `deno task test:prettier` writes), with the plugin.
//
// Prettier and the plugins are those of plugins/package.json, which is what the plugin is compiled from.
//   node plugin_tests_collect.mjs <folder of the plugins' repositories> <prettier's cases.json> <out.json>
// Runs on Node.js, which the plugins' tests are written for.
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const [testsDir, prettierCasesPath, outPath] = process.argv.slice(2).map(arg => path.resolve(arg));
const rootDir = path.resolve(import.meta.dirname, "..");
const modulesDir = path.join(rootDir, "plugins/node_modules");
const importModule = (file) => import(url.pathToFileURL(path.join(modulesDir, file)).href);
const prettier = await importModule("prettier/index.mjs");
const sveltePlugin = await importModule("prettier-plugin-svelte/plugin.js");
const jsDocPlugin = await importModule("prettier-plugin-jsdoc/dist/index.js");
const ts = (await import(url.pathToFileURL(path.join(rootDir, "prettier/node_modules/typescript/lib/typescript.js")).href))
  .default;
// the parsers of JavaScript whose comments prettier-plugin-jsdoc formats
const jsDocParsers = new Set(["babel", "babel-flow", "babel-ts", "flow", "typescript"]);

const cases = [
  ...collectSvelteCases(path.join(testsDir, "prettier-plugin-svelte")),
  ...await collectJsDocCases(path.join(testsDir, "prettier-plugin-jsdoc")),
  ...collectPrettierJsDocCases(prettierCasesPath),
];
for (const testCase of cases) {
  testCase.expected = await formatWithPrettier(testCase);
}
fs.writeFileSync(outPath, JSON.stringify(cases));
console.log(JSON.stringify({ cases: cases.length }));

/** The printer samples, which are their own output, and the input and output of the formatting samples. */
function collectSvelteCases(repoDir) {
  const cases = [];
  const printerDir = path.join(repoDir, "test/printer/samples");
  for (const file of fs.readdirSync(printerDir)) {
    const ending = /\.(html|md)$/.exec(file)?.[1];
    if (ending == null) {
      continue;
    }
    const options = readOptions(path.join(printerDir, file.replace(/\.(html|md)$/, ".options.json")));
    cases.push({
      name: `svelte printer: ${file}`,
      filePath: file.replace(/\.html$/, ".svelte"),
      options: { parser: ending === "html" ? "svelte" : "markdown", tabWidth: 4, ...options },
      input: readText(path.join(printerDir, file)),
      jsDoc: false,
    });
  }
  const formattingDir = path.join(repoDir, "test/formatting/samples");
  for (const dir of fs.readdirSync(formattingDir)) {
    if (dir.endsWith(".skip")) {
      continue;
    }
    const options = readOptions(path.join(formattingDir, dir, "options.json"));
    delete options.expectSyntaxErrors;
    for (const file of ["input.html", "output.html"]) {
      const filePath = path.join(formattingDir, dir, file);
      if (fs.existsSync(filePath)) {
        cases.push({
          name: `svelte formatting: ${dir}/${file}`,
          filePath: `${dir}.svelte`,
          options: { parser: "svelte", tabWidth: 4, ...options },
          input: readText(filePath),
          jsDoc: false,
        });
      }
    }
  }
  return cases;
}

/**
 * What the tests of prettier-plugin-jsdoc give `format`, found by running them with a `format` that writes down what
 * it is given. The tests that give other plugins are left out.
 */
async function collectJsDocCases(repoDir) {
  const calls = [];
  const tests = [];
  globalThis.__pluginTestsPrettier = {
    format: async (input, options) => {
      calls.push({ input, options });
      return input;
    },
  };
  globalThis.describe = (_name, fn) => fn();
  globalThis.test = globalThis.it = (_name, fn) => tests.push(fn);
  globalThis.test.only = globalThis.test;
  globalThis.test.skip = () => {};
  globalThis.beforeEach = globalThis.afterEach = globalThis.beforeAll = globalThis.afterAll = () => {};
  const matchers = new Proxy({}, { get: (_target, name) => name === "not" ? matchers : () => {} });
  globalThis.expect = () => matchers;
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
      await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
      for (const test of tests) {
        try {
          await test();
        } catch {
          // a test that runs the command line or checks what the real format gives
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
    if (plugins.some(plugin => plugin !== "prettier-plugin-jsdoc")) {
      continue;
    }
    const key = JSON.stringify([input, rest, filepath]);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    cases.push({
      name: `jsdoc test ${cases.length}`,
      filePath: filepath == null ? undefined : path.basename(filepath),
      options: rest,
      input,
      jsDoc: true,
    });
  }
  return cases;
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
