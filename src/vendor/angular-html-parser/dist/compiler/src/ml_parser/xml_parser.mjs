import { Parser } from "./parser.mjs";
import { getXmlTagDefinition } from "./xml_tags.mjs";
//#region ../compiler/src/ml_parser/xml_parser.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var XmlParser = class extends Parser {
	constructor() {
		super(getXmlTagDefinition);
	}
	parse(source, url, options = {}) {
		return super.parse(source, url, {
			...options,
			tokenizeBlocks: false,
			tokenizeLet: false,
			selectorlessEnabled: false
		});
	}
};
//#endregion
export { XmlParser };
