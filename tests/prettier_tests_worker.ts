// Formats the cases of prettier's format tests that tests/prettier_tests_test.ts sends with prettier from npm and
// with target/plugin.wasm, each with the options of its test, and answers whether they give the same text or fail
// the same way.
/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />
import { createFromWasmModule, type Formatter } from "@dprint/formatter";
import * as prettier from "prettier";

export interface TestCase {
  name: string;
  /** The fixture's file, which a snippet may not have. */
  filePath?: string;
  options: Record<string, unknown>;
  input: string;
}

export interface CaseResult {
  name: string;
  parser: string;
  same: boolean;
  /** What prettier gives, or what went wrong prefixed with "error: ". */
  expected: string;
  /** What the plugin gives, or what went wrong prefixed with "error: ". */
  actual: string;
}

let wasmModule: WebAssembly.Module;
let formatter: Formatter;

self.onmessage = async (event: MessageEvent<{ wasmModule: WebAssembly.Module } | TestCase>) => {
  if ("wasmModule" in event.data) {
    wasmModule = event.data.wasmModule;
    formatter = createFormatter();
    return;
  }
  self.postMessage(await formatCase(event.data));
};

async function formatCase(testCase: TestCase): Promise<CaseResult> {
  // what prettier_tests_collect.mjs writes for Infinity, which JSON has no way to write
  const options = Object.fromEntries(
    Object.entries(testCase.options).map(([key, value]) => [key, value === "Infinity" ? Infinity : value]),
  );
  // dprint gives a plugin a file without its BOM and always with a path, which a snippet is given here
  const input = testCase.input.replace(/^﻿/, "");
  const filePath = testCase.filePath ?? "snippet";
  const expected = await formatWithPrettier(input, filePath, options);
  const actual = formatWithPlugin(input, filePath, options);
  return {
    name: testCase.name,
    parser: String(options.parser),
    same: isSame(expected, actual),
    expected,
    actual,
  };
}

async function formatWithPrettier(input: string, filePath: string, options: Record<string, unknown>) {
  try {
    return await prettier.format(input, { ...options, filepath: filePath });
  } catch (error) {
    return "error: " + String(error);
  }
}

function formatWithPlugin(input: string, filePath: string, options: Record<string, unknown>) {
  // dprint's configuration is JSON, where a width without a limit is as wide as any line could be
  const overrideConfig = Object.fromEntries(
    Object.entries(options).map(([key, value]) => [key, value === Infinity ? Number.MAX_SAFE_INTEGER : value]),
  );
  try {
    return formatter.formatText({ filePath, fileText: input, overrideConfig });
  } catch (error) {
    if (error instanceof WebAssembly.RuntimeError) {
      // the module trapped, so its state can't be trusted for the next case
      formatter = createFormatter();
      return "error: crashed: " + String(error);
    }
    return "error: " + (error as Error).message;
  }
}

// both failing with the same kind of error at the same place counts as the same, since the code frame that
// prettier adds after the first line is not what is being compared
function isSame(expected: string, actual: string) {
  if (expected.startsWith("error: ") && actual.startsWith("error: ")) {
    return firstLine(expected) === firstLine(actual);
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
