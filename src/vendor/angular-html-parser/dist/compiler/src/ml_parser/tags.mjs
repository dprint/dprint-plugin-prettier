// @nts-check
//#region ../compiler/src/ml_parser/tags.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
let TagContentType = /* @__PURE__ */ function(TagContentType) {
	TagContentType[TagContentType["RAW_TEXT"] = 0] = "RAW_TEXT";
	TagContentType[TagContentType["ESCAPABLE_RAW_TEXT"] = 1] = "ESCAPABLE_RAW_TEXT";
	TagContentType[TagContentType["PARSABLE_DATA"] = 2] = "PARSABLE_DATA";
	return TagContentType;
}({});
/** @returns {any[]} */ function splitNsName(/** @type {string} */ elementName, fatal = true) {
	if (elementName[0] != ":") return [null, elementName];
	const colonIndex = elementName.indexOf(":", 1);
	if (colonIndex === -1) {
		if (fatal) throw new Error(`Unsupported format "${elementName}" expecting ":namespace:name"`);
		else return [null, elementName];
	}
	return [elementName.slice(1, colonIndex), elementName.slice(colonIndex + 1)];
}
function isNgContainer(tagName) {
	return splitNsName(tagName)[1] === "ng-container";
}
function isNgContent(tagName) {
	return splitNsName(tagName)[1] === "ng-content";
}
/** @returns {string | null} */ function getNsPrefix(/** @type {string} */ fullName) {
	return fullName === null ? null : splitNsName(fullName)[0];
}
/** @returns {string} */ function mergeNsAndName(/** @type {string | null} */ prefix, /** @type {string} */ localName) {
	return prefix ? `:${prefix}:${localName}` : localName;
}
//#endregion
export { TagContentType, getNsPrefix, isNgContainer, isNgContent, mergeNsAndName, splitNsName };
