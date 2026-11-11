// @nts-check
const locStart = /** @returns {number} */ (/** @type {import("./parse/ast.js").HtmlNode} */ node) => node.sourceSpan.start.offset;
const locEnd = /** @returns {number} */ (/** @type {import("./parse/ast.js").HtmlNode} */ node) => node.sourceSpan.end.offset;

export { locEnd, locStart };
