// @nts-check
import { getPointText } from "../utils/get-point-text.mjs";
import { maybeContentPropertyToken, tokens } from "../cst.mjs";
import { extractComments } from "../utils/extract-comments.mjs";
import { getLast } from "../utils/get-last.mjs";
import { createDocumentBody } from "../factories/document-body.mjs";
import { findCharIndex } from "../utils/find-char-index.mjs";
//#region src/transforms/document-body.ts
function transformDocumentBody(docStart, /** @type {any[]} */ tokensBeforeBody, cstNode, /** @type {import("../../yaml/browser/dist/doc/Document.js").Document} */ document, /** @type {any[]} */ tokensAfterBody, docEnd, /** @type {import("./context.mjs").default} */ context) {
	const { documentTrailingComment, endComments, propTokens } = categorizeNodes(tokensBeforeBody, cstNode, tokensAfterBody, docEnd, context);
	const hasContent = document.contents && (document.contents.range[0] < document.contents.range[1] || propTokens.some(/** @returns {boolean} */ (token) => token.type === "tag" || token.type === "anchor"));
	const content = hasContent ? context.transformNode(document.contents, { tokens: propTokens }) : null;
	if (!hasContent) for (const token of extractComments(propTokens, context))
 // istanbul ignore next -- @preserve
	throw new Error(`Unexpected token type in empty document body: ${token.type}`);
	const { position, documentEndPoint } = getPosition(docStart, document, content, docEnd, context);
	return {
		documentBody: createDocumentBody(position, content, endComments),
		documentEndPoint,
		documentTrailingComment
	};
}
function categorizeNodes(/** @type {any[]} */ tokensBeforeBody, cstNode, /** @type {any[] | undefined} */ tokensAfterBody, docEnd, /** @type {import("./context.mjs").default | undefined} */ context) {
	const endComments = [];
	const documentTrailingComments = [];
	const propTokens = [];
	for (const token of tokensBeforeBody) {
		if (maybeContentPropertyToken(token)) {
			propTokens.push(token);
			continue;
		}
		// istanbul ignore next -- @preserve
		throw new Error(`Unexpected token type: ${token.type}`);
	}
	for (const token of extractComments(tokensAfterBody, context))
 // istanbul ignore next -- @preserve
	throw new Error(`Unexpected token type: ${token.type}`);
	const docEndPoint = docEnd ? context.transformOffset(docEnd.offset) : null;
	if (cstNode) for (const token of tokens(cstNode.end, docEnd === null || docEnd === void 0 ? void 0 : docEnd.end)) {
		if (token.type === "comment") {
			const comment = context.transformComment(token);
			if (docEndPoint) {
				if (docEndPoint.line === comment.position.start.line) documentTrailingComments.push(comment);
				else if (comment.position.start.line < docEndPoint.line) endComments.push(comment);
			} else endComments.push(comment);
			continue;
		}
		// istanbul ignore next -- @preserve
		throw new Error(`Unexpected token type: ${token.type}`);
	}
	// istanbul ignore if -- @preserve
	if (documentTrailingComments.length > 1) throw new Error(`Unexpected multiple document trailing comments at ${getPointText(documentTrailingComments[1].position.start)}`);
	return {
		propTokens,
		endComments,
		documentTrailingComment: getLast(documentTrailingComments) || null
	};
}
function getPosition(docStart, /** @type {import("../../yaml/browser/dist/doc/Document.js").Document | undefined} */ document, content, docEnd, /** @type {import("./context.mjs").default | undefined} */ context) {
	let origEnd = docEnd ? Math.max(0, docEnd.offset - 1) : findCharIndex(context.text, document.range[2], /\S/u) ?? context.text.length;
	if (context.text[origEnd - 1] === "\r") origEnd--;
	let origStart = content !== null ? content.position.start.offset : origEnd;
	if (docStart) {
		const docStartEnd = docStart.offset + docStart.source.length + 1;
		if (origStart < docStartEnd && docStartEnd <= origEnd) origStart = docStartEnd;
	}
	const position = context.transformRange([origStart, origEnd]);
	return {
		position,
		documentEndPoint: docEnd ? context.transformOffset(docEnd.offset + docEnd.source.length) : position.end
	};
}
//#endregion
export { transformDocumentBody };
