import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.js";
export function createCommentAttachable() {
    return {
        ...createLeadingCommentAttachable(),
        ...createTrailingCommentAttachable(),
    };
}
