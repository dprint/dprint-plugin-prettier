// @nts-check
import { createEmptyPosition, createPosition } from "../factories/position.mjs";
import { maybeContentPropertyToken, tokens } from "../cst.mjs";
import { extractComments } from "../utils/extract-comments.mjs";
import { createMappingKey } from "../factories/mapping-key.mjs";
import { createMappingValue } from "../factories/mapping-value.mjs";
import { isEmptyNode } from "./transform.mjs";
//#region src/transforms/pair.ts
/** @returns {import("yaml-unist-types").YamlNode} */ function transformPair(/** @type {import("../../yaml/browser/dist/nodes/Pair.js").Pair} */ pair, /** @type {import("yaml-cst-types").CollectionItem} */ srcItem, /** @type {import("./context.mjs").default} */ context, /** @type {(position: import("yaml-unist-types").Position, key: import("yaml-unist-types").YamlNode, value: import("yaml-unist-types").YamlNode) => import("yaml-unist-types").YamlNode} */ createNode) {
	var _srcItem$key;
	const keyPropTokens = [];
	/** @type {import("yaml-cst-types").Token | null} */ let explicitKeyIndToken = null;
	for (const token of tokens(srcItem.start)) {
		if (maybeContentPropertyToken(token)) {
			keyPropTokens.push(token);
			continue;
		}
		if (token.type === "explicit-key-ind") {
			explicitKeyIndToken = token;
			continue;
		}
		// istanbul ignore else -- @preserve
		if (token.type === "comma") continue;
		// istanbul ignore next -- @preserve
		throw new Error(`Unexpected token type in collection item start: ${token.type}`);
	}
	const valuePropTokens = [];
	/** @type {import("yaml-cst-types").Token | null} */ let mapValueIndToken = null;
	for (const token of tokens(srcItem.sep)) {
		if (maybeContentPropertyToken(token)) {
			valuePropTokens.push(token);
			continue;
		}
		// istanbul ignore else -- @preserve
		if (token.type === "map-value-ind") {
			mapValueIndToken = token;
			continue;
		}
		// istanbul ignore next -- @preserve
		throw new Error(`Unexpected token type in collection item sep: ${token.type}`);
	}
	const keyStartOffset = (explicitKeyIndToken === null || explicitKeyIndToken === void 0 ? void 0 : explicitKeyIndToken.offset) ?? ((_srcItem$key = srcItem.key) === null || _srcItem$key === void 0 ? void 0 : _srcItem$key.offset) ?? (mapValueIndToken === null || mapValueIndToken === void 0 ? void 0 : mapValueIndToken.offset) ?? srcItem.value.offset;
	const keyRange = [keyStartOffset, srcItem.key ? pair.key.range[1] : explicitKeyIndToken ? explicitKeyIndToken.offset + explicitKeyIndToken.source.length : keyStartOffset];
	let valueRange = null;
	if (pair.value) {
		var _srcItem$value;
		const valueStartOffset = (mapValueIndToken === null || mapValueIndToken === void 0 ? void 0 : mapValueIndToken.offset) ?? ((_srcItem$value = srcItem.value) === null || _srcItem$value === void 0 ? void 0 : _srcItem$value.offset) ?? pair.value.range[0];
		valueRange = [valueStartOffset, srcItem.value ? pair.value.range[1] : mapValueIndToken ? mapValueIndToken.offset + mapValueIndToken.source.length : valueStartOffset];
	}
	return transformAstPair(pair, context, createNode, {
		range: keyRange,
		props: { tokens: keyPropTokens }
	}, {
		range: valueRange,
		props: { tokens: valuePropTokens }
	});
}
/** @returns {import("yaml-unist-types").YamlNode} */ function transformAstPair(/** @type {import("../../yaml/browser/dist/nodes/Pair.js").Pair} */ pair, /** @type {import("./context.mjs").default} */ context, /** @type {(position: import("yaml-unist-types").Position, key: import("yaml-unist-types").YamlNode, value: import("yaml-unist-types").YamlNode) => import("yaml-unist-types").YamlNode} */ createNode, /** @type {{ range: any[] | null, props: import("yaml-unist-types").TransformProps }} */ additionalKeyData, /** @type {{ range: any[] | null, props: import("yaml-unist-types").TransformProps }} */ additionalValueData) {
	let keyContent = null;
	if (!isEmptyNode(pair.key, additionalKeyData.props)) keyContent = context.transformNode(pair.key, additionalKeyData.props);
	else extractComments(additionalKeyData.props.tokens, context);
	let valueContent = null;
	if (!isEmptyNode(pair.value, additionalValueData.props)) valueContent = context.transformNode(pair.value, additionalValueData.props);
	else extractComments(additionalValueData.props.tokens, context);
	const mappingKey = createMappingKey(context.transformRange([additionalKeyData.range ? additionalKeyData.range[0] : keyContent.position.start.offset, keyContent ? keyContent.position.end.offset : additionalKeyData.range[1]]), keyContent);
	const mappingValue = valueContent || additionalValueData.range ? createMappingValue(context.transformRange([additionalValueData.range ? additionalValueData.range[0] : // istanbul ignore next -- @preserve
	valueContent.position.start.offset, valueContent ? valueContent.position.end.offset : additionalValueData.range[0] + 1]), valueContent) : null;
	return createNode(createPosition(mappingKey.position.start, mappingValue ? mappingValue.position.end : mappingKey.position.end), mappingKey, mappingValue || createMappingValue(createEmptyPosition(mappingKey.position.end), null));
}
//#endregion
export { transformPair };
