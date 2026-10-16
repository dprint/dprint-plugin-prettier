// eemeli/yaml uses fake `plain`s to store comments https://github.com/eemeli/yaml/commit/c04ab2c2
export function removeFakeNodes(node) {
    if ("children" in node) {
        if (node.children.length === 1) {
            const child = node.children[0];
            if (child.type === "plain" &&
                child.tag === null &&
                child.anchor === null &&
                child.value === "") {
                node.children.splice(0, 1);
                return node;
            }
        }
        node.children.forEach(removeFakeNodes);
    }
    return node;
}
