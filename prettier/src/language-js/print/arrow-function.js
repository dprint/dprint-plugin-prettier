// @nts-check
import { ArgExpansionBailout } from "../../common/errors.js";
import {
  group,
  ifBreak,
  indent,
  indentIfBreak,
  join,
  line,
  removeLines,
  softline,
  willBreak,
} from "../../document/index.js";
import {
  printCommentsSeparately,
  printDanglingComments,
} from "../../main/comments/print.js";
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { getFunctionParameters } from "../utilities/function-parameters.js";
import { hasLeadingOwnLineComment } from "../utilities/has-leading-own-line-comment.js";
import { isTemplateOnItsOwnLine } from "../utilities/is-template-on-its-own-line.js";
import {
  isArrayExpression,
  isBinaryish,
  isCallLikeExpression,
  isJsxElement,
  isObjectExpression,
} from "../utilities/node-types.js";
import { startsWithNoLookaheadToken } from "../utilities/starts-with-no-lookahead-token.js";
import { printReturnType, shouldPrintParamsWithoutParens } from "./function.js";
import { printFunctionParameters } from "./function-parameters.js";
import { printTrailingComma } from "./miscellaneous.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 * @import {Doc} from "../../document/index.js"
 */

// In order to avoid confusion between
// a => a ? a : a
// a <= a ? a : a
const shouldAddParensIfNotBreakCache = new WeakMap();
/** @returns {boolean} */ function shouldAddParensIfNotBreak(/** @type {import("../types/estree.js").Node} */ node) {
  return getOrInsertComputed(
    shouldAddParensIfNotBreakCache,
    node,
    /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) =>
      node.type === "ConditionalExpression" &&
      !startsWithNoLookaheadToken(
        node,
        /** @returns {boolean} */ (node) => node.type === "ObjectExpression",
      ),
  );
}

// We handle sequence expressions as the body of arrows specially,
// so that the required parentheses end up on their own lines.
const shouldAlwaysAddParens = /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) => node.type === "SequenceExpression";

/*
- `ArrowFunctionExpression`
*/
function printArrowFunction(/** @type {AstPath} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print, args = {}) {
  /** @type {Doc[]} */
  const signatureDocs = [];
  /** @type {Doc} */
  let bodyDoc;
  /** @type {Doc[]} */
  const bodyComments = [];
  let shouldBreakChain = false;
  /** @type {boolean} */ const shouldPrintAsChain =
    !args.expandLastArg && path.node.body.type === "ArrowFunctionExpression";
  /** @type {import("../types/estree.js").Node} */
  let functionBody;

  (function rec() {
    /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
    const signatureDoc = printArrowFunctionSignature(
      path,
      options,
      print,
      args,
    );
    if (signatureDocs.length === 0) {
      signatureDocs.push(signatureDoc);
    } else {
      const { leading, trailing } = printCommentsSeparately(path, options);
      signatureDocs.push([leading, signatureDoc]);
      bodyComments.unshift(trailing);
    }

    if (shouldPrintAsChain) {
      shouldBreakChain ||=
        // Always break the chain if:
        (node.returnType && getFunctionParameters(node).length > 0) ||
        node.typeParameters ||
        getFunctionParameters(node).some(
          /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ param) => param.type !== "Identifier",
        );
    }

    if (!shouldPrintAsChain || node.body.type !== "ArrowFunctionExpression") {
      bodyDoc = print("body", args);
      functionBody = node.body;
    } else {
      path.call(rec, "body");
    }
  })();

  // We want to always keep these types of nodes on the same line
  // as the arrow.
  /** @type {boolean} */ const shouldPutBodyOnSameLine =
    !hasLeadingOwnLineComment(options.originalText, functionBody) &&
    (shouldAlwaysAddParens(functionBody) ||
      mayBreakAfterShortPrefix(functionBody, bodyDoc, options) ||
      (!shouldBreakChain && shouldAddParensIfNotBreak(functionBody)));

  /** @type {boolean} */ const isCallee = path.key === "callee" && isCallLikeExpression(path.parent);
  const chainGroupId = Symbol("arrow-chain");

  const signaturesDoc = printArrowFunctionSignatures(path, args, {
    signatureDocs,
    shouldBreak: shouldBreakChain,
  });
  /** @type {boolean} */ let shouldBreakSignatures = false;
  /** @type {boolean} */ let shouldIndentSignatures = false;
  /** @type {boolean} */ let shouldPrintSoftlineInIndent = false;
  if (
    shouldPrintAsChain &&
    (isCallee ||
      // isAssignmentRhs
      args.assignmentLayout)
  ) {
    shouldIndentSignatures = true;
    // If the arrow function has a leading line comment, there should be a hardline above it
    // so we should not print a softline in indent call
    // https://github.com/prettier/prettier/issues/16067
    shouldPrintSoftlineInIndent = !hasComment(
      path.node,
      CommentCheckFlags.Leading & CommentCheckFlags.Line,
    );
    shouldBreakSignatures =
      args.assignmentLayout === "chain-tail-arrow-chain" ||
      (isCallee && !shouldPutBodyOnSameLine);
  }

  bodyDoc = printArrowFunctionBody(path, options, args, {
    bodyDoc,
    bodyComments,
    functionBody,
    shouldPutBodyOnSameLine,
  });

  return group([
    group(
      shouldIndentSignatures
        ? indent([shouldPrintSoftlineInIndent ? softline : "", signaturesDoc])
        : signaturesDoc,
      { shouldBreak: shouldBreakSignatures, id: chainGroupId },
    ),
    " =>",
    shouldPrintAsChain
      ? indentIfBreak(bodyDoc, { groupId: chainGroupId })
      : group(bodyDoc),
    shouldPrintAsChain && isCallee
      ? ifBreak(softline, "", { groupId: chainGroupId })
      : "",
  ]);
}

/** @returns {any[]} */ function printArrowFunctionSignature(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print, args) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  const parts = [];

  if (node.async) {
    parts.push("async ");
  }

  if (shouldPrintParamsWithoutParens(path, options)) {
    parts.push(print(["params", 0]));
  } else {
    const shouldExpandParameters = args.expandLastArg || args.expandFirstArg;
    let returnTypeDoc = printReturnType(path, print);
    if (shouldExpandParameters) {
      if (willBreak(returnTypeDoc)) {
        throw new ArgExpansionBailout();
      }
      returnTypeDoc = group(removeLines(returnTypeDoc));
    }
    parts.push(
      group([
        printFunctionParameters(
          path,
          options,
          print,
          shouldExpandParameters,
          /* shouldPrintTypeParameters */ true,
        ),
        returnTypeDoc,
      ]),
    );
  }

  const dangling = printDanglingComments(path, options, {
    marker: "commentBeforeArrow",
  });
  if (dangling) {
    parts.push(" ", dangling);
  }
  return parts;
}

/**
 *
 * @param {*} functionBody
 * @param {*} bodyDoc
 * @param {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} options
 * @returns {boolean}
 */
function mayBreakAfterShortPrefix(functionBody, bodyDoc, options) {
  return (
    isArrayExpression(functionBody) ||
    isObjectExpression(functionBody) ||
    functionBody.type === "ArrowFunctionExpression" ||
    functionBody.type === "DoExpression" ||
    functionBody.type === "BlockStatement" ||
    isJsxElement(functionBody) ||
    (bodyDoc.label?.hug !== false &&
      (bodyDoc.label?.embed ||
        isTemplateOnItsOwnLine(functionBody, options.originalText)))
  );
}

/**
 * @param {AstPath} path
 * @param {*} args
 * @param {Object} arrowFunctionSignaturesPrintOptions
 * @param {Doc[]} arrowFunctionSignaturesPrintOptions.signatureDocs
 * @param {boolean} arrowFunctionSignaturesPrintOptions.shouldBreak
 * @returns {Doc}
 */
function printArrowFunctionSignatures(
  path,
  args,
  { signatureDocs, shouldBreak },
) {
  if (signatureDocs.length === 1) {
    return signatureDocs[0];
  }

  /** @type {{ parent: import("../types/estree.js").Node, key: any }} */ const { parent, key } = path;
  if (
    (key !== "callee" && isCallLikeExpression(parent)) ||
    isBinaryish(parent)
  ) {
    return group(
      [
        signatureDocs[0],
        " =>",
        indent([line, join([" =>", line], signatureDocs.slice(1))]),
      ],
      { shouldBreak },
    );
  }

  if (
    (key === "callee" && isCallLikeExpression(parent)) ||
    // isAssignmentRhs
    args.assignmentLayout
  ) {
    return group(join([" =>", line], signatureDocs), { shouldBreak });
  }

  return group(indent(join([" =>", line], signatureDocs)), { shouldBreak });
}

/**
 * @param {AstPath} path
 * @param {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} options
 * @param {*} args
 * @param {Object} arrowFunctionBodyPrintOptions
 * @param {Doc} arrowFunctionBodyPrintOptions.bodyDoc
 * @param {Doc[]} arrowFunctionBodyPrintOptions.bodyComments
 * @param {*} arrowFunctionBodyPrintOptions.functionBody
 * @param {boolean} arrowFunctionBodyPrintOptions.shouldPutBodyOnSameLine
 * @returns {any[]}
 */
function printArrowFunctionBody(
  path,
  options,
  args,
  { bodyDoc, bodyComments, functionBody, shouldPutBodyOnSameLine },
) {
  /** @type {{ node: import("../types/estree.js").Node, parent: import("../types/estree.js").Node }} */ const { node, parent } = path;

  const trailingComma = args.expandLastArg
    ? printTrailingComma(options, "all")
    : "";

  // if the arrow function is expanded as last argument, we are adding a
  // level of indentation and need to add a softline to align the closing )
  // with the opening (, or if it's inside a JSXExpression (e.g. an attribute)
  // we should align the expression's closing } with the line with the opening {.
  const trailingSpace =
    (args.expandLastArg || parent.type === "JSXExpressionContainer") &&
    !hasComment(node)
      ? softline
      : "";

  if (shouldPutBodyOnSameLine && shouldAddParensIfNotBreak(functionBody)) {
    return [
      " ",
      group([
        ifBreak("", "("),
        indent([softline, bodyDoc]),
        ifBreak("", ")"),
        trailingComma,
        trailingSpace,
      ]),
      bodyComments,
    ];
  }

  return shouldPutBodyOnSameLine
    ? [" ", bodyDoc, bodyComments]
    : [indent([line, bodyDoc, bodyComments]), trailingComma, trailingSpace];
}

export { printArrowFunction };
