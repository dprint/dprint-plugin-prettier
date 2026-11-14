// @nts-check
/** @returns {boolean} */ function isForXStatementInitializer(/** @type {import("../../common/ast-path.js").default} */ { key, parent }) {
  return (
    (key === "init" && parent.type === "ForStatement") ||
    (key === "left" &&
      (parent.type === "ForInStatement" || parent.type === "ForOfStatement"))
  );
}

export { isForXStatementInitializer };
