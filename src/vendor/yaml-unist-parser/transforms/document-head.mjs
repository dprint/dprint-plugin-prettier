// @nts-check
import { tokens } from "../cst.mjs";
import { createDocumentHead } from "../factories/document-head.mjs";
import { transformDirective } from "./directive.mjs";
//#region src/transforms/document-head.ts
/** @returns {{ documentHead: import("yaml-unist-types").YamlNode, docStart: import("yaml-cst-types").Token | null, tokensBeforeBody: import("yaml-cst-types").Token[] }} */ function transformDocumentHead(/** @type {import("yaml-cst-types").Token[]} */ tokensBeforeBody, /** @type {import("yaml-cst-types").Token | null} */ cstNode, /** @type {import("../../yaml/browser/dist/doc/Document.js").Document} */ document, /** @type {import("./context.mjs").default} */ context) {
	const { directives, endCommentCandidates } = categorizeNodes(tokensBeforeBody, context);
	/** @type {import("yaml-cst-types").Token[]} */ let betweenTokens = [];
	/** @type {import("yaml-cst-types").Token | null} */ let docStart = null;
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
	/** @type {import("yaml-unist-types").YamlNode | null} */ let trailingComment = null;
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
/** @returns {{ directives: import("yaml-unist-types").YamlNode[], endCommentCandidates: import("yaml-unist-types").YamlNode[] }} */ function categorizeNodes(/** @type {import("yaml-cst-types").Token[]} */ tokensBeforeBody, /** @type {import("./context.mjs").default} */ context) {
	/** @type {import("yaml-unist-types").YamlNode[]} */ const directives = [];
	/** @type {import("yaml-unist-types").YamlNode[]} */ let endCommentCandidates = [];
	/** @type {import("yaml-unist-types").YamlNode | null} */ let lastDirective = null;
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
/** @returns {import("yaml-unist-types").Position} */ function getPosition(/** @type {import("yaml-unist-types").YamlNode[]} */ directives, /** @type {import("../../yaml/browser/dist/doc/Document.js").Document | undefined} */ document, /** @type {import("yaml-cst-types").Token | null} */ docStart, /** @type {import("./context.mjs").default | undefined} */ context) {
	const range = docStart ? [docStart.offset, docStart.offset + docStart.source.length] : document.contents ? [document.contents.range[0], document.contents.range[0]] : [document.range[0], document.range[0]];
	if (directives.length !== 0) range[0] = directives[0].position.start.offset;
	return context.transformRange(range);
}
//#endregion
export { transformDocumentHead };
