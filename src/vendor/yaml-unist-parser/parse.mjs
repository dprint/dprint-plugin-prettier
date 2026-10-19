// @nts-check
import { attachComments } from "./attach.mjs";
import { createRoot } from "./factories/root.mjs";
import Context from "./transforms/context.mjs";
import { transformDocuments } from "./transforms/documents.mjs";
import { updatePositions } from "./utils/update-positions.mjs";
import { YAMLSyntaxError } from "./yaml-syntax-error.mjs";
import * as YAML from "yaml";
//#region src/parse.ts
function parse(/** @type {string | undefined} */ text, options) {
	const lineCounter = new YAML.LineCounter();
	const context = new Context(text, lineCounter);
	const parser = new YAML.Parser(lineCounter.addNewLine);
	const composer = new YAML.Composer({
		keepSourceTokens: true,
		uniqueKeys: options === null || options === void 0 ? void 0 : options.uniqueKeys,
		lineCounter,
		merge: true
	});
	const parsedDocuments = [];
	const cstTokens = [...parser.parse(text)];
	for (const parsedDocument of composer.compose(cstTokens, true, text.length)) {
		const { errors } = parsedDocument;
		if (errors.length > 0) throw new YAMLSyntaxError(context, errors[0]);
		parsedDocuments.push(parsedDocument);
	}
	const documents = transformDocuments(parsedDocuments, cstTokens, context);
	const comments = context.comments.sort(/** @returns {number} */ (commentA, commentB) => commentA.position.start.offset - commentB.position.end.offset);
	const root = createRoot(context.transformRange([0, text.length]), documents, comments);
	attachComments(root);
	updatePositions(root);
	return root;
}
//#endregion
export { parse };
