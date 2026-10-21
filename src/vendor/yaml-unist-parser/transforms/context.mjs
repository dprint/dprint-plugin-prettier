// @nts-check
import { createPosition } from "../factories/position.mjs";
import { transformComment } from "./comment.mjs";
import { transformContentProperties } from "./content.mjs";
import { transformNode } from "./transform.mjs";
//#region src/transforms/context.ts
/**
 * @typedef {{ line: number, column: number, offset: number }} Point
 * @typedef {{ start: Point, end: Point }} Position
 * @typedef {{
 *   type: string,
 *   position: Position,
 *   children?: any[],
 *   leadingComments?: any[],
 *   middleComments?: any[],
 *   indicatorComment?: any,
 *   trailingComment?: any,
 *   endComments?: any[],
 *   anchor?: any,
 *   tag?: any,
 *   _parent?: any,
 *   comments?: any[],
 *   content?: any,
 *   head?: any,
 *   body?: any,
 *   key?: any,
 *   value?: any,
 *   indent?: any,
 *   chomping?: string,
 *   name?: string,
 *   parameters?: any[],
 *   documentEndMarker?: any,
 *   directivesEndMarker?: any,
 * }} YamlNode
 */
var Context = class {
	/** @type {string} */ text;
	/** @type {any[]} */ comments = [];
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
	/** @returns {Position} */ transformRange(/** @type {any[]} */ range) {
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
