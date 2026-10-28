"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.separateOperations = separateOperations;
const kinds_ts_1 = require("../language/kinds.js");
const visitor_ts_1 = require("../language/visitor.js");
function separateOperations(documentAST) {
    const operations = [];
    const depGraph = Object.create(null);
    for (const definitionNode of documentAST.definitions) {
        switch (definitionNode.kind) {
            case kinds_ts_1.Kind.OPERATION_DEFINITION:
                operations.push(definitionNode);
                break;
            case kinds_ts_1.Kind.FRAGMENT_DEFINITION:
                depGraph[definitionNode.name.value] = collectDependencies(definitionNode.selectionSet);
                break;
            default:
        }
    }
    const separatedDocumentASTs = Object.create(null);
    for (const operation of operations) {
        const dependencies = new Set();
        for (const fragmentName of collectDependencies(operation.selectionSet)) {
            collectTransitiveDependencies(dependencies, depGraph, fragmentName);
        }
        const operationName = operation.name ? operation.name.value : '';
        separatedDocumentASTs[operationName] = {
            kind: kinds_ts_1.Kind.DOCUMENT,
            definitions: documentAST.definitions.filter((node) => node === operation ||
                (node.kind === kinds_ts_1.Kind.FRAGMENT_DEFINITION &&
                    dependencies.has(node.name.value))),
        };
    }
    return separatedDocumentASTs;
}
function collectTransitiveDependencies(collected, depGraph, fromName) {
    if (!collected.has(fromName)) {
        collected.add(fromName);
        const immediateDeps = depGraph[fromName];
        if (immediateDeps !== undefined) {
            for (const toName of immediateDeps) {
                collectTransitiveDependencies(collected, depGraph, toName);
            }
        }
    }
}
function collectDependencies(selectionSet) {
    const dependencies = [];
    (0, visitor_ts_1.visit)(selectionSet, {
        FragmentSpread(node) {
            dependencies.push(node.name.value);
        },
    });
    return dependencies;
}
//# sourceMappingURL=separateOperations.js.map