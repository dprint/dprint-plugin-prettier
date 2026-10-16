/// <reference path="../../nts/lib.d.ts" />
// What the dprint plugin does, which `wasm/WasmExports.cs` calls for the functions that dprint calls on the
// Wasm module: resolving dprint's configuration into prettier's options and formatting a file with them.
import { formatWithCursor } from "../prettier/src/main/core.js";
import { plugins } from "./plugins.ts";

/** Prettier's options for every file, and the ones that differ for the files of an extension. */
interface ResolvedConfig {
  main: any;
  extensionOverrides: any;
}

interface ConfigDiagnostic {
  propertyName: string;
  message: string;
}

/** What dprint gives for a configuration: the plugin's part of it and the settings that all plugins share. */
interface RawConfig {
  plugin: any;
  global: any;
}

const rawConfigs = new Map<number, RawConfig>();
const resolvedConfigs = new Map<number, { config: ResolvedConfig; diagnostics: ConfigDiagnostic[] }>();

/** Keeps the configuration of an id, which dprint gives as JSON, until it is released. */
export function registerConfig(id: number, json: string): void {
  rawConfigs.set(id, JSON.parse(json) as RawConfig);
  resolvedConfigs.delete(id);
}

export function releaseConfig(id: number): void {
  rawConfigs.delete(id);
  resolvedConfigs.delete(id);
}

/** Gets prettier's options for a configuration, as JSON. */
export function getResolvedConfig(id: number): string {
  return JSON.stringify(getResolved(id).config);
}

/** Gets what is wrong with a configuration, as JSON. */
export function getConfigDiagnostics(id: number): string {
  return JSON.stringify(getResolved(id).diagnostics);
}

/** Gets the files that the plugin formats, as JSON: those of every language that the plugins of prettier have. */
export function getFileMatching(id: number): string {
  const extensions = new Set<string>();
  for (const plugin of plugins) {
    for (const language of plugin.languages ?? []) {
      for (const extension of language.extensions ?? []) {
        extensions.add(extension.replace(/^\./, ""));
      }
    }
  }
  return JSON.stringify({ fileExtensions: Array.from(extensions), fileNames: [] });
}

/**
 * Formats a file with a configuration and, when dprint gives one for this file, what overrides it. The
 * answer starts with how it went (0 formatted, 1 failed), and the formatted text or what went wrong follows.
 */
export async function formatFile(id: number, overrideJson: string, path: string, text: string): Promise<string> {
  // what the file before this one left behind is no longer used
  sys.settle();
  const config = overrideJson.length > 0
    ? resolveOverridden(id, JSON.parse(overrideJson) as any).config
    : getResolved(id).config;
  try {
    const result: any = await formatWithCursor(text, { ...optionsFor(config, path), filepath: path, plugins });
    const formatted: string = result.formatted;
    return "0" + formatted;
  } catch (error) {
    // with the name of the error, such as SyntaxError
    return "1" + String(error);
  }
}

function getResolved(id: number) {
  let resolved = resolvedConfigs.get(id);
  if (resolved == null) {
    resolved = resolveOverridden(id, {});
    resolvedConfigs.set(id, resolved);
  }
  return resolved;
}

function resolveOverridden(id: number, overrides: any) {
  const raw = rawConfigs.get(id);
  if (raw == null) {
    throw new Error(`Plugin must have config set before use (id: ${id}).`);
  }
  return resolveConfig({ ...raw.plugin, ...overrides }, raw.global ?? {});
}

/**
 * Turns dprint's configuration into prettier's options. dprint's settings that all plugins share give the
 * defaults of the matching options of prettier, a name that starts with an extension and a dot is an option
 * for the files of that extension, and every other name is one of prettier's options as it is.
 */
function resolveConfig(given: any, global: any): { config: ResolvedConfig; diagnostics: ConfigDiagnostic[] } {
  const config: any = { ...given };
  const diagnostics: ConfigDiagnostic[] = [];
  const main: any = {};
  const extensionOverrides: any = {};

  // the plugins of prettier that the plugin that ran prettier on Deno had are not in this one
  if (take(config, "plugin.jsDoc", "boolean", false, diagnostics)) {
    diagnostics.push({
      propertyName: "plugin.jsDoc",
      message: "prettier-plugin-jsdoc is not included in this version of the plugin.",
    });
  }

  const lineWidth = take(config, "lineWidth", "number", global.lineWidth ?? 80, diagnostics);
  main.printWidth = take(config, "printWidth", "number", lineWidth, diagnostics);
  const indentWidth = take(config, "indentWidth", "number", global.indentWidth ?? 2, diagnostics);
  main.tabWidth = take(config, "tabWidth", "number", indentWidth, diagnostics);
  main.useTabs = take(config, "useTabs", "boolean", global.useTabs ?? false, diagnostics);
  const newLineKind = take(config, "newLineKind", "string", global.newLineKind ?? "lf", diagnostics);
  const endOfLine = take(config, "endOfLine", "string", undefined, diagnostics);
  if (endOfLine !== undefined) {
    main.endOfLine = endOfLine;
  } else if (newLineKind === "auto" || newLineKind === "crlf" || newLineKind === "lf") {
    main.endOfLine = newLineKind;
  } else {
    diagnostics.push({ propertyName: "newLineKind", message: `Unknown new line kind: ${newLineKind}` });
    main.endOfLine = "lf";
  }

  for (const key of Object.keys(config)) {
    const value = config[key];
    const dot = key.lastIndexOf(".");
    if (dot >= 0) {
      const extension = key.slice(0, dot).toLowerCase();
      extensionOverrides[extension] ??= {};
      extensionOverrides[extension][key.slice(dot + 1)] = value;
    } else {
      main[key] = value;
    }
  }

  return { config: { main, extensionOverrides }, diagnostics };
}

// takes a setting out of the configuration, or gives the default when it is not there or not of the type
function take(config: any, key: string, type: string, defaultValue: any, diagnostics: ConfigDiagnostic[]): any {
  if (!(key in config)) {
    return defaultValue;
  }
  const value = config[key];
  delete config[key];
  if (typeof value !== type) {
    diagnostics.push({ propertyName: key, message: `Expected a ${type}, but found ${JSON.stringify(value)}.` });
    return defaultValue;
  }
  return value;
}

// prettier's options for a file, which are those for every file with what is set for its extension
function optionsFor(config: ResolvedConfig, path: string): any {
  const dot = path.lastIndexOf(".");
  const overrides = dot < 0 ? undefined : config.extensionOverrides[path.slice(dot + 1).toLowerCase()];
  return overrides == null ? config.main : { ...config.main, ...overrides };
}
