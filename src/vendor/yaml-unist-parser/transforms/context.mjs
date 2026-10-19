// @nts-check
import { createPosition } from "../factories/position.mjs";
import { transformComment } from "./comment.mjs";
import { transformContentProperties } from "./content.mjs";
import { transformNode } from "./transform.mjs";
//#region src/transforms/context.ts
var Context = class {
	/** @type {string} */ text;
	comments = [];
	#lineCounter;
	constructor(/** @type {string} */ text, /** @type {import("../../../../prettier/node_modules/yaml/browser/dist/parse/line-counter.js").LineCounter} */ lineCounter) {
		this.text = text;
		this.#lineCounter = lineCounter;
	}
	transformOffset(/** @type {number} */ offset) {
		const { line, col } = this.#lineCounter.linePos(offset);
		return {
			line,
			column: col,
			offset
		};
	}
	transformRange(/** @type {any[]} */ range) {
		const [start, end] = range.map((/** @type {number} */ position) => this.transformOffset(position));
		return createPosition(start, end);
	}
	transformNode(node, props) {
		return transformNode(node, this, props);
	}
	transformComment(node) {
		const comment = transformComment(node, this);
		this.comments.push(comment);
		return comment;
	}
	transformContentProperties(node, /** @type {any[]} */ tokens) {
		return transformContentProperties(node, tokens, this);
	}
};
//#endregion
export { Context as default };
