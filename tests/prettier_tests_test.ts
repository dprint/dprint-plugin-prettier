// A test that CI runs apart from the others (`deno task test:prettier`), which runs the format tests of prettier's repository, at the version
// that the plugin has, with prettier from npm and with target/plugin.wasm, each with the options of its test, and
// checks that they come out the same. The repository and what its tests import go in target/prettier-tests, and
// the cases that differ are written to target/prettier-tests/diffs as `<case>.prettier` and `<case>.plugin`.
import { assert } from "@std/assert";
import $ from "dax";
import type { CaseResult, TestCase } from "./prettier_tests_worker.ts";

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const testsDir = rootDir.join("target/prettier-tests");
const version = rootDir.join("prettier/package.json").readJsonSync<{ version: string }>().version;
// what the format.test.js files import, at the versions that prettier's repository has
const testDependencies = [
  "outdent",
  "esm-utils",
  "commonmark-test-suite",
  "gfm-test-suite",
  "graphql-test-suite",
  "json-test-suite",
  "jsx-test-suite",
  "less-test-suite",
  "yaml-test-suite",
];

Deno.test({
  name: `prettier ${version}`,
  // the workers are only stopped once all is done
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const repoDir = await cloneRepo();
    await installTestDependencies(repoDir);
    const casesPath = testsDir.join("cases.json");
    $.logStep("Collecting", "the format tests");
    const summary = await $`node ${rootDir.join("tests/prettier_tests_collect.mjs")} ${repoDir} ${casesPath}`.json();
    for (const spec of summary.unimportable) {
      $.logWarn("Left out", spec);
    }
    const cases = casesPath.readJsonSync<TestCase[]>();
    const pool = new WorkerPool();
    let results: CaseResult[];
    try {
      results = await pool.formatAll(cases);
    } finally {
      pool.terminate();
    }
    const differing = results.filter(result => !result.same);
    const diffsDir = testsDir.join("diffs");
    if (diffsDir.existsSync()) {
      diffsDir.removeSync({ recursive: true });
    }
    for (const result of differing) {
      const fileName = `${result.name} [${result.parser}]`.replace(/[\\/:*?"<>|# ]+/g, "_");
      diffsDir.mkdirSync({ recursive: true });
      diffsDir.join(fileName + ".prettier").writeTextSync(result.expected);
      diffsDir.join(fileName + ".plugin").writeTextSync(result.actual);
    }
    $.log(`${cases.length} cases, ${differing.length} differ, ${summary.skipped} fixtures left out`);
    assert(
      differing.length === 0,
      `${differing.length} of ${cases.length} cases differ (see ${diffsDir}):\n`
        + differing.slice(0, 20).map(result => `  ${result.name} [${result.parser}]`).join("\n"),
    );
  },
});

/** Formats cases on as many workers as there are processors, each with prettier and its own plugin. */
class WorkerPool {
  #workers: Worker[] = [];

  constructor() {
    const wasmModule = new WebAssembly.Module(
      rootDir.join("target/plugin.wasm").readBytesSync() as Uint8Array<ArrayBuffer>,
    );
    for (let i = 0; i < navigator.hardwareConcurrency; i++) {
      const worker = new Worker(new URL("./prettier_tests_worker.ts", import.meta.url), { type: "module" });
      worker.postMessage({ wasmModule });
      this.#workers.push(worker);
    }
  }

  formatAll(cases: TestCase[]): Promise<CaseResult[]> {
    const results: CaseResult[] = [];
    let next = 0;
    return new Promise((resolve, reject) => {
      const sendNext = (worker: Worker) => {
        if (next < cases.length) {
          worker.postMessage(cases[next++]);
        }
      };
      for (const worker of this.#workers) {
        worker.onmessage = (event: MessageEvent<CaseResult>) => {
          results.push(event.data);
          if (results.length === cases.length) {
            resolve(results);
          } else {
            sendNext(worker);
          }
        };
        worker.onerror = event => reject(event.error ?? new Error(event.message));
        sendNext(worker);
      }
      if (cases.length === 0) {
        resolve(results);
      }
    });
  }

  terminate() {
    for (const worker of this.#workers) {
      worker.terminate();
    }
  }
}

/** Clones prettier's repository at the version the first time, without its history. */
async function cloneRepo() {
  const repoDir = testsDir.join(`prettier-${version}`);
  if (repoDir.join(".git").existsSync()) {
    return repoDir;
  }
  $.logStep("Cloning", `prettier at ${version}`);
  const partialDir = testsDir.join(`prettier-${version}.partial`);
  if (partialDir.existsSync()) {
    partialDir.removeSync({ recursive: true });
  }
  partialDir.mkdirSync({ recursive: true });
  await $`git init --quiet`.cwd(partialDir);
  await $`git config core.longpaths true`.cwd(partialDir);
  await $`git fetch --quiet --depth 1 https://github.com/prettier/prettier ${version}`.cwd(partialDir);
  await $`git checkout --quiet FETCH_HEAD`.cwd(partialDir);
  partialDir.renameSync(repoDir);
  return repoDir;
}

/**
 * Installs what the format.test.js files import, which is only a few of the packages of prettier's repository, in
 * a folder of their own that the repository's node_modules links to.
 */
async function installTestDependencies(repoDir: ReturnType<typeof testsDir.join>) {
  const depsDir = testsDir.join("deps");
  const linkPath = repoDir.join("node_modules");
  if (linkPath.existsSync()) {
    return;
  }
  const repoPackage = repoDir.join("package.json").readJsonSync<{
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>();
  const all = { ...repoPackage.devDependencies, ...repoPackage.dependencies };
  const dependencies = Object.fromEntries(testDependencies.map(name => [name, all[name] ?? "*"]));
  depsDir.mkdirSync({ recursive: true });
  depsDir.join("package.json").writeJsonPrettySync({ private: true, dependencies });
  $.logStep("Installing", "what prettier's format tests import");
  await $`npm install --ignore-scripts --no-audit --no-fund`.cwd(depsDir).quiet();
  Deno.symlinkSync(depsDir.join("node_modules").toString(), linkPath.toString(), {
    type: Deno.build.os === "windows" ? "junction" : "dir",
  });
}
