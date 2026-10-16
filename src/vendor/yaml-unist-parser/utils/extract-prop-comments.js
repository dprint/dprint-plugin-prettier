import { PropLeadingCharacter } from "../constants.js";
import { createComment } from "../factories/comment.js";
export function extractPropComments(node, context) {
    for (const propRange of node.props) {
        const leadingChar = context.text[propRange.origStart];
        switch (leadingChar) {
            case PropLeadingCharacter.Comment:
                context.comments.push(createComment(context.transformRange(propRange), context.text.slice(propRange.origStart + 1, propRange.origEnd)));
                break;
            // istanbul ignore next
            default:
                throw new Error(`Unexpected leading character ${JSON.stringify(leadingChar)}`);
        }
    }
}
