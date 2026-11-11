// @nts-check
import { NodeTransformer } from "./node-transformer.js";
//#region src/ast-transform/ast-transformer.ts
var AstTransformer = class extends NodeTransformer {
	constructor(/** @type {import("@angular/compiler").ASTWithSource} */ ast) {
		super({
			node: ast,
			text: ast.source
		});
	}
};
//#endregion
export { AstTransformer };
