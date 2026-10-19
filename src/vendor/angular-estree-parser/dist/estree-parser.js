// @nts-check
import { parseAction as parseAction$1, parseBinding as parseBinding$1, parseInterpolationExpression as parseInterpolationExpression$1, parseSimpleBinding as parseSimpleBinding$1, parseTemplateBindings as parseTemplateBindings$1 } from "./angular-parser.js";
import { transformAst } from "./ast-transform/index.js";
import { transformTemplateBindings } from "./microsyntax/transform-template-binding.js";
//#region src/estree-parser.ts
const createAstParser = (parse) => (/** @type {string} */ text) => {
	const { result, comments } = parse(text);
	return Object.assign(transformAst(result), { comments });
};
const parseAction = createAstParser(parseAction$1);
const parseBinding = createAstParser(parseBinding$1);
const parseSimpleBinding = createAstParser(parseSimpleBinding$1);
const parseInterpolationExpression = createAstParser(parseInterpolationExpression$1);
const parseTemplateBindings = (/** @type {string} */ text) => transformTemplateBindings(parseTemplateBindings$1(text).result.templateBindings, text);
//#endregion
export { parseAction, parseBinding, parseInterpolationExpression, parseSimpleBinding, parseTemplateBindings };
