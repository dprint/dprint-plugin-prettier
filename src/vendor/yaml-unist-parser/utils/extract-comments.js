// @nts-check
/** @returns {any[]} */ export function extractComments(/** @type {any[]} */ nodes, context) {
    const restNodes = [];
    for (const node of nodes) {
        if (node && "type" in node && node.type === "COMMENT") {
            context.comments.push(context.transformNode(node));
        }
        else {
            restNodes.push(node);
        }
    }
    return restNodes;
}
