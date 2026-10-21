// @nts-check
import { createPosition } from "../factories/position.mjs";
import { maybeContentPropertyToken, tokens } from "../cst.mjs";
import { extractComments } from "../utils/extract-comments.mjs";
import { transformPair } from "./pair.mjs";
import { getLast } from "../utils/get-last.mjs";
import { createMapping } from "../factories/mapping.mjs";
import { createMappingItem } from "../factories/mapping-item.mjs";
import { createSequence } from "../factories/sequence.mjs";
import { createSequenceItem } from "../factories/sequence-item.mjs";
import { isEmptyNode } from "./transform.mjs";
import * as YAML from "yaml";
//#region src/transforms/seq.ts
/** @returns {import("yaml-unist-types").YamlNode} */ function transformSeq(/** @type {import("../../yaml/browser/dist/nodes/YAMLSeq.js").YAMLSeq | import("../../yaml/browser/dist/schema/yaml-1.1/omap.js").YAMLOMap} */ seq, /** @type {import("./context.mjs").default} */ context, /** @type {import("yaml-unist-types").TransformProps} */ props) {
	const srcToken = seq.srcToken;
	// istanbul ignore if -- @preserve
	if (!srcToken || srcToken.type !== "block-seq") throw new Error("Expected block sequence srcToken");
	const sequenceItems = seq.items.map((itemNode, /** @type {number} */ index) => {
		const srcItem = srcToken.items[index];
		const propTokens = [];
		/** @type {import("yaml-cst-types").Token | null} */ let seqItemIndToken = null;
		for (const token of tokens(srcItem.start)) {
			if (maybeContentPropertyToken(token)) {
				propTokens.push(token);
				continue;
			}
			// istanbul ignore else -- @preserve
			if (token.type === "seq-item-ind") {
				seqItemIndToken = token;
				continue;
			}
			// istanbul ignore next -- @preserve
			throw new Error(`Unexpected token type in sequence item start: ${token.type}`);
		}
		const item = transformItemValue(itemNode, context, { tokens: propTokens });
		return createSequenceItem(createPosition(seqItemIndToken ? context.transformOffset(seqItemIndToken.offset) : item.position.start, (item === null || item === void 0 ? void 0 : item.position.end) ?? context.transformOffset(seqItemIndToken.offset + seqItemIndToken.source.length)), item);
	});
	if (seq.items.length < srcToken.items.length) for (let i = seq.items.length; i < srcToken.items.length; i++) {
		const srcItem = srcToken.items[i];
		for (const token of extractComments(srcItem.start, context))
 // istanbul ignore next -- @preserve
		throw new Error(`Unexpected token type in collection item start: ${token.type}`);
	}
	return createSequence(createPosition(sequenceItems[0].position.start, getLast(sequenceItems).position.end), context.transformContentProperties(seq, props.tokens), sequenceItems);
}
/** @returns {import("yaml-unist-types").YamlNode | null} */ function transformItemValue(/** @type {import("../../yaml/browser/dist/nodes/YAMLMap.js").YAMLMap | import("../../yaml/browser/dist/nodes/Scalar.js").Scalar | import("../../yaml/browser/dist/nodes/YAMLSeq.js").YAMLSeq | import("../../yaml/browser/dist/nodes/Alias.js").Alias | import("../../yaml/browser/dist/nodes/Pair.js").Pair} */ itemNode, /** @type {import("./context.mjs").default} */ context, /** @type {import("yaml-unist-types").TransformProps} */ props) {
	if (!YAML.isPair(itemNode)) {
		if (isEmptyNode(itemNode, props)) {
			extractComments(props.tokens, context);
			return null;
		}
		return context.transformNode(itemNode, props);
	}
	const srcItem = itemNode.srcToken;
	const mappingItem = transformPair(itemNode, srcItem, context, createMappingItem);
	return createMapping(mappingItem.position, context.transformContentProperties(itemNode.key, props.tokens), [mappingItem]);
}
//#endregion
export { transformSeq };
