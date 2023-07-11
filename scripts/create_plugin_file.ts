import { createPluginFile } from "@dprint/node-plugin-base/plugin_file.js";
import $ from "dax";

const currentDirPath = $.path(import.meta).parentOrThrow();
const packageJsonFilePath = currentDirPath.parentOrThrow().join("package.json");

const version = packageJsonFilePath.readJsonSync<{ version: string }>().version;
const pluginFile = createPluginFile({
  name: "dprint-plugin-prettier",
  version,
  zipPath: currentDirPath.join("../dist/plugin.zip").resolve().toString(),
  zipUrl: Deno.args.includes("--test")
    ? "./plugin.zip"
    : `https://github.com/dprint/dprint-plugin-prettier/releases/download/${version}/plugin.zip`,
});
currentDirPath.join("../dist/plugin.json").writeJsonPrettySync(pluginFile);
