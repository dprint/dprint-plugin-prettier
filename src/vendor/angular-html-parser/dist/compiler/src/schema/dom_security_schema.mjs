//#region ../compiler/src/schema/dom_security_schema.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
let _SECURITY_SCHEMA;
const MATH_ML_NAMESPACE = "math";
const NO_NAMESPACE = "";
const MATCH_ALL_ELEMENTS = "*";
const createNullObj = () => Object.create(null);
/**
* @remarks Keep is a copy of DOM Security Schema.
* @see [SECURITY_SCHEMA](../../../compiler/src/schema/dom_security_schema.ts)
*/
function SECURITY_SCHEMA() {
	if (_SECURITY_SCHEMA) return _SECURITY_SCHEMA;
	_SECURITY_SCHEMA = createNullObj();
	registerContext(
		1,
		/** Namespace */
		void 0,
		[["iframe", ["srcdoc"]], ["*", ["innerHTML", "outerHTML"]]]
	);
	registerContext(
		2,
		/** Namespace */
		void 0,
		[["*", ["style"]]]
	);
	registerContext(
		4,
		/** Namespace */
		void 0,
		[
			["*", ["formAction"]],
			["area", ["href"]],
			["a", ["href", "xlink:href"]],
			["form", ["action"]],
			["img", ["src"]],
			["video", ["src"]]
		]
	);
	registerContext(4, MATH_ML_NAMESPACE, [["*", ["href", "xlink:href"]]]);
	registerContext(
		5,
		/** Namespace */
		void 0,
		[
			["base", ["href"]],
			["embed", ["src"]],
			["frame", ["src"]],
			["iframe", ["src"]],
			["link", ["href"]],
			["object", ["codebase", "data"]]
		]
	);
	registerContext(4, "svg", [["a", ["href", "xlink:href"]]]);
	registerContext(6, "svg", [
		["animate", [
			"attributeName",
			"values",
			"to",
			"from"
		]],
		["set", ["to", "attributeName"]],
		["animateMotion", ["attributeName"]],
		["animateTransform", ["attributeName"]]
	]);
	registerContext(
		6,
		/** Namespace */
		void 0,
		[["unknown", [
			"attributeName",
			"values",
			"to",
			"from",
			"sandbox",
			"allow",
			"allowFullscreen",
			"referrerPolicy",
			"csp",
			"fetchPriority",
			"credentialless"
		]], ["iframe", [
			"sandbox",
			"allow",
			"allowFullscreen",
			"referrerPolicy",
			"csp",
			"fetchPriority",
			"credentialless"
		]]]
	);
	return _SECURITY_SCHEMA;
}
function registerContext(ctx, namespace, specs) {
	const nsKey = namespace ?? NO_NAMESPACE;
	for (const [element, attributeNames] of specs) {
		const tagName = element.toLowerCase();
		for (const attr of attributeNames) {
			var _SECURITY_SCHEMA2;
			const attrLower = attr.toLowerCase();
			const attrSchema = (_SECURITY_SCHEMA2 = _SECURITY_SCHEMA)[attrLower] ?? (_SECURITY_SCHEMA2[attrLower] = createNullObj());
			const nsSchema = attrSchema[nsKey] ?? (attrSchema[nsKey] = createNullObj());
			nsSchema[tagName] = ctx;
		}
	}
}
/**
* Checks the SecurityContext for a given tag and property.
* @param tagName The tag name (e.g. 'div', or 'a')
* @param propName The property or attribute name
* @param namespace The namespace of the element, if any (e.g. 'svg' or 'math')
*/
function checkSecurityContext(tagName, propName, namespace) {
	const attrSchema = SECURITY_SCHEMA()[propName.toLowerCase()];
	if (!attrSchema) return 0;
	const tagLower = tagName.toLowerCase();
	let context;
	if (namespace) {
		const nsSchema = attrSchema[namespace];
		if (nsSchema) context = nsSchema[tagLower] ?? nsSchema[MATCH_ALL_ELEMENTS];
	}
	if (context === void 0) {
		const defaultSchema = attrSchema[NO_NAMESPACE];
		if (defaultSchema) context = defaultSchema[tagLower] ?? defaultSchema[MATCH_ALL_ELEMENTS];
	}
	if (context === void 0 && (!namespace || namespace === NO_NAMESPACE)) {
		const svgSchema = attrSchema["svg"];
		if (svgSchema) context = svgSchema[tagLower];
	}
	return context ?? 0;
}
//#endregion
export { MATH_ML_NAMESPACE, SECURITY_SCHEMA, checkSecurityContext };
