// @nts-check
import { getCharacterIndex, sourceSpanToLocationInformation } from "./utilities.js";
//#region src/source.ts
/**
 * A node of ESTree that the transforms write out, which `createNode` gives where it is in the text
 * @typedef {{
 *   type: string,
 *   start?: number,
 *   end?: number,
 *   range?: number[],
 *   extra?: any,
 *   [key: string]: any,
 * }} NGNode
 */
var Source = class {
	/** @type {string} */ text;
	constructor(/** @type {string} */ text) {
		this.text = text;
	}
	/** @returns {number} */ getCharacterIndex(/** @type {string | RegExp} */ pattern, /** @type {number} */ index) {
		return getCharacterIndex(this.text, pattern, index);
	}
	transformSpan(/** @type {{ start: number, end: number }} */ span) {
		return sourceSpanToLocationInformation(span);
	}
	/** @returns {NGNode} */ createNode(/** @type {NGNode} */ properties, /** @type {any} */ location) {
		let start = properties.start;
		let end = properties.end;
		let range = properties.range;
		if (location) if (Array.isArray(location)) {
			[start, end] = location;
			range = location;
		} else {
			({start, end} = location.sourceSpan ?? location);
			range = [start, end];
		}
		/* c8 ignore next 4 @preserve */
		if (range) [start, end] = range;
		else if (typeof start === "number" && typeof end === "number") range = [start, end];
		/* c8 ignore next 3 @preserve */
		if (!(typeof start === "number" && typeof end === "number" && range)) throw new Error("Missing location information");
		/** @type {NGNode} */ const node = {
			...properties,
			start,
			end,
			range
		};
		switch (node.type) {
			case "NumericLiteral":
			case "StringLiteral":
			case "RegExpLiteral": {
				const raw = this.text.slice(start, end);
				const { value } = node;
				node.extra = {
					...node.extra,
					raw,
					rawValue: value
				};
				break;
			}
		}
		return node;
	}
};
//#endregion
export { Source };
