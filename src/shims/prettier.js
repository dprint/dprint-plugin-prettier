// `prettier` as Prettier's package gives it to the Prettier plugins that import it (prettier-plugin-jsdoc), whose
// functions format with prettier's own plugins before those that they are given, as src/index.js does
import * as standalone from "../../prettier/src/standalone.js";
import { builtinPlugins } from "../builtin-plugins.ts";

export { doc, util, version } from "../../prettier/src/standalone.js";

function withBuiltinPlugins(options) {
  return { ...options, plugins: [...builtinPlugins, ...(options?.plugins ?? [])] };
}

export function format(text, options) {
  return standalone.format(text, withBuiltinPlugins(options));
}

export function formatWithCursor(text, options) {
  return standalone.formatWithCursor(text, withBuiltinPlugins(options));
}

export function check(text, options) {
  return standalone.check(text, withBuiltinPlugins(options));
}
