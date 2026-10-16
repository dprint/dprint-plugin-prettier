import { createDocument } from "../factories/document.js";
import { createPosition } from "../factories/position.js";
import { transformDocumentBody } from "./document-body.js";
import { transformDocumentHead } from "./document-head.js";
export function transformDocument(document, context) {
    const { createDocumentHeadWithTrailingComment, documentHeadEndMarkerPoint } = transformDocumentHead(document, context);
    const { documentBody, documentEndPoint, documentTrailingComment, documentHeadTrailingComment, } = transformDocumentBody(document, context, documentHeadEndMarkerPoint);
    const documentHead = createDocumentHeadWithTrailingComment(documentHeadTrailingComment);
    if (documentTrailingComment) {
        context.comments.push(documentTrailingComment);
    }
    return createDocument(createPosition(documentHead.position.start, documentEndPoint), documentHead, documentBody, documentTrailingComment);
}
