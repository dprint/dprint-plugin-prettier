import { createComment } from "../factories/comment.js";
export function transformComment(comment, context) {
    return createComment(context.transformRange(comment.range), comment.comment);
}
