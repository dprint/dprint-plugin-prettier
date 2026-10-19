import { getHtmlTagDefinition } from "./html_tags.mjs";
import { Parser } from "./parser.mjs";
//#region ../compiler/src/ml_parser/html_parser.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var HtmlParser = class extends Parser {
	constructor() {
		super(getHtmlTagDefinition);
	}
	parse(source, url, options, isTagNameCaseSensitive = false, getTagContentType) {
		return super.parse(source, url, options, isTagNameCaseSensitive, getTagContentType);
	}
};
//#endregion
export { HtmlParser };
