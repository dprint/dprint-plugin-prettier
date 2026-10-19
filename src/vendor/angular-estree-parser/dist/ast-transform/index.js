// @nts-check
import { NodeTransformer } from "./node-transformer.js";
import { AstTransformer } from "./ast-transformer.js";
//#region src/ast-transform/index.ts
const transformAstNode = (node, /** @type {string} */ text) => {
	return NodeTransformer.transform(node, text);
};
const transformAst = (/** @type {import("../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").ASTWithSource} */ ast) => {
	return new AstTransformer(ast).transform();
};
//#endregion
export { transformAst, transformAstNode };
