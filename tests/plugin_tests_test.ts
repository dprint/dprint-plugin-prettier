// A test that CI runs apart from the others (`deno task test:plugins`), which checks the Prettier plugins that the
// plugin includes against the same plugins on Prettier from npm (plugins/package.json): the tests of
// prettier-plugin-svelte and prettier-plugin-jsdoc at the versions that the plugin has, and Prettier's own format tests
// of JavaScript with prettier-plugin-jsdoc, which `deno task test:prettier` collects first. The repositories go in
// target/plugin-tests, and the cases that differ are written to target/plugin-tests/diffs as `<case>.prettier` and
// `<case>.plugin`.
import { assert } from "@std/assert";
import $ from "dax";
import type { PluginCaseResult, PluginTestCase } from "./plugin_tests_worker.ts";

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const testsDir = rootDir.join("target/plugin-tests");
const lock = rootDir.join("plugins/package-lock.json").readJsonSync<{
  packages: Record<string, { version: string }>;
}>();
const repos = [
  {
    name: "prettier-plugin-svelte",
    url: "https://github.com/sveltejs/prettier-plugin-svelte",
    ref: `prettier-plugin-svelte@${versionOf("prettier-plugin-svelte")}`,
  },
  {
    name: "prettier-plugin-jsdoc",
    url: "https://github.com/hosseinmd/prettier-plugin-jsdoc",
    // the commit that the version was published from, as the repository has no tag for it
    ref: await $`npm view prettier-plugin-jsdoc@${versionOf("prettier-plugin-jsdoc")} gitHead`.text(),
  },
];

Deno.test({
  name: "prettier plugins",
  // the workers are only stopped once all is done
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    const prettierCases = rootDir.join("target/prettier-tests/cases.json");
    assert(prettierCases.existsSync(), "Run `deno task test:prettier` first, which collects Prettier's format tests.");
    if (!rootDir.join("plugins/node_modules").existsSync()) {
      $.logStep("Installing", "the Prettier plugins");
      await $`npm ci --ignore-scripts`.cwd(rootDir.join("plugins"));
    }
    for (const repo of repos) {
      await cloneRepo(repo);
    }
    const casesPath = testsDir.join("cases.json");
    $.logStep("Collecting", "the plugins' tests with what Prettier gives for them");
    await $`node ${rootDir.join("tests/plugin_tests_collect.mjs")} ${testsDir} ${prettierCases} ${casesPath}`.quiet();
    const cases = casesPath.readJsonSync<PluginTestCase[]>();
    const pool = new WorkerPool();
    let results: PluginCaseResult[];
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
    $.log(`${cases.length} cases, ${differing.length} differ`);
    assert(
      differing.length === 0,
      `${differing.length} of ${cases.length} cases differ (see ${diffsDir}):\n`
        + differing.slice(0, 20).map(result => `  ${result.name} [${result.parser}]`).join("\n"),
    );
  },
});

function versionOf(name: string) {
  return lock.packages[`node_modules/${name}`].version;
}

/** Formats cases on as many workers as there are processors, each with its own plugin. */
class WorkerPool {
  #workers: Worker[] = [];

  constructor() {
    const wasmModule = new WebAssembly.Module(
      rootDir.join("target/plugin.wasm").readBytesSync() as Uint8Array<ArrayBuffer>,
    );
    for (let i = 0; i < navigator.hardwareConcurrency; i++) {
      const worker = new Worker(new URL("./plugin_tests_worker.ts", import.meta.url), { type: "module" });
      worker.postMessage({ wasmModule });
      this.#workers.push(worker);
    }
  }

  formatAll(cases: PluginTestCase[]): Promise<PluginCaseResult[]> {
    const results: PluginCaseResult[] = [];
    let next = 0;
    return new Promise((resolve, reject) => {
      const sendNext = (worker: Worker) => {
        if (next < cases.length) {
          worker.postMessage(cases[next++]);
        }
      };
      for (const worker of this.#workers) {
        worker.onmessage = (event: MessageEvent<PluginCaseResult>) => {
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

/** Clones a plugin's repository at a ref the first time, without its history. */
async function cloneRepo(repo: { name: string; url: string; ref: string }) {
  const repoDir = testsDir.join(repo.name);
  if (repoDir.join(".git").existsSync()) {
    return;
  }
  $.logStep("Cloning", `${repo.name} at ${repo.ref}`);
  const partialDir = testsDir.join(`${repo.name}.partial`);
  if (partialDir.existsSync()) {
    partialDir.removeSync({ recursive: true });
  }
  partialDir.mkdirSync({ recursive: true });
  await $`git init --quiet`.cwd(partialDir);
  await $`git fetch --quiet --depth 1 ${repo.url} ${repo.ref}`.cwd(partialDir);
  await $`git checkout --quiet FETCH_HEAD`.cwd(partialDir);
  partialDir.renameSync(repoDir);
}
