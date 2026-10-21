// @nts-check
import { tokens } from "../cst.mjs";
import { createBlockValue } from "../factories/block-value.mjs";
//#region src/transforms/block-value.ts
function transformAstBlockValue(/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar} */ blockValue, srcToken, /** @type {import("./context.mjs").default} */ context, props) {
	let blockScalarHeaderToken = null;
	let indicatorComment = null;
	for (const token of tokens(srcToken.props)) if (token.type === "comment") indicatorComment = context.transformComment(token);
	else if (token.type === "block-scalar-header") blockScalarHeaderToken = token;
	else
 // istanbul ignore next -- @preserve
	throw new Error(`Unexpected token type in block value end: ${token.type}`);
	// istanbul ignore if -- @preserve
	if (!blockScalarHeaderToken) throw new Error("Expected block scalar header token");
	const headerInfo = parseHeader(blockScalarHeaderToken.source);
	const position = context.transformRange(blockValue.range);
	return createBlockValue(position, context.transformContentProperties(blockValue, props.tokens), headerInfo.chomping, headerInfo.indent, blockValue.source, indicatorComment);
}
/**
* Parse the block scalar header to extract indentation and chomping information.
*/
function parseHeader(/** @type {string} */ header) {
	const parsed = /([+-]?)(\d*)([+-]?)$/u.exec(header);
	let indent = null;
	let chomping = "clip";
	if (parsed) {
		indent = parsed[2] ? Number(parsed[2]) : null;
		const chompingStr = parsed[3] || parsed[1];
		chomping = chompingStr === "+" ? "keep" : chompingStr === "-" ? "strip" : "clip";
	}
	return {
		chomping,
		indent
	};
}
//#endregion
export { transformAstBlockValue };
