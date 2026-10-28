// @nts-check
import { sourceSpanToLocationInformation } from "./utilities.js";
import { Lexer, ParseError, ParseLocation, ParseSourceFile, ParseSourceSpan, Parser } from "@angular/compiler";
//#region src/angular-parser.ts
/** @type {string} */ const FILE_NAME = "test.html";
/**
 * The text that is parsed and where it is, which a parse gives with what it parsed (`result`, an `ASTWithSource` or
 * the result of parsing template bindings) and the comments it found
 * @typedef {{
 *   text: string,
 *   file: import("@angular/compiler").ParseSourceFile,
 *   start: import("@angular/compiler").ParseLocation,
 *   end: import("@angular/compiler").ParseLocation,
 *   sourceSpan: import("@angular/compiler").ParseSourceSpan,
 * }} AngularSourceSpan
 * @typedef {AngularSourceSpan & { result: any, comments: any[] }} AngularParseResult
 */
/** @returns {AngularSourceSpan} */ function getParseSourceSpan(/** @type {string} */ text) {
	const file = new ParseSourceFile(text, FILE_NAME);
	const start = new ParseLocation(file, 0, 0, 0);
	const end = start.moveBy(text.length);
	return {
		text,
		file,
		start,
		end,
		sourceSpan: new ParseSourceSpan(start, end)
	};
}
/** @type {import("@angular/compiler").Parser | undefined} */ let parser;
/** @returns {import("@angular/compiler").Parser} */ function getParser() {
	return parser ??= new Parser(new Lexer());
}
const getCommentStart = /** @returns {number | null} */ (/** @type {string} */ text) => Parser.prototype._commentStart(text);
/** @returns {any[]} */ function extractComments(/** @type {string} */ text) {
	const commentStart = getCommentStart(text);
	if (commentStart === null) return [];
	return [{
		type: "CommentLine",
		value: text.slice(commentStart + 2),
		...sourceSpanToLocationInformation({
			start: commentStart,
			end: text.length
		})
	}];
}
/** @returns {AngularParseResult} */ function throwErrors(/** @type {AngularParseResult} */ parseResult) {
	const { result } = parseResult;
	if (result.errors.length !== 0) {
		const [originalError] = result.errors;
		/* c8 ignore next 3 @preserve */
		if (!(originalError instanceof ParseError)) throw originalError;
		let { message } = originalError;
		{
			const match = message.match(/ in .*?@\d+:\d+$/);
			/* c8 ignore else @preserve */
			if (match) message = message.slice(0, match.index);
		}
		let location = parseResult.start;
		{
			const match = message.match(/at column (?<index>\d+)/);
			if (match) {
				message = message.slice(0, match.index);
				location = location.moveBy(Number(match.groups.index));
			}
		}
		const error = new SyntaxError(message.trim(), { cause: originalError });
		Object.assign(error, {
			location,
			span: originalError.span
		});
		error.cause ??= originalError;
		throw error;
	}
	return parseResult;
}
const createAstParser = (/** @type {string} */ name) => (/** @type {string} */ text) => {
	const context = getParseSourceSpan(text);
	return throwErrors({
		...context,
		result: getParser()[name](text, context.sourceSpan, 0),
		comments: extractComments(text)
	});
};
const parseAction = createAstParser("parseAction");
const parseBinding = createAstParser("parseBinding");
const parseSimpleBinding = createAstParser("parseSimpleBinding");
const parseInterpolationExpression = createAstParser("parseInterpolationExpression");
const parseTemplateBindings = (/** @type {string} */ text) => {
	const context = getParseSourceSpan(text);
	return throwErrors({
		...context,
		result: getParser().parseTemplateBindings("", text, context.sourceSpan, 0, 0),
		comments: []
	});
};
//#endregion
export { parseAction, parseBinding, parseInterpolationExpression, parseSimpleBinding, parseTemplateBindings };
