// @nts-check
const locStart = (/** @type {import("./utilities.js").MdastNode} */ node) => node.position.start.offset;
const locEnd = (/** @type {import("./utilities.js").MdastNode} */ node) => node.position.end.offset;

export { locEnd, locStart };
