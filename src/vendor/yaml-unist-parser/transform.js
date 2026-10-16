import { transformAlias } from "./transforms/alias.js";
import { transformBlockFolded } from "./transforms/block-folded.js";
import { transformBlockLiteral } from "./transforms/block-literal.js";
import { transformComment } from "./transforms/comment.js";
import { transformDirective } from "./transforms/directive.js";
import { transformDocument } from "./transforms/document.js";
import { transformFlowMap } from "./transforms/flow-map.js";
import { transformFlowSeq } from "./transforms/flow-seq.js";
import { transformMap } from "./transforms/map.js";
import { transformPlain } from "./transforms/plain.js";
import { transformQuoteDouble } from "./transforms/quote-double.js";
import { transformQuoteSingle } from "./transforms/quote-single.js";
import { transformSeq } from "./transforms/seq.js";
export function transformNode(node, context) {
    if (node === null || (node.type === undefined && node.value === null)) {
        return null;
    }
    // prettier-ignore
    switch (node.type) {
        case "ALIAS": return transformAlias(node, context);
        case "BLOCK_FOLDED": return transformBlockFolded(node, context);
        case "BLOCK_LITERAL": return transformBlockLiteral(node, context);
        case "COMMENT": return transformComment(node, context);
        case "DIRECTIVE": return transformDirective(node, context);
        case "DOCUMENT": return transformDocument(node, context);
        case "FLOW_MAP": return transformFlowMap(node, context);
        case "FLOW_SEQ": return transformFlowSeq(node, context);
        case "MAP": return transformMap(node, context);
        case "PLAIN": return transformPlain(node, context);
        case "QUOTE_DOUBLE": return transformQuoteDouble(node, context);
        case "QUOTE_SINGLE": return transformQuoteSingle(node, context);
        case "SEQ": return transformSeq(node, context);
        // istanbul ignore next
        default: throw new Error(`Unexpected node type ${node.type}`);
    }
}
