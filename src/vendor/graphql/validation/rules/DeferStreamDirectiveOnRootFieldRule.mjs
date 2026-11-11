import { GraphQLError } from "../../error/GraphQLError.mjs";
import { Kind } from "../../language/kinds.mjs";
import { GraphQLDeferDirective, GraphQLStreamDirective, } from "../../type/directives.mjs";
export function DeferStreamDirectiveOnRootFieldRule(context) {
    return {
        OperationDefinition(node) {
            const document = context.getDocument();
            const fragments = new Map();
            for (const definition of document.definitions) {
                if (definition.kind === Kind.FRAGMENT_DEFINITION) {
                    fragments.set(definition.name.value, definition);
                }
            }
            if (node.operation !== 'subscription' && node.operation !== 'mutation') {
                return;
            }
            const schema = context.getSchema();
            const rootType = schema.getRootType(node.operation);
            if (rootType) {
                forbidDeferStream({
                    context,
                    operationType: node.operation,
                    rootType,
                    fragments,
                    selectionSet: node.selectionSet,
                    visitedFragments: new Set(),
                });
            }
        },
    };
}
function forbidDeferStream({ context, operationType, rootType, fragments, selectionSet, visitedFragments, }) {
    for (const selection of selectionSet.selections) {
        if (selection.kind === 'Field') {
            const stream = selection.directives?.find((d) => d.name.value === GraphQLStreamDirective.name);
            if (stream) {
                context.reportError(new GraphQLError(`Stream directive cannot be used on root ${operationType} type "${rootType}".`, { nodes: stream }));
            }
        }
        else if (selection.kind === 'FragmentSpread') {
            const fragmentName = selection.name.value;
            if (visitedFragments.has(fragmentName)) {
                continue;
            }
            const fragment = fragments.get(fragmentName);
            if (fragment) {
                const defer = getDeferDirective(selection);
                if (defer !== undefined) {
                    context.reportError(new GraphQLError(`Defer directive cannot be used on root ${operationType} type "${rootType}".`, { nodes: defer }));
                }
                forbidDeferStream({
                    context,
                    operationType,
                    rootType,
                    fragments,
                    selectionSet: fragment.selectionSet,
                    visitedFragments,
                });
            }
            visitedFragments.add(fragmentName);
        }
        else if (selection.kind === 'InlineFragment') {
            const defer = getDeferDirective(selection);
            if (defer !== undefined) {
                context.reportError(new GraphQLError(`Defer directive cannot be used on root ${operationType} type "${rootType}".`, { nodes: defer }));
            }
            forbidDeferStream({
                context,
                operationType,
                rootType,
                fragments,
                selectionSet: selection.selectionSet,
                visitedFragments,
            });
        }
    }
}
function getDeferDirective(fragment) {
    return fragment.directives?.find((d) => d.name.value === GraphQLDeferDirective.name);
}
//# sourceMappingURL=DeferStreamDirectiveOnRootFieldRule.js.map