import "./tags.mjs";
//#region ../compiler/src/ml_parser/xml_tags.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var XmlTagDefinition = class {
	closedByParent = false;
	implicitNamespacePrefix = null;
	isVoid = false;
	ignoreFirstLf = false;
	canSelfClose = true;
	preventNamespaceInheritance = false;
	requireExtraParent(currentParent) {
		return false;
	}
	isClosedByChild(name) {
		return false;
	}
	getContentType() {
		return 2;
	}
};
const _TAG_DEFINITION = new XmlTagDefinition();
function getXmlTagDefinition(tagName) {
	return _TAG_DEFINITION;
}
//#endregion
export { XmlTagDefinition, getXmlTagDefinition };
