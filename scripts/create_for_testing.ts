#!/usr/bin/env -S deno run -A

// Script for quickly creating the plugin for testing purposes on Windows
// To run:
// 1. Run `./scripts/create_plugin_file.ts`
// 2. Update dprint.json to point at ./target/release/plugin.json then update checksum
//    as shown when initially run.

import $ from "dax";

await $`npm run build:script`.cwd("js/node");
await $`cargo build --release`;
if (Deno.build.os === "windows") {
  await $`powershell -Command ${"Compress-Archive -Force -Path target/release/dprint-plugin-prettier.exe -DestinationPath target/release/dprint-plugin-prettier-x86_64-pc-windows-msvc.zip"}`;
} else if (Deno.build.os === "linux") {
  await $`zip -j target/release/dprint-plugin-prettier-x86_64-unknown-linux-gnu.zip target/release/dprint-plugin-prettier`;
} else {
  throw "TODO";
}

await $`cd target/release && deno run -A ../../scripts/create_plugin_file.ts --test`;
