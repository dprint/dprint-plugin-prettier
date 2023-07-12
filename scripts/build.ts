#!/usr/bin/env -S deno run -A
import $ from "dax";

const currentDir = $.path(import.meta).parentOrThrow();
const rootDir = currentDir.join("../").resolve();
const distDir = rootDir.join("./dist").resolve();

$.cd(rootDir);

await $`rm -rf ./dist`;
await $`./scripts/updateVersion.ts`;
await $`npx rollup --config rollup.config.js`;

const packageJson = rootDir.join("package.json")
  .readJsonSync<{ dependencies: Record<string, string> }>();
distDir.join("package.json").writeJsonPrettySync({
  type: "module",
  dependencies: packageJson.dependencies,
});
await $`cd dist && npm install`;
