// @nts-check
/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {MdastNode, MarkdownOptions} from "../utilities.js"
 */
import {
  align,
  hardline,
  printDocToString,
  replaceEndOfLine,
} from "../../document/index.js";
import getMaxContinuousCount from "../../utilities/get-max-continuous-count.js";
import { getFencedCodeBlockValue } from "../utilities.js";

/** @returns {string} */ function printCodeFences(valueDoc, /** @type {MarkdownOptions} */ options) {
  /** @type {string} */ const styleUnit = options.__inJsTemplate ? "~" : "`";
  /** @type {string} */ const value =
    typeof valueDoc === "string"
      ? valueDoc
      : printDocToString(valueDoc, {
          ...options,
          printWidth: Number.POSITIVE_INFINITY,
          endOfLine: "lf",
        }).formatted;

  return styleUnit.repeat(
    Math.max(3, getMaxContinuousCount(value, styleUnit) + 1),
  );
}

function printFencedCodeBlock(/** @type {AstPath} */ path, /** @type {MarkdownOptions} */ options) {
  /** @type {{ node: MdastNode }} */ const { node } = path;

  /** @type {string} */ const value =
    options.parser === "mdx"
      ? getFencedCodeBlockValue(node, options.originalText)
      : node.value;
  /** @type {string} */ const style = printCodeFences(value, options);

  return [
    style,
    node.lang || "",
    node.meta ? " " + node.meta : "",
    hardline,
    replaceEndOfLine(value, hardline),
    hardline,
    style,
  ];
}

function printCode(/** @type {AstPath} */ path, /** @type {MarkdownOptions} */ options) {
  /** @type {{ node: MdastNode }} */ const { node } = path;

  if (node.isIndented) {
    /** @type {string} */ const alignment = " ".repeat(4);
    return align(alignment, [
      alignment,
      replaceEndOfLine(node.value, hardline),
    ]);
  }

  return printFencedCodeBlock(path, options);
}

export { printCode, printCodeFences };
