// @nts-check
//#region src/yaml-syntax-error.ts
var YAMLSyntaxError = class extends SyntaxError {
	name = "YAMLSyntaxError";
	/** @type {string} */ code;
	/** @type {string} */ source;
	/** @type {import("yaml-unist-types").Position} */ position;
	constructor(/** @type {import("./transforms/context.mjs").default} */ context, /** @type {import("../yaml/browser/dist/errors.js").YAMLParseError} */ error) {
		super(error.message, { cause: error });
		this.code = error.code;
		this.source = context.text;
		this.position = context.transformRange(error.pos);
	}
};
//#endregion
export { YAMLSyntaxError };
