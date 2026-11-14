// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import { replaceEndOfLine } from "../../document/index.js";
import { getPreferredQuote } from "../../utilities/get-preferred-quote.js";
import {
  shouldUnquoteAttributeValue,
  unescapeQuoteEntities,
} from "../utilities/index.js";

/**
@import {Doc} from "../../document/index.js"
*/

function printAttributeValue(/** @type {AstPath} */ path, /** @type {import("../print-options.js").HtmlPrintOptions} */ options /* , print*/) {
  /** @type {{ node: import("../parse/ast.js").Node }} */ const { node } = path;
  let { value } = node;

  if (shouldUnquoteAttributeValue(node, options)) {
    return value;
  }

  value = unescapeQuoteEntities(value);
  /** @type {string} */ const quote = getPreferredQuote(value, '"');
  value =
    quote === '"'
      ? value.replaceAll('"', "&quot;")
      : value.replaceAll("'", "&apos;");

  return [quote, replaceEndOfLine(value), quote];
}

function printAttribute(/** @type {AstPath} */ path, /** @type {import("../print-options.js").HtmlPrintOptions} */ options /* , print*/) {
  /** @type {{ node: import("../parse/ast.js").Node }} */ const { node } = path;
  const parts = [node.rawName];

  if (node.value !== null) {
    parts.push("=", printAttributeValue(path, options));
  }

  return parts;
}

export { printAttribute };
