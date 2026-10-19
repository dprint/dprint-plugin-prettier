// @nts-check
import { createPosition } from "../factories/position.mjs";
import { createDocument } from "../factories/document.mjs";
import { transformDocumentBody } from "./document-body.mjs";
import { transformDocumentHead } from "./document-head.mjs";
//#region src/transforms/document.ts
function transformDocument(document, /** @type {import("./context.mjs").default} */ context) {
	const { documentHead, tokensBeforeBody, docStart } = transformDocumentHead(document.tokensBeforeBody, document.cstNode, document.node, context);
	const { documentBody, documentEndPoint, documentTrailingComment } = transformDocumentBody(docStart, tokensBeforeBody, document.cstNode, document.node, document.tokensAfterBody, document.documentEnd, context);
	return createDocument(createPosition(documentHead.position.start, documentEndPoint), Boolean(docStart), Boolean(document.documentEnd), documentHead, documentBody, documentTrailingComment);
}
//#endregion
export { transformDocument };
