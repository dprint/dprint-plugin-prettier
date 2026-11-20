// Formats the cases of prettier's format tests that tests/prettier_tests_test.ts sends with prettier from npm and
// with target/plugin.wasm, each with the options of its test, and answers whether they give the same text or fail
// the same way. As prettier's own runner does for its full test, a case is also formatted with the line endings of
// Windows (CRLF) and of old Macs (CR), and what prettier gives for it is formatted a second time.
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
  /** The name of the case, followed by which variant of it this is when it is not the case as it was collected. */
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

/** Formats a case and its variants, which gives a result for each of them. */
async function formatCase(testCase: TestCase): Promise<CaseResult[]> {
  // what prettier_tests_collect.mjs writes for Infinity, which JSON has no way to write
  const options = Object.fromEntries(
    Object.entries(testCase.options).map(([key, value]) => [key, value === "Infinity" ? Infinity : value]),
  );
  // dprint gives a plugin a file without its BOM and always with a path, which a snippet is given here
  const input = testCase.input.replace(/^﻿/, "");
  const filePath = testCase.filePath ?? "snippet";
  const compare = async (variant: string, text: string): Promise<CaseResult> => {
    const expected = await formatWithPrettier(text, filePath, options);
    const actual = formatWithPlugin(text, filePath, options);
    return {
      name: testCase.name + variant,
      parser: String(options.parser),
      same: isSame(expected, actual),
      expected,
      actual,
    };
  };
  const first = await compare("", input);
  const results = [first];
  if (input.includes("\n") && !input.includes("\r")) {
    results.push(await compare(" (CRLF)", input.replaceAll("\n", "\r\n")));
    results.push(await compare(" (CR)", input.replaceAll("\n", "\r")));
  }
  if (!first.expected.startsWith("error: ") && first.expected !== input) {
    results.push(await compare(" (second format)", first.expected));
  }
  return results;
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
    if (error instanceof RangeError) {
      // the host ran out of stack inside of the module, as prettier does on the same input (a chain of 2000 binary
      // operators with the typescript parser), which leaves the module's own stack where it was
      formatter = createFormatter();
      return "error: " + String(error);
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
