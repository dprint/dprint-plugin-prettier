// @nts-check
import { shouldAddContentEnd } from "../location/index.js";
import { isForXStatementInitializer } from "../utilities/is-for-x-statement-initializer.js";

/** @returns {boolean} */ function shouldPrintSemicolon(/** @type {import("../types/estree.js").Node} */ node) {
  if (shouldAddContentEnd(node) && node.__contentEnd) {
    return true;
  }

  const { type } = node;

  if (
    type === "BreakStatement" ||
    type === "ContinueStatement" ||
    type === "DebuggerStatement" ||
    type === "VariableDeclaration"
  ) {
    return true;
  }

  if (type === "IfStatement") {
    return shouldPrintSemicolon(node.alternate ?? node.consequent);
  }

  if (
    type === "ForInStatement" ||
    type === "ForOfStatement" ||
    type === "ForStatement" ||
    type === "LabeledStatement" ||
    type === "WithStatement" ||
    type === "WhileStatement"
  ) {
    return shouldPrintSemicolon(node.body);
  }

  return false;
}

/** @returns {boolean} */ function shouldIgnoredNodePrintSemicolon(/** @type {import("../../common/ast-path.js").default} */ path) {
  return !isForXStatementInitializer(path) && shouldPrintSemicolon(path.node);
}

export { shouldIgnoredNodePrintSemicolon };
