// @nts-check
import { tokens } from "../cst.mjs";
import { createDocumentHead } from "../factories/document-head.mjs";
import { transformDirective } from "./directive.mjs";
//#region src/transforms/document-head.ts
function transformDocumentHead(/** @type {any[]} */ tokensBeforeBody, cstNode, /** @type {import("../../yaml/browser/dist/doc/Document.js").Document} */ document, /** @type {import("./context.mjs").default} */ context) {
	const { directives, endCommentCandidates } = categorizeNodes(tokensBeforeBody, context);
	let betweenTokens = [];
	let docStart = null;
	if (cstNode) for (const token of tokens(cstNode.start)) {
		betweenTokens.push(token);
		if (!docStart && token.type === "doc-start") {
			for (const t of betweenTokens) if (t.type === "comment") {
				const comment = context.transformComment(t);
				endCommentCandidates.push(comment);
			}
			betweenTokens = [];
			docStart = token;
		}
	}
	const position = getPosition(directives, document, docStart, context);
	let trailingComment = null;
	if (docStart && betweenTokens.length > 0) {
		const lastToken = betweenTokens[0];
		if (lastToken.type === "comment") {
			if (context.transformOffset(lastToken.offset).line === position.end.line) {
				trailingComment = context.transformComment(lastToken);
				betweenTokens.shift();
			}
		}
	}
	return {
		documentHead: createDocumentHead(position, directives, docStart ? endCommentCandidates : [], trailingComment),
		docStart,
		tokensBeforeBody: betweenTokens
	};
}
function categorizeNodes(/** @type {any[]} */ tokensBeforeBody, /** @type {import("./context.mjs").default} */ context) {
	const directives = [];
	let endCommentCandidates = [];
	let lastDirective = null;
	for (const token of tokensBeforeBody) if (token.type === "comment") {
		const node = context.transformComment(token);
		if (lastDirective && lastDirective.position.end.line === node.position.start.line && !lastDirective.trailingComment) {
			lastDirective.trailingComment = node;
			lastDirective.position.end = node.position.end;
		} else endCommentCandidates.push(node);
	} else {
		const node = transformDirective(token, context);
		directives.push(node);
		lastDirective = node;
		endCommentCandidates = [];
	}
	return {
		directives,
		endCommentCandidates
	};
}
function getPosition(/** @type {any[]} */ directives, /** @type {import("../../yaml/browser/dist/doc/Document.js").Document | undefined} */ document, docStart, /** @type {import("./context.mjs").default | undefined} */ context) {
	const range = docStart ? [docStart.offset, docStart.offset + docStart.source.length] : document.contents ? [document.contents.range[0], document.contents.range[0]] : [document.range[0], document.range[0]];
	if (directives.length !== 0) range[0] = directives[0].position.start.offset;
	return context.transformRange(range);
}
//#endregion
export { transformDocumentHead };
