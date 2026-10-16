// @nts-check
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createNode } from "./node.js";
export function createDocumentBody(position, content, /** @type {any[]} */ endComments) {
    return {
        ...createNode("documentBody", position),
        ...createEndCommentAttachable(endComments),
        children: !content ? [] : [content],
    };
}
