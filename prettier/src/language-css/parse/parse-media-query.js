// @nts-check
import postcssMediaQueryParser from "postcss-media-query-parser";
import { addMissingType, addTypePrefix } from "./utilities.js";

const parse = postcssMediaQueryParser.default;

function parseMediaQuery(/** @type {string} */ params) {
  /** @type {any} */ let result;

  try {
    result = parse(params);
  } catch {
    // Ignore bad media queries
    /* c8 ignore next 4 */
    return {
      type: "selector-unknown",
      value: params,
    };
  }

  return addTypePrefix(addMissingType(result), "media-");
}

export default parseMediaQuery;
