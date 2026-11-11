// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import {
  printComments,
  printLeadingComments,
} from "../../main/comments/print.js";
import {
  isSingleHtmlEventHandlerExpressionStatement,
  isSingleJsxExpressionStatementInMarkdown,
  isSingleVueEventBindingExpressionStatement,
  shouldExpressionStatementPrintLeadingSemicolon,
} from "../semicolon/semicolon.js";
import { CommentCheckFlags, getComments } from "../utilities/comments.js";
import { shouldExpressionStatementPrintOwnComments } from "../utilities/should-expression-statement-print-own-comments.js";
import {
  isVueEventBindingFunctionExpression,
  isVueEventBindingMemberExpression,
  unwrapVueEventBindingTsNode,
} from "../utilities/vue-event-binding.js";

/**
@import {Doc} from "../../document/index.js"
* @returns {boolean}
*/

function shouldPrintSemicolon(/** @type {AstPath} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options) {
  if (isSingleVueEventBindingExpressionStatement(path, options)) {
    const expression = unwrapVueEventBindingTsNode(path.node.expression);
    return (
      isVueEventBindingFunctionExpression(expression) ||
      isVueEventBindingMemberExpression(expression)
    );
  }

  if (!options.semi) {
    return false;
  }

  if (
    // Do not append semicolon after the only JSX element in a program
    isSingleJsxExpressionStatementInMarkdown(path, options) ||
    // Do not append semicolon after the only HTML event binding expression in a program
    isSingleHtmlEventHandlerExpressionStatement(path, options)
  ) {
    return false;
  }

  return true;
}

/** @returns {any[]} */ function printExpressionStatement(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  /** @type {Doc[]} */
  const parts = [print("expression")];

  if (shouldExpressionStatementPrintLeadingSemicolon(path, options)) {
    if (shouldExpressionStatementPrintOwnComments(path, options)) {
      /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
      const typeCastComment = getComments(node, CommentCheckFlags.Leading).at(
        -1,
      );

      // Print the type cast comment separately and print `;` before it
      const typeCastCommentDoc = printLeadingComments(path, options, {
        filter: (/** @type {import("../types/estree.js").Comment} */ comment) => comment === typeCastComment,
      });

      return printComments(path, [";", typeCastCommentDoc, ...parts], options, {
        filter: (/** @type {import("../types/estree.js").Comment} */ comment) => comment !== typeCastComment,
      });
    }

    parts.unshift(";");
  } else if (shouldPrintSemicolon(path, options)) {
    parts.push(";");
  }

  return parts;
}

export { printExpressionStatement };
