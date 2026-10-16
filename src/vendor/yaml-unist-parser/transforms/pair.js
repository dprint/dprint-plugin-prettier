// @nts-check
import { createMappingKey } from "../factories/mapping-key.js";
import { createMappingValue } from "../factories/mapping-value.js";
import { createEmptyPosition, createPosition } from "../factories/position.js";
export function transformAstPair(/** @type {import("../../yaml/resolveSeq-67caf78a.js").P} */ pair, context, /** @type {(a0?: any, a1?: any, a2?: any) => any} */ createNode, additionalKeyRange, additionalValueRange) {
    const keyContent = context.transformNode(pair.key);
    const valueContent = context.transformNode(pair.value);
    const mappingKey = keyContent || additionalKeyRange
        ? createMappingKey(context.transformRange({
            origStart: additionalKeyRange
                ? additionalKeyRange.origStart
                : keyContent.position.start.offset,
            origEnd: keyContent
                ? keyContent.position.end.offset
                : additionalKeyRange.origStart + 1,
        }), keyContent)
        : null;
    const mappingValue = valueContent || additionalValueRange
        ? createMappingValue(context.transformRange({
            origStart: additionalValueRange
                ? additionalValueRange.origStart
                : // istanbul ignore next
                    valueContent.position.start.offset,
            origEnd: valueContent
                ? valueContent.position.end.offset
                : additionalValueRange.origStart + 1,
        }), valueContent)
        : null;
    return createNode(createPosition(mappingKey ? mappingKey.position.start : mappingValue.position.start, mappingValue ? mappingValue.position.end : mappingKey.position.end), mappingKey ||
        createMappingKey(createEmptyPosition(mappingValue.position.start), null), mappingValue ||
        createMappingValue(createEmptyPosition(mappingKey.position.end), null));
}
