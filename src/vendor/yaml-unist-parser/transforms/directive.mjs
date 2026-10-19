// @nts-check
import { createDirective } from "../factories/directive.mjs";
//#region src/transforms/directive.ts
function transformDirective(directive, /** @type {import("./context.mjs").default} */ context) {
	const parts = directive.source.trim().split(/[\t ]+/);
	const name = parts.shift().replace(/^%/, "");
	return createDirective(context.transformRange([directive.offset, directive.offset + directive.source.length]), name, parts);
}
//#endregion
export { transformDirective };
