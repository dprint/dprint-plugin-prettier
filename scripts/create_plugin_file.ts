#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net=deno.land
import $ from "dax";
import { CargoToml, processPlugin } from "https://raw.githubusercontent.com/dprint/automation/0.10.0/mod.ts";

const rootDir = $.path(import.meta.dirname!).parentOrThrow();
const cargoFilePath = rootDir.join("plugin/Cargo.toml");

await processPlugin.createDprintOrgProcessPlugin({
  pluginName: "dprint-plugin-prettier",
  version: new CargoToml(cargoFilePath).version(),
  platforms: [
    "darwin-x86_64",
    "darwin-aarch64",
    "linux-x86_64",
    "linux-aarch64",
    "windows-x86_64",
  ],
  isTest: Deno.args.some(a => a == "--test"),
});
