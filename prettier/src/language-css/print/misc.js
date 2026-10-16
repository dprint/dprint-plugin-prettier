// @nts-check
import printNumber from "../../utils/print-number.js";
import printString from "../../utils/print-string.js";
import { maybeToLowerCase } from "../utils/index.js";
import CSS_UNITS from "./css-units.evaluate.js";

/** @returns {string} */ function printUnit(/** @type {string} */ unit) {
  const lowercased = unit.toLowerCase();
  return CSS_UNITS.has(lowercased) ? CSS_UNITS.get(lowercased) : unit;
}

/** @type {RegExp} */ const STRING_REGEX = /(["'])(?:(?!\1)[^\\]|\\.)*\1/gsu;
/** @type {RegExp} */ const NUMBER_REGEX = /(?:\d*\.\d+|\d+\.?)(?:e[+-]?\d+)?/giu;
/** @type {RegExp} */ const STANDARD_UNIT_REGEX = /[a-z]+/giu;
/** @type {RegExp} */ const WORD_PART_REGEX = /[$@]?[_a-z\u0080-\uFFFF][\w\u0080-\uFFFF-]*/giu;
/** @type {RegExp} */ const ADJUST_NUMBERS_REGEX = new RegExp(
  STRING_REGEX.source +
    "|" +
    // eslint-disable-next-line regexp/no-misleading-capturing-group
    `(${WORD_PART_REGEX.source})?` +
    `(${NUMBER_REGEX.source})` +
    `(${STANDARD_UNIT_REGEX.source})?`,
  "giu",
);

/** @returns {string} */ function adjustStrings(/** @type {string} */ value, options) {
  return value.replaceAll(STRING_REGEX, /** @returns {string} */ (match) => printString(match, options));
}

/** @returns {string} */ function quoteAttributeValue(/** @type {string} */ value, options) {
  /** @type {string} */ const quote = options.singleQuote ? "'" : '"';
  return value.includes('"') || value.includes("'")
    ? value
    : quote + value + quote;
}

/** @returns {string} */ function adjustNumbers(/** @type {string} */ value) {
  return value.replaceAll(
    ADJUST_NUMBERS_REGEX,
    /** @returns {string} */ (match, quote, wordPart, number, unit) =>
      !wordPart && number
        ? printCssNumber(number) + maybeToLowerCase(unit || "")
        : match,
  );
}

/** @returns {string} */ function printCssNumber(/** @type {string} */ rawNumber) {
  return (
    printNumber(rawNumber)
      // Remove trailing `.0`.
      .replace(/\.0(?=$|e)/u, "")
  );
}

/** @returns {boolean} */ function shouldPrintTrailingComma(options) {
  return options.trailingComma === "es5" || options.trailingComma === "all";
}

export {
  adjustNumbers,
  adjustStrings,
  printCssNumber,
  printUnit,
  quoteAttributeValue,
  shouldPrintTrailingComma,
};
