// @nts-check
import { createPosition } from "../factories/position.mjs";
import { transformComment } from "./comment.mjs";
import { transformContentProperties } from "./content.mjs";
import { transformNode } from "./transform.mjs";
//#region src/transforms/context.ts
/**
 * @typedef {import("yaml-unist-types").Point} Point
 * @typedef {import("yaml-unist-types").Position} Position
 * @typedef {import("yaml-unist-types").YamlNode} YamlNode
 */
var Context = class {
	/** @type {string} */ text;
	/** @type {YamlNode[]} */ comments = [];
	/** @type {import("../../yaml/browser/dist/parse/line-counter.js").LineCounter} */ #lineCounter;
	constructor(/** @type {string} */ text, /** @type {import("../../yaml/browser/dist/parse/line-counter.js").LineCounter} */ lineCounter) {
		this.text = text;
		this.#lineCounter = lineCounter;
	}
	/** @returns {Point} */ transformOffset(/** @type {number} */ offset) {
		const { line, col } = this.#lineCounter.linePos(offset);
		return {
			line,
			column: col,
			offset
		};
	}
	/** @returns {Position} */ transformRange(/** @type {number[]} */ range) {
		const [start, end] = range.map((/** @type {number} */ position) => this.transformOffset(position));
		return createPosition(start, end);
	}
	/** @returns {import("yaml-unist-types").YamlNode | null} */ transformNode(/** @type {import("../../yaml/browser/dist/nodes/YAMLMap.js").YAMLMap | import("../../yaml/browser/dist/nodes/Scalar.js").Scalar | import("../../yaml/browser/dist/nodes/YAMLSeq.js").YAMLSeq | import("../../yaml/browser/dist/nodes/Alias.js").Alias | import("../../yaml/browser/dist/schema/yaml-1.1/omap.js").YAMLOMap | import("../../yaml/browser/dist/schema/yaml-1.1/set.js").YAMLSet} */ node, /** @type {import("yaml-unist-types").TransformProps} */ props) {
		return transformNode(node, this, props);
	}
	/** @returns {YamlNode} */ transformComment(/** @type {import("yaml-cst-types").Token} */ node) {
		const comment = transformComment(node, this);
		this.comments.push(comment);
		return comment;
	}
	/** @returns {import("yaml-unist-types").Content} */ transformContentProperties(/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar | import("../../yaml/browser/dist/nodes/YAMLMap.js").YAMLMap | import("../../yaml/browser/dist/nodes/YAMLSeq.js").YAMLSeq | import("../../yaml/browser/dist/nodes/Alias.js").Alias | import("../../yaml/browser/dist/schema/yaml-1.1/omap.js").YAMLOMap | import("../../yaml/browser/dist/schema/yaml-1.1/set.js").YAMLSet} */ node, /** @type {import("yaml-cst-types").Token[]} */ tokens) {
		return transformContentProperties(node, tokens, this);
	}
};
//#endregion
export { Context as default };
