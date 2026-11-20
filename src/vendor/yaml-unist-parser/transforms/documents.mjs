// @nts-check
import { getPointText } from "../utils/get-point-text.mjs";
import { tokens } from "../cst.mjs";
import { transformDocument } from "./document.mjs";
//#region src/transforms/documents.ts
/**
 * what is gathered for each document before it is transformed
 * @typedef {{
 *   tokensBeforeBody: import("yaml-cst-types").Token[],
 *   cstNode: import("yaml-cst-types").Token | null,
 *   node: import("../../yaml/browser/dist/doc/Document.js").Document,
 *   tokensAfterBody: import("yaml-cst-types").Token[],
 *   documentEnd: import("yaml-cst-types").Token | null,
 * }} DocumentData
 */
/** @returns {import("yaml-unist-types").YamlNode[]} */ function transformDocuments(/** @type {import("../../yaml/browser/dist/doc/Document.js").Document[]} */ parsedDocuments, /** @type {import("yaml-cst-types").Token[]} */ cstTokens, /** @type {import("./context.mjs").default} */ context) {
	if (parsedDocuments.length === 0) return [];
	/** @type {DocumentData[]} */ const documents = [];
	/** @type {import("yaml-cst-types").Token[]} */ const bufferComments = [];
	/** @type {import("yaml-cst-types").Token[]} */ const tokensBeforeBody = [];
	/** @type {DocumentData | null} */ let currentDocumentData = null;
	const createDocumentData = /** @returns {DocumentData} */ (/** @type {import("yaml-cst-types").Token | null} */ cstNode) => {
		/** @type {DocumentData} */ const documentData = {
			tokensBeforeBody: [...tokensBeforeBody, ...bufferComments],
			cstNode,
			node: parsedDocuments[documents.length],
			tokensAfterBody: [],
			documentEnd: null
		};
		documents.push(documentData);
		tokensBeforeBody.length = 0;
		bufferComments.length = 0;
		return documentData;
	};
	for (const token of tokens(cstTokens)) {
		if (token.type === "document") {
			// istanbul ignore if -- @preserve
			if (documents.length >= parsedDocuments.length) throw new Error(`Unexpected 'document' token at ${getPointText(context.transformOffset(token.offset))}`);
			currentDocumentData = createDocumentData(token);
			continue;
		}
		if (token.type === "comment") {
			bufferComments.push(token);
			continue;
		}
		if (token.type === "directive") {
			tokensBeforeBody.push(...bufferComments, token);
			bufferComments.length = 0;
			continue;
		}
		if (token.type === "doc-end") {
			// istanbul ignore if -- @preserve
			if (!currentDocumentData || currentDocumentData.documentEnd) throw new Error(`Unexpected 'doc-end' token at ${getPointText(context.transformOffset(token.offset))}`);
			currentDocumentData.tokensAfterBody = [...bufferComments];
			bufferComments.length = 0;
			currentDocumentData.documentEnd = token;
			continue;
		}
	}
	// istanbul ignore if -- @preserve
	if (tokensBeforeBody.length > 0) {
		const [firstToken] = tokensBeforeBody;
		throw new Error(`Unexpected '${firstToken.type}' token at ${getPointText(context.transformOffset(firstToken.offset))}`);
	}
	if (bufferComments.length > 0) {
		if (!currentDocumentData) currentDocumentData = createDocumentData(null);
		if (bufferComments.length > 0) {
			currentDocumentData.tokensAfterBody.push(...bufferComments);
			bufferComments.length = 0;
		}
	}
	return documents.map((document) => transformDocument(document, context));
}
//#endregion
export { transformDocuments };
