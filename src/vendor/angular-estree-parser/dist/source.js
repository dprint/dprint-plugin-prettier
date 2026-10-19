// @nts-check
import { getCharacterIndex, sourceSpanToLocationInformation } from "./utilities.js";
//#region src/source.ts
var Source = class {
	text;
	constructor(/** @type {string} */ text) {
		this.text = text;
	}
	getCharacterIndex(pattern, index) {
		return getCharacterIndex(this.text, pattern, index);
	}
	transformSpan(span) {
		return sourceSpanToLocationInformation(span);
	}
	createNode(properties, location) {
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
		const node = {
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
