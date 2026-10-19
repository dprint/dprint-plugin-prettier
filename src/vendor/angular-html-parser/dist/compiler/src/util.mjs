//#region ../compiler/src/util.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
const DASH_CASE_REGEXP = /-+([a-z0-9])/g;
function dashCaseToCamelCase(input) {
	return input.replace(DASH_CASE_REGEXP, (...m) => m[1].toUpperCase());
}
//#endregion
export { dashCaseToCamelCase };
