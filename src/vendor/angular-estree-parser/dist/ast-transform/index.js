// @nts-check
import { NodeTransformer } from "./node-transformer.js";
import { AstTransformer } from "./ast-transformer.js";
//#region src/ast-transform/index.ts
const transformAstNode = /** @returns {import("../source.js").NGNode} */ (/** @type {any} */ node, /** @type {string} */ text) => {
	return NodeTransformer.transform(node, text);
};
const transformAst = (/** @type {import("@angular/compiler").ASTWithSource} */ ast) => {
	return new AstTransformer(ast).transform();
};
//#endregion
export { transformAst, transformAstNode };
