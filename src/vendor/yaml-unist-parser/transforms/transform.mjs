// @nts-check
import { transformAlias } from "./alias.mjs";
import { transformBlockFolded } from "./block-folded.mjs";
import { transformBlockLiteral } from "./block-literal.mjs";
import { transformFlowMap } from "./flow-map.mjs";
import { transformFlowSeq } from "./flow-seq.mjs";
import { transformMap } from "./map.mjs";
import { transformPlain } from "./plain.mjs";
import { transformQuoteDouble } from "./quote-double.mjs";
import { transformQuoteSingle } from "./quote-single.mjs";
import { transformSeq } from "./seq.mjs";
import * as YAML from "yaml";
//#region src/transforms/transform.ts
/** @returns {import("yaml-unist-types").YamlNode | null} */ function transformNode(/** @type {import("../../yaml/browser/dist/nodes/YAMLMap.js").YAMLMap | import("../../yaml/browser/dist/nodes/Scalar.js").Scalar | import("../../yaml/browser/dist/nodes/YAMLSeq.js").YAMLSeq | import("../../yaml/browser/dist/nodes/Alias.js").Alias | import("../../yaml/browser/dist/schema/yaml-1.1/omap.js").YAMLOMap | import("../../yaml/browser/dist/schema/yaml-1.1/set.js").YAMLSet} */ node, /** @type {import("./context.mjs").default} */ context, /** @type {import("yaml-unist-types").TransformProps} */ props) {
	if (node == null) return null;
	if (YAML.isAlias(node)) return transformAlias(node, context, props);
	if (YAML.isMap(node)) {
		if (node.flow) return transformFlowMap(node, context, props);
		return transformMap(node, context, props);
	}
	if (YAML.isSeq(node)) {
		if (node.flow) return transformFlowSeq(node, context, props);
		return transformSeq(node, context, props);
	}
	if (YAML.isScalar(node)) {
		switch (node.type) {
			case "BLOCK_FOLDED": return transformBlockFolded(node, context, props);
			case "BLOCK_LITERAL": return transformBlockLiteral(node, context, props);
			case "PLAIN": return transformPlain(node, context, props);
			case "QUOTE_DOUBLE": return transformQuoteDouble(node, context, props);
			case "QUOTE_SINGLE": return transformQuoteSingle(node, context, props);
		}
		// istanbul ignore next -- @preserve
		throw new Error(`Unexpected scalar type: ${node.type}`);
	}
	// istanbul ignore next -- @preserve
	throw new Error(`Unexpected unknown node type`);
}
/** @returns {boolean} */ function isEmptyNode(/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar | import("../../yaml/browser/dist/nodes/YAMLMap.js").YAMLMap | import("../../yaml/browser/dist/nodes/YAMLSeq.js").YAMLSeq | import("../../yaml/browser/dist/nodes/Alias.js").Alias | import("../../yaml/browser/dist/schema/yaml-1.1/omap.js").YAMLOMap | import("../../yaml/browser/dist/schema/yaml-1.1/set.js").YAMLSet | null} */ node, /** @type {import("yaml-unist-types").TransformProps} */ props) {
	return !node || node.range[0] === node.range[1] && props.tokens.every(/** @returns {boolean} */ (t) => t.type === "comment");
}
//#endregion
export { isEmptyNode, transformNode };
