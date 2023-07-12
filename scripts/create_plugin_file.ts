import $ from "dax";
import { extractCargoVersion, processPlugin } from "https://raw.githubusercontent.com/dprint/automation/0.3.0/mod.ts";

const currentDir = $.path(import.meta).parentOrThrow();
const rootDir = currentDir.join("../").resolve();
const cargoFilePath = rootDir.join("Cargo.toml");

await processPlugin.createDprintOrgProcessPlugin({
  pluginName: "dprint-plugin-prettier",
  version: await extractCargoVersion(cargoFilePath.toString()),
  platforms: [
    "darwin-x86_64",
    "linux-x86_64",
    "windows-x86_64",
  ],
  isTest: Deno.args.some(a => a == "--test"),
});
