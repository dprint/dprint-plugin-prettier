// An opt-in test (`deno task test:repos`) that formats the files of many codebases with prettier from npm
// and with target/plugin.wasm, then checks that they come out the same. The codebases are cloned into
// target/repos, and the files that differ are written to target/repos/diffs/<repo>/ as `<file>.prettier`
// and `<file>.plugin`. Set REPOS to a comma separated list of names to only test those.
import { createFromBuffer } from "@dprint/formatter";
import { assert } from "@std/assert";
import $, { type Path } from "dax";
import type { FileRequest, FileResult } from "./repos_worker.ts";

interface Repo {
  name: string;
  url: string;
  /** A tag or commit, so that the files stay the same between runs. */
  ref: string;
}

const repos: Repo[] = [
  // prettier's own tests have samples of every language and edge case that prettier handles
  { name: "prettier", url: "https://github.com/prettier/prettier", ref: "3.4.2" },
  { name: "vue", url: "https://github.com/vuejs/core", ref: "v3.5.13" },
  { name: "react", url: "https://github.com/facebook/react", ref: "v19.0.0" },
  { name: "bootstrap", url: "https://github.com/twbs/bootstrap", ref: "v5.3.3" },
  { name: "graphql-js", url: "https://github.com/graphql/graphql-js", ref: "v16.9.0" },
  { name: "typescript-eslint", url: "https://github.com/typescript-eslint/typescript-eslint", ref: "v8.18.0" },
  { name: "less", url: "https://github.com/less/less.js", ref: "v4.2.1" },
  { name: "ember", url: "https://github.com/emberjs/ember.js", ref: "v5.12.0" },
  { name: "vite", url: "https://github.com/vitejs/vite", ref: "v6.0.3" },
  { name: "html5-boilerplate", url: "https://github.com/h5bp/html5-boilerplate", ref: "v9.0.1" },
  { name: "angular", url: "https://github.com/angular/angular", ref: "19.0.0" },
  {
    name: "kubernetes-examples",
    url: "https://github.com/kubernetes/examples",
    ref: "d6b8cd27eacb51e651a1aa6f7c190a28713eff6e",
  },
  { name: "typescript", url: "https://github.com/microsoft/TypeScript", ref: "v5.7.2" },
  {
    name: "definitely-typed",
    url: "https://github.com/DefinitelyTyped/DefinitelyTyped",
    ref: "f24a0c1ca7e8c76ad3741f2532b1b19db393a77b",
  },
];

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const reposDir = rootDir.join("target/repos");
const selected = Deno.env.get("REPOS")?.split(",").map(name => name.trim());
const wasmBytes = rootDir.join("target/plugin.wasm").readBytesSync() as Uint8Array<ArrayBuffer>;
const extensions = getExtensions();
let pool: WorkerPool | undefined;

for (const repo of repos) {
  Deno.test({
    name: repo.name,
    ignore: selected != null && !selected.includes(repo.name),
    // the workers are kept for the next repo
    sanitizeOps: false,
    sanitizeResources: false,
    async fn() {
      const repoDir = await cloneRepo(repo);
      const filePaths = collectFiles(repoDir);
      pool ??= new WorkerPool();
      const results = await pool.formatAll(filePaths);
      const differing = results.filter(result => !result.same);
      const diffsDir = reposDir.join("diffs", repo.name);
      if (diffsDir.existsSync()) {
        diffsDir.removeSync({ recursive: true });
      }
      for (const result of differing) {
        const relativePath = repoDir.relative(result.filePath);
        diffsDir.join(relativePath).parentOrThrow().mkdirSync({ recursive: true });
        diffsDir.join(relativePath + ".prettier").writeTextSync(result.expected);
        diffsDir.join(relativePath + ".plugin").writeTextSync(result.actual);
      }
      const slow = results.filter(isSlow);
      $.log(`${repo.name}: ${filePaths.length} files, ${differing.length} differ, ${slow.length} slow`);
      assert(
        differing.length === 0,
        `${differing.length} of ${filePaths.length} files differ (see ${diffsDir}):\n`
          + differing.slice(0, 20).map(result => `  ${repoDir.relative(result.filePath)}`).join("\n"),
      );
      assert(
        slow.length === 0,
        `${slow.length} files are much slower to format than with prettier:\n`
          + slow.slice(0, 20).map(result =>
            `  ${repoDir.relative(result.filePath)} (${Math.round(result.pluginMs)}ms vs ${
              Math.round(result.prettierMs)
            }ms)`
          ).join("\n"),
      );
    },
  });
}

globalThis.addEventListener("unload", () => pool?.terminate());

/** Formats files on as many workers as there are processors, each with prettier and its own plugin. */
class WorkerPool {
  #workers: Worker[] = [];

  constructor() {
    const wasmModule = new WebAssembly.Module(wasmBytes);
    for (let i = 0; i < navigator.hardwareConcurrency; i++) {
      const worker = new Worker(new URL("./repos_worker.ts", import.meta.url), { type: "module" });
      worker.postMessage({ wasmModule });
      this.#workers.push(worker);
    }
  }

  formatAll(filePaths: Path[]): Promise<FileResult[]> {
    const results: FileResult[] = [];
    let next = 0;
    return new Promise((resolve, reject) => {
      const sendNext = (worker: Worker) => {
        if (next < filePaths.length) {
          worker.postMessage({ filePath: filePaths[next++].toString() } satisfies FileRequest);
        }
      };
      for (const worker of this.#workers) {
        worker.onmessage = (event: MessageEvent<FileResult>) => {
          results.push(event.data);
          if (results.length === filePaths.length) {
            resolve(results);
          } else {
            sendNext(worker);
          }
        };
        worker.onerror = event => reject(event.error ?? new Error(event.message));
        sendNext(worker);
      }
      if (filePaths.length === 0) {
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

// a file that takes the plugin far longer than prettier, which is how something that grows exponentially with
// the size of the file shows up, with room for what the workers that share the machine slow either one down
function isSlow(result: FileResult) {
  return result.pluginMs > 2000 && result.pluginMs > result.prettierMs * 20;
}

/** Clones the repo at its ref into target/repos the first time, without its history. */
async function cloneRepo(repo: Repo) {
  const repoDir = reposDir.join(repo.name);
  if (repoDir.join(".git").existsSync()) {
    return repoDir;
  }
  $.logStep("Cloning", `${repo.url} at ${repo.ref}`);
  const partialDir = reposDir.join(repo.name + ".partial");
  if (partialDir.existsSync()) {
    partialDir.removeSync({ recursive: true });
  }
  partialDir.mkdirSync({ recursive: true });
  await $`git init --quiet`.cwd(partialDir);
  // long paths are in some repos, which Windows only allows with this
  await $`git config core.longpaths true`.cwd(partialDir);
  await $`git fetch --quiet --depth 1 ${repo.url} ${repo.ref}`.cwd(partialDir);
  await $`git checkout --quiet FETCH_HEAD`.cwd(partialDir);
  partialDir.renameSync(repoDir);
  return repoDir;
}

/** Gets the files of the repo that the plugin formats, leaving out what is installed and what git keeps. */
function collectFiles(dir: Path): Path[] {
  const filePaths: Path[] = [];
  for (const entry of dir.readDirSync()) {
    const path = dir.join(entry.name);
    if (entry.isDirectory) {
      if (entry.name !== ".git" && entry.name !== "node_modules") {
        filePaths.push(...collectFiles(path));
      }
    } else if (entry.isFile && extensions.has(getExtension(entry.name))) {
      filePaths.push(path);
    }
  }
  return filePaths;
}

function getExtensions() {
  const formatter = createFromBuffer(wasmBytes);
  formatter.setConfig({}, {});
  return new Set(formatter.getFileMatchingInfo().fileExtensions);
}

function getExtension(fileName: string) {
  const dot = fileName.lastIndexOf(".");
  return dot < 0 ? "" : fileName.slice(dot + 1).toLowerCase();
}
