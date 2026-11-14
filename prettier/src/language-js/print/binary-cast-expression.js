// @nts-check
import { group, hardline, indent, softline } from "../../document/index.js";
import { hasLeadingOwnLineComment } from "../utilities/has-leading-own-line-comment.js";
import {
  isCallOrNewExpression,
  isMemberExpression,
  isSatisfiesExpression,
  isUnionType,
} from "../utilities/node-types.js";

/** @import AstPath from "../../common/ast-path.js" */

function printBinaryCastExpression(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  /** @type {{ parent: import("../types/estree.js").Node, node: import("../types/estree.js").Node, key: any }} */ const { parent, node, key } = path;
  const isFlowAsConstExpression = node.type === "AsConstExpression";
  const typeAnnotationDoc = isFlowAsConstExpression
    ? "const"
    : print("typeAnnotation");

  const parts = [
    print("expression"),
    " ",
    isSatisfiesExpression(node) ? "satisfies" : "as",
  ];

  if (
    // Union type already indented
    !isUnionType(node.typeAnnotation) &&
    hasLeadingOwnLineComment(options.originalText, node.typeAnnotation)
  ) {
    parts.push(indent([hardline, typeAnnotationDoc]));
  } else {
    parts.push(" ", typeAnnotationDoc);
  }

  if (
    (key === "callee" && isCallOrNewExpression(parent)) ||
    (key === "object" && isMemberExpression(parent))
  ) {
    return group([indent([softline, ...parts]), softline]);
  }

  return parts;
}

export { printBinaryCastExpression };
