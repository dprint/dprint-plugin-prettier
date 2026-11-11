// Formats the cases that tests/plugin_tests_test.ts sends with target/plugin.wasm, each with the options of its test,
// and answers whether it gives what Prettier from npm gave with the Prettier plugin.
/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />
import { createFromWasmModule, type Formatter } from "@dprint/formatter";

export interface PluginTestCase {
  name: string;
  /** The test's file, which a snippet may not have. */
  filePath?: string;
  options: Record<string, unknown>;
  input: string;
  /** Whether the case is formatted with prettier-plugin-jsdoc. */
  jsDoc: boolean;
  /** What Prettier gives, or what went wrong prefixed with "error: ". */
  expected: string;
}

export interface PluginCaseResult {
  name: string;
  parser: string;
  same: boolean;
  expected: string;
  /** What the plugin gives, or what went wrong prefixed with "error: ". */
  actual: string;
}

let wasmModule: WebAssembly.Module;
let formatter: Formatter;

self.onmessage = (event: MessageEvent<{ wasmModule: WebAssembly.Module } | PluginTestCase>) => {
  if ("wasmModule" in event.data) {
    wasmModule = event.data.wasmModule;
    formatter = createFormatter();
    return;
  }
  self.postMessage(formatCase(event.data));
};

function formatCase(testCase: PluginTestCase): PluginCaseResult {
  const actual = formatWithPlugin(testCase);
  return {
    name: testCase.name,
    parser: String(testCase.options.parser),
    same: isSame(testCase.expected, actual),
    expected: testCase.expected,
    actual,
  };
}

function formatWithPlugin(testCase: PluginTestCase) {
  // dprint gives a plugin a file without its BOM and always with a path, and its configuration is JSON, where a width
  // without a limit is as wide as any line could be
  const input = testCase.input.replace(/^\uFEFF/, "");
  const overrideConfig: Record<string, unknown> = Object.fromEntries(
    Object.entries(testCase.options).map(([key, value]) => [key, value === "Infinity" ? Number.MAX_SAFE_INTEGER : value]),
  );
  if (testCase.jsDoc) {
    overrideConfig["plugin.jsDoc"] = true;
  }
  try {
    return formatter.formatText({ filePath: testCase.filePath ?? "snippet", fileText: input, overrideConfig });
  } catch (error) {
    if (error instanceof WebAssembly.RuntimeError) {
      // the module trapped, so its state can't be trusted for the next case
      formatter = createFormatter();
      return "error: crashed: " + String(error);
    }
    return "error: " + (error as Error).message;
  }
}

// both failing with the same kind of error at the same place counts as the same, as in tests/prettier_tests_worker.ts
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
