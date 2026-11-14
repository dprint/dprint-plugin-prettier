// @nts-check
/*
- `TSNonNullExpression` (TypeScript)
- `NonNullExpression` (Flow)
*/
/** @returns {import("../../document/index.js").Doc[]} */ function printNonNullExpression(/** @type {import("../../common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  return [print("expression"), "!"];
}

export { printNonNullExpression };
