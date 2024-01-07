#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net=deno.land

// Script for quickly creating the plugin for testing purposes on Windows
// To run:
// 1. Change the one line to `reference": `./${zipFileName}`,` in scripts/createPluginFile.js
// 2. Run `./scripts/create_plugin_file.ts`
// 3. Update dprint.json to point at ./plugin.json then update checksum
//    as shown when initially run.

import $ from "dax";

await $`deno task build`
await $`cargo build --release`
if (Deno.build.os === "windows") {
  await $`powershell -Command ${"Compress-Archive -Force -Path target/release/dprint-plugin-prettier.exe -DestinationPath target/release/dprint-plugin-prettier-x86_64-pc-windows-msvc.zip"}`
} else {
  await $`zip -j target/release/dprint-plugin-prettier-linux.zip target/release/dprint-plugin-prettier`;
}

await $`cd target/release && deno run -A ../../scripts/create_plugin_file.ts --test`;
