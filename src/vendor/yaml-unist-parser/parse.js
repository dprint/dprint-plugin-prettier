// @nts-check
import { LinesAndColumns } from "lines-and-columns";
import { attachComments } from "./attach.js";
import { createRoot } from "./factories/root.js";
import { removeCstBlankLine } from "./preprocess.js";
import { transformNode } from "./transform.js";
import { transformContent } from "./transforms/content.js";
import { transformError } from "./transforms/error.js";
import { transformOffset } from "./transforms/offset.js";
import { transformRange } from "./transforms/range.js";
import { addOrigRange } from "./utils/add-orig-range.js";
import { removeFakeNodes } from "./utils/remove-fake-nodes.js";
import { updatePositions } from "./utils/update-positions.js";
import * as YAML from "./yaml.js";
export function parse(/** @type {string | undefined} */ text) {
    const cst = YAML.parseCST(text);
    addOrigRange(cst);
    const documents = cst.map(cstDocument => new YAML.Document({
        merge: false,
        keepCstNodes: true,
    }).parse(cstDocument));
    const locator = new LinesAndColumns(text);
    const comments = [];
    const context = {
        text,
        locator,
        comments,
        transformOffset: (/** @type {number} */ offset) => transformOffset(offset, context),
        transformRange: range => transformRange(range, context),
        transformNode: node => transformNode(node, context),
        transformContent: node => transformContent(node, context),
    };
    for (const document of documents) {
        for (const error of document.errors) {
            if (error instanceof YAML.YAMLSemanticError &&
                error.message === 'Map keys must be unique; "<<" is repeated') {
                continue;
            }
            throw transformError(error, context);
        }
    }
    documents.forEach(document => removeCstBlankLine(document.cstNode));
    const root = createRoot(context.transformRange({ origStart: 0, origEnd: context.text.length }), documents.map(context.transformNode), comments);
    attachComments(root);
    updatePositions(root);
    removeFakeNodes(root);
    return root;
}
