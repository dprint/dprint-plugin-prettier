import { FormatRequest } from "@dprint/node-plugin-base";
import { default as prettier } from "prettier";
import * as prettierPluginAstro from "prettier-plugin-astro";
import * as prettierPluginJsDoc from "prettier-plugin-jsdoc";
import * as prettierPluginSvelte from "prettier-plugin-svelte";
import { parentPort } from "worker_threads";
import type { ResolvedConfig } from "./common.js";

const plugins: prettier.Plugin[] = [
  prettierPluginSvelte,
  prettierPluginAstro,
];

parentPort!.on("message", (request: FormatRequest<ResolvedConfig>) => {
  const data = formatText(request);
  parentPort!.postMessage(data);
});

function formatText(request: FormatRequest<ResolvedConfig>) {
  try {
    const fileText = prettier.format(request.fileText, {
      filepath: request.filePath,
      plugins: request.config.jsDocPlugin ? [prettierPluginJsDoc, ...plugins] : plugins,
      ...request.config.prettier,
    });
    return {
      success: true,
      data: fileText,
    };
  } catch (err) {
    return {
      success: false,
      data: err,
    };
  }
}
