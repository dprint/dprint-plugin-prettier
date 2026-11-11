// @nts-check
/* The argument is a duck type of AstPath, so we can use it in comment attach and AST massage */
/** @returns {boolean} */ function isMeaningfulEmptyStatement(/** @type {{ node: import("../types/estree.js").Node, parent: import("../types/estree.js").Node }} */ { node, parent }) {
  if (node?.type !== "EmptyStatement") {
    return false;
  }

  if (parent.type === "IfStatement") {
    return parent.consequent === node || parent.alternate === node;
  }

  if (
    parent.type === "DoWhileStatement" ||
    parent.type === "ForInStatement" ||
    parent.type === "ForOfStatement" ||
    parent.type === "ForStatement" ||
    parent.type === "LabeledStatement" ||
    parent.type === "WithStatement" ||
    parent.type === "WhileStatement"
  ) {
    return parent.body === node;
  }

  return false;
}

export { isMeaningfulEmptyStatement };
