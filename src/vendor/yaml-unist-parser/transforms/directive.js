import { createDirective } from "../factories/directive.js";
import { extractPropComments } from "../utils/extract-prop-comments.js";
export function transformDirective(directive, context) {
    extractPropComments(directive, context);
    return createDirective(context.transformRange(directive.range), directive.name, directive.parameters);
}
