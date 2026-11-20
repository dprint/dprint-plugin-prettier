import { indent, softline } from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locEnd, locStart } from "../location/index.js";
import { shouldIgnoredExpressionStatementPrintLeadingSemicolon } from "../semicolon/semicolon.js";
import { shouldIgnoredNodePrintSemicolon } from "../semicolon/should-ignored-node-print-semicolon.js";

function printIgnored(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options /* , print*/) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  let text = options.originalText.slice(locStart(node), locEnd(node));

  if (options.semi) {
    if (shouldIgnoredNodePrintSemicolon(path)) {
      text += ";";
    }
  } else if (
    shouldIgnoredExpressionStatementPrintLeadingSemicolon(path, options)
  ) {
    text = `;${text}`;
  }

  if (node.type === "ClassExpression" && isNonEmptyArray(node.decorators)) {
    return [indent([softline, text]), softline];
  }

  return text;
}

export { printIgnored };
