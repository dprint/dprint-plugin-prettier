#!/usr/bin/env -S deno run -A
import { createPluginFile } from "@dprint/node-plugin-base/plugin_file.js";
import $ from "dax";

const currentDir = $.path(import.meta).parentOrThrow();
const rootDir = currentDir.join("../").resolve();
const packageJsonFilePath = rootDir.join("package.json");

const version = packageJsonFilePath.readJsonSync<{ version: string }>().version;
const pluginFile = createPluginFile({
  name: "dprint-plugin-prettier",
  version,
  zipPath: rootDir.join("./dist/plugin.zip").resolve().toString(),
  zipUrl: Deno.args.includes("--test")
    ? "./plugin.zip"
    : `https://github.com/dprint/dprint-plugin-prettier/releases/download/${version}/plugin.zip`,
});
rootDir.join("./dist/plugin.json").writeJsonPrettySync(pluginFile);
