// @nts-check
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createNode } from "./node.js";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.js";
export function createDocumentHead(position, /** @type {any[]} */ children, /** @type {any[]} */ endComments, trailingComment) {
    return {
        ...createNode("documentHead", position),
        ...createEndCommentAttachable(endComments),
        ...createTrailingCommentAttachable(trailingComment),
        children,
    };
}
