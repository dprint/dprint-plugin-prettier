// @nts-check
import needsParentheses from "../parentheses/needs-parentheses.js";
import { shouldPrintParamsWithoutParens } from "../print/function.js";
import {
  getLeftSidePathName,
  hasNakedLeftSide,
} from "../utilities/left-side.js";
import { isJsxElement } from "../utilities/node-types.js";

/** @returns {boolean} */ function shouldExpressionStatementPrintLeadingSemicolon(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options) {
  if (options.semi) {
    return false;
  }

  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  if (
    node.type !== "ExpressionStatement" ||
    isSingleJsxExpressionStatementInMarkdown(path, options) ||
    isSingleVueEventBindingExpressionStatement(path, options) ||
    isSingleHtmlEventHandlerExpressionStatement(path, options)
  ) {
    return false;
  }

  /** @type {{ key: any, parent: import("../types/estree.js").Node }} */ const { key, parent } = path;
  if (
    // `Program.directives` don't need leading semicolon
    ((key === "body" &&
      (parent.type === "Program" ||
        parent.type === "BlockStatement" ||
        parent.type === "StaticBlock" ||
        parent.type === "TSModuleBlock")) ||
      (key === "consequent" && parent.type === "SwitchCase")) &&
    path.call(() => expressionNeedsAsiProtection(path, options), "expression")
  ) {
    return true;
  }

  return false;
}

function expressionNeedsAsiProtection(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, options) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  switch (node.type) {
    case "ParenthesizedExpression":
    case "TypeCastExpression":
    case "TSTypeAssertion":
    case "ArrayExpression":
    case "ArrayPattern":
    case "TemplateLiteral":
    case "TemplateElement":
    case "RegExpLiteral":
      return true;

    case "ArrowFunctionExpression":
      if (!shouldPrintParamsWithoutParens(path, options)) {
        return true;
      }
      break;

    case "UnaryExpression": {
      const { prefix, operator } = node;
      if (prefix && (operator === "+" || operator === "-")) {
        return true;
      }
      break;
    }
    case "BindExpression":
      if (!node.object) {
        return true;
      }
      break;

    case "Literal":
      if (node.regex) {
        return true;
      }
      break;

    default:
      if (isJsxElement(node)) {
        return true;
      }
  }

  if (needsParentheses(path, options)) {
    return true;
  }

  if (!hasNakedLeftSide(node)) {
    return false;
  }

  return path.call(
    () => expressionNeedsAsiProtection(path, options),
    ...getLeftSidePathName(node),
  );
}

const isSingleExpressionStatement = /** @returns {boolean} */ (/** @type {import("../../common/ast-path.js").default & { node: import("../types/estree.js").Node, parent: import("../types/estree.js").Node }} */ { node, parent }) =>
  node.type === "ExpressionStatement" &&
  parent.type === "Program" &&
  parent.body.length === 1 &&
  // In non-Babel parser, directives are `ExpressionStatement`s
  ((Array.isArray(parent.directives) && parent.directives.length === 0) ||
    !parent.directives);

/** @returns {boolean} */ function isSingleJsxExpressionStatementInMarkdown(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options) {
  return (
    (options.parentParser === "markdown" || options.parentParser === "mdx") &&
    isSingleExpressionStatement(path) &&
    isJsxElement(path.node.expression)
  );
}

/** @returns {boolean | undefined} */ function isSingleHtmlEventHandlerExpressionStatement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options) {
  return (
    options.__isHtmlInlineEventHandler && isSingleExpressionStatement(path)
  );
}

/** @returns {boolean} */ function isSingleVueEventBindingExpressionStatement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options) {
  return (
    (options.parser === "__vue_event_binding" ||
      options.parser === "__vue_ts_event_binding") &&
    isSingleExpressionStatement(path)
  );
}

export {
  isSingleHtmlEventHandlerExpressionStatement,
  isSingleJsxExpressionStatementInMarkdown,
  isSingleVueEventBindingExpressionStatement,
  shouldExpressionStatementPrintLeadingSemicolon,
};
