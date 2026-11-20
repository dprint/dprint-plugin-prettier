// @nts-check
import { UndefinedParserError } from "../common/errors.js";
import { getSupportInfo } from "../main/support.js";
import inferParser from "../utilities/infer-parser.js";
import normalizeOptions from "./normalize-options.js";
import {
  getParserPluginByParserName,
  getPrinterPluginByAstFormat,
  initParser,
  initPrinter,
} from "./parser-and-printer.js";

const formatOptionsHiddenDefaults = {
  astFormat: "estree",
  printer: {},
  originalText: undefined,
  locStart: null,
  locEnd: null,
  getVisitorKeys: null,
};

// Copy options and fill in default values.
async function normalizeFormatOptions(options, opts = {}) {
  const rawOptions = { ...options };

  if (!rawOptions.parser) {
    if (!rawOptions.filepath) {
      throw new UndefinedParserError(
        "No parser and no file path given, couldn't infer a parser.",
      );
    }

    rawOptions.parser = inferParser(rawOptions, {
      physicalFile: rawOptions.filepath,
    });

    if (!rawOptions.parser) {
      throw new UndefinedParserError(
        `No parser could be inferred for file "${rawOptions.filepath}".`,
      );
    }
  }

  const { supportOptions, defaults } = getSupportOptions(options.plugins);

  const parserPlugin = getParserPluginByParserName(
    rawOptions.plugins,
    rawOptions.parser,
  );

  const parser = await initParser(parserPlugin, rawOptions.parser);
  rawOptions.astFormat = parser.astFormat;
  rawOptions.locEnd = parser.locEnd;
  rawOptions.locStart = parser.locStart;

  const printerPlugin = parserPlugin.printers?.[parser.astFormat]
    ? parserPlugin
    : getPrinterPluginByAstFormat(rawOptions.plugins, parser.astFormat);
  const printer = await initPrinter(printerPlugin, parser.astFormat);

  rawOptions.printer = printer;
  rawOptions.getVisitorKeys = printer.getVisitorKeys;

  const pluginDefaults = printerPlugin.defaultOptions
    ? Object.fromEntries(
        Object.entries(printerPlugin.defaultOptions).filter(
          ([, value]) => value !== undefined,
        ),
      )
    : {};

  const mixedDefaults = { ...defaults, ...pluginDefaults };

  for (const [k, value] of Object.entries(mixedDefaults)) {
    rawOptions[k] ??= value;
  }

  if (rawOptions.parser === "json") {
    rawOptions.trailingComma = "none";
  }

  return normalizeOptions(rawOptions, supportOptions, {
    passThrough: Object.keys(formatOptionsHiddenDefaults),
    ...opts,
  });
}

// (dprint-plugin-prettier: the options of the plugins and their defaults are worked out once for each list of plugins,
// rather than for each file and each embedded language, as they only depend on the plugins; see docs/upgrading.md)
/** @type {WeakMap<object, { supportOptions: any[], defaults: Record<string, any> }>} */
const supportOptionsByPlugins = new WeakMap();
const supportOptionsWithoutPlugins = { plugins: undefined, support: undefined };

/** @returns {{ supportOptions: any[], defaults: Record<string, any> }} */
function getSupportOptions(/** @type {any} */ plugins) {
  if (plugins == null) {
    supportOptionsWithoutPlugins.support ??= computeSupportOptions(plugins);
    return supportOptionsWithoutPlugins.support;
  }
  let support = supportOptionsByPlugins.get(plugins);
  if (support === undefined) {
    support = computeSupportOptions(plugins);
    supportOptionsByPlugins.set(plugins, support);
  }
  return support;
}

/** @returns {{ supportOptions: any[], defaults: Record<string, any> }} */
function computeSupportOptions(/** @type {any} */ plugins) {
  const supportOptions = getSupportInfo({
    plugins,
    showDeprecated: true,
  }).options;

  const defaults = {
    ...formatOptionsHiddenDefaults,
    ...Object.fromEntries(
      supportOptions
        .filter(/** @returns {boolean} */ (optionInfo) => optionInfo.default !== undefined)
        .map(/** @returns {any[]} */ (option) => [option.name, option.default]),
    ),
  };
  return { supportOptions, defaults };
}

export default normalizeFormatOptions;
export { formatOptionsHiddenDefaults };
