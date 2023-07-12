#!/usr/bin/env -S deno run -A
import $ from "dax";

const currentDir = $.path(import.meta).parentOrThrow();
const rootDir = currentDir.join("../").resolve();
const distDir = rootDir.join("./dist").resolve();

await $`rm -rf ./dist`.cwd(rootDir);
await $`./scripts/updateVersion.ts`.cwd(rootDir);
await $`npx rollup --config rollup.config.js`.cwd(rootDir);

const packageJson = rootDir.join("package.json")
  .readJsonSync<{ dependencies: Record<string, string> }>();
distDir.join("package.json").writeJsonPrettySync({
  type: "module",
  dependencies: packageJson.dependencies,
});
await $`cd dist && npm install`.cwd(rootDir);
