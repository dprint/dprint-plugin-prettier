import $ from "https://deno.land/x/dax@0.33.0/mod.ts";
import { extractCargoVersion, processPlugin } from "https://raw.githubusercontent.com/dprint/automation/0.3.0/mod.ts";

const currentDirPath = $.path(import.meta).parentOrThrow().parentOrThrow();
const packageJsonFilePath = currentDirPath.parentOrThrow().join("package.json");

await processPlugin.createDprintOrgProcessPlugin({
  pluginName: "dprint-plugin-prettier",
  version: packageJsonFilePath.readJsonSync().version,
  platforms: [
    "darwin-x86_64",
    "linux-x86_64",
    "windows-x86_64",
  ],
  isTest: Deno.args.some(a => a == "--test"),
});
