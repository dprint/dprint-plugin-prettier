// Formats the files that tests/repos_test.ts sends with prettier from npm and with target/plugin.wasm, and
// answers whether they give the same text or fail the same way.
/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />
import { createFromWasmModule, type Formatter } from "@dprint/formatter";
import { createRequire } from "node:module";
import * as prettier from "prettier";

// prettier-plugin-svelte at the version that the plugin includes, for the .svelte files that the plugin formats
const sveltePlugin = createRequire(import.meta.url)("../plugins/node_modules/prettier-plugin-svelte/plugin.js");

export interface FileRequest {
  filePath: string;
}

export interface FileResult {
  filePath: string;
  same: boolean;
  /** What prettier gives, or what went wrong prefixed with "error: ". */
  expected: string;
  /** What the plugin gives, or what went wrong prefixed with "error: ". */
  actual: string;
  prettierMs: number;
  pluginMs: number;
}

let wasmModule: WebAssembly.Module;
let formatter: Formatter;
// if the formatter is to be created again before the next file, which is not counted in the time of a file
let isFormatterSpent = false;

self.onmessage = async (event: MessageEvent<{ wasmModule: WebAssembly.Module } | FileRequest>) => {
  if ("wasmModule" in event.data) {
    wasmModule = event.data.wasmModule;
    formatter = createFormatter();
    return;
  }
  self.postMessage(await formatFile(event.data.filePath));
};

async function formatFile(filePath: string): Promise<FileResult> {
  // without a BOM, as dprint gives a file to a plugin, and @dprint/formatter would drop it from the result
  const fileText = Deno.readTextFileSync(filePath).replace(/^\uFEFF/, "");
  if (isFormatterSpent) {
    formatter = createFormatter();
    isFormatterSpent = false;
  }
  const prettierStart = performance.now();
  const expected = await formatWithPrettier(filePath, fileText);
  const pluginStart = performance.now();
  const actual = formatWithPlugin(filePath, fileText);
  const pluginEnd = performance.now();
  return {
    filePath,
    same: isSame(expected, actual),
    expected,
    actual,
    prettierMs: pluginStart - prettierStart,
    pluginMs: pluginEnd - pluginStart,
  };
}

async function formatWithPrettier(filePath: string, fileText: string) {
  try {
    return await prettier.format(fileText, { filepath: filePath, plugins: [sveltePlugin] });
  } catch (error) {
    return "error: " + String(error);
  }
}

function formatWithPlugin(filePath: string, fileText: string) {
  try {
    return formatter.formatText({ filePath, fileText });
  } catch (error) {
    if (error instanceof WebAssembly.RuntimeError) {
      // the module trapped, so its state can't be trusted for the next file
      isFormatterSpent = true;
      return "error: crashed: " + String(error);
    }
    if (error instanceof RangeError) {
      // the stack of the engine ran out in the module, which is left as it was in the middle of a call, and which
      // prettier runs out of the same way
      isFormatterSpent = true;
      return "error: " + String(error);
    }
    return "error: " + (error as Error).message;
  }
}

// both failing with the same kind of error at the same place counts as the same, since the code frame that
// prettier adds after the first line is not what is being compared
function isSame(expected: string, actual: string) {
  if (expected.startsWith("error: ") && actual.startsWith("error: ")) {
    // the plugin's messages come as UTF-8, where half of a surrogate pair that prettier quotes has no place
    return firstLine(expected).toWellFormed() === firstLine(actual);
  }
  return expected === actual;
}

function firstLine(text: string) {
  const index = text.indexOf("\n");
  return index < 0 ? text : text.slice(0, index);
}

function createFormatter() {
  const formatter = createFromWasmModule(wasmModule);
  formatter.setConfig({}, {});
  return formatter;
}
