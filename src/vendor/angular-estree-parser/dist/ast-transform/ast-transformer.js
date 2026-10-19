// @nts-check
import { NodeTransformer } from "./node-transformer.js";
//#region src/ast-transform/ast-transformer.ts
var AstTransformer = class extends NodeTransformer {
	constructor(/** @type {import("../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").ASTWithSource} */ ast) {
		super({
			node: ast,
			text: ast.source
		});
	}
};
//#endregion
export { AstTransformer };
