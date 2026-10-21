// @nts-check
import { getNsPrefix } from "./tags.mjs";
import { DomElementSchemaRegistry } from "../schema/dom_element_schema_registry.mjs";
//#region ../compiler/src/ml_parser/html_tags.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var HtmlTagDefinition = class {
	closedByChildren = {};
	contentType;
	/** @type {boolean} */ closedByParent = false;
	/** @type {string | null} */ implicitNamespacePrefix;
	/** @type {boolean} */ isVoid;
	/** @type {boolean} */ ignoreFirstLf;
	/** @type {boolean} */ canSelfClose;
	/** @type {boolean} */ preventNamespaceInheritance;
	constructor({ closedByChildren, implicitNamespacePrefix, contentType = 2, closedByParent = false, isVoid = false, ignoreFirstLf = false, preventNamespaceInheritance = false, canSelfClose = false } = {}) {
		if (closedByChildren && closedByChildren.length > 0) closedByChildren.forEach(/** @returns {boolean} */ (/** @type {string} */ tagName) => this.closedByChildren[tagName] = true);
		this.isVoid = isVoid;
		this.closedByParent = closedByParent || isVoid;
		this.implicitNamespacePrefix = implicitNamespacePrefix || null;
		this.contentType = contentType;
		this.ignoreFirstLf = ignoreFirstLf;
		this.preventNamespaceInheritance = preventNamespaceInheritance;
		this.canSelfClose = canSelfClose ?? isVoid;
	}
	/** @returns {boolean} */ isClosedByChild(/** @type {string} */ name) {
		return this.isVoid || name.toLowerCase() in this.closedByChildren;
	}
	/** @returns {number | undefined} */ getContentType(prefix) {
		if (typeof this.contentType === "object") return (prefix === void 0 ? void 0 : this.contentType[prefix]) ?? this.contentType.default;
		return this.contentType;
	}
};
/** @type {HtmlTagDefinition | undefined} */ let DEFAULT_TAG_DEFINITION;
let TAG_DEFINITIONS;
/** @returns {HtmlTagDefinition} */ function getHtmlTagDefinition(/** @type {string} */ tagName) {
	if (!TAG_DEFINITIONS) {
		DEFAULT_TAG_DEFINITION = new HtmlTagDefinition({ canSelfClose: true });
		TAG_DEFINITIONS = Object.assign(Object.create(null), {
			"base": new HtmlTagDefinition({ isVoid: true }),
			"meta": new HtmlTagDefinition({ isVoid: true }),
			"area": new HtmlTagDefinition({ isVoid: true }),
			"embed": new HtmlTagDefinition({ isVoid: true }),
			"link": new HtmlTagDefinition({ isVoid: true }),
			"img": new HtmlTagDefinition({ isVoid: true }),
			"input": new HtmlTagDefinition({ isVoid: true }),
			"param": new HtmlTagDefinition({ isVoid: true }),
			"hr": new HtmlTagDefinition({ isVoid: true }),
			"br": new HtmlTagDefinition({ isVoid: true }),
			"source": new HtmlTagDefinition({ isVoid: true }),
			"track": new HtmlTagDefinition({ isVoid: true }),
			"wbr": new HtmlTagDefinition({ isVoid: true }),
			"p": new HtmlTagDefinition({
				closedByChildren: [
					"address",
					"article",
					"aside",
					"blockquote",
					"div",
					"dl",
					"fieldset",
					"footer",
					"form",
					"h1",
					"h2",
					"h3",
					"h4",
					"h5",
					"h6",
					"header",
					"hgroup",
					"hr",
					"main",
					"nav",
					"ol",
					"p",
					"pre",
					"section",
					"table",
					"ul"
				],
				closedByParent: true
			}),
			"thead": new HtmlTagDefinition({ closedByChildren: ["tbody", "tfoot"] }),
			"tbody": new HtmlTagDefinition({
				closedByChildren: ["tbody", "tfoot"],
				closedByParent: true
			}),
			"tfoot": new HtmlTagDefinition({
				closedByChildren: ["tbody"],
				closedByParent: true
			}),
			"tr": new HtmlTagDefinition({
				closedByChildren: ["tr"],
				closedByParent: true
			}),
			"td": new HtmlTagDefinition({
				closedByChildren: ["td", "th"],
				closedByParent: true
			}),
			"th": new HtmlTagDefinition({
				closedByChildren: ["td", "th"],
				closedByParent: true
			}),
			"col": new HtmlTagDefinition({ isVoid: true }),
			"svg": new HtmlTagDefinition({ implicitNamespacePrefix: "svg" }),
			"foreignObject": new HtmlTagDefinition({
				implicitNamespacePrefix: "svg",
				preventNamespaceInheritance: true
			}),
			"math": new HtmlTagDefinition({ implicitNamespacePrefix: "math" }),
			"li": new HtmlTagDefinition({
				closedByChildren: ["li"],
				closedByParent: true
			}),
			"dt": new HtmlTagDefinition({ closedByChildren: ["dt", "dd"] }),
			"dd": new HtmlTagDefinition({
				closedByChildren: ["dt", "dd"],
				closedByParent: true
			}),
			"rb": new HtmlTagDefinition({
				closedByChildren: [
					"rb",
					"rt",
					"rtc",
					"rp"
				],
				closedByParent: true
			}),
			"rt": new HtmlTagDefinition({
				closedByChildren: [
					"rb",
					"rt",
					"rtc",
					"rp"
				],
				closedByParent: true
			}),
			"rtc": new HtmlTagDefinition({
				closedByChildren: [
					"rb",
					"rtc",
					"rp"
				],
				closedByParent: true
			}),
			"rp": new HtmlTagDefinition({
				closedByChildren: [
					"rb",
					"rt",
					"rtc",
					"rp"
				],
				closedByParent: true
			}),
			"optgroup": new HtmlTagDefinition({
				closedByChildren: ["optgroup"],
				closedByParent: true
			}),
			"option": new HtmlTagDefinition({
				closedByChildren: ["option", "optgroup"],
				closedByParent: true
			}),
			"pre": new HtmlTagDefinition({ ignoreFirstLf: true }),
			"listing": new HtmlTagDefinition({ ignoreFirstLf: true }),
			"style": new HtmlTagDefinition({ contentType: 0 }),
			"script": new HtmlTagDefinition({ contentType: 0 }),
			"title": new HtmlTagDefinition({ contentType: {
				default: 1,
				svg: 2
			} }),
			"textarea": new HtmlTagDefinition({
				contentType: 1,
				ignoreFirstLf: true
			})
		});
		new DomElementSchemaRegistry().allKnownElementNames().forEach((knownTagName) => {
			if (!TAG_DEFINITIONS[knownTagName] && getNsPrefix(knownTagName) === null) TAG_DEFINITIONS[knownTagName] = new HtmlTagDefinition({ canSelfClose: false });
		});
	}
	return TAG_DEFINITIONS[tagName] ?? DEFAULT_TAG_DEFINITION;
}
//#endregion
export { HtmlTagDefinition, getHtmlTagDefinition };
