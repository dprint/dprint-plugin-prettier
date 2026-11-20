// @nts-check
const locStart = /** @returns {number} */ (/** @type {import("yaml-unist-types").YamlNode} */ node) => node.position.start.offset;
const locEnd = /** @returns {number} */ (/** @type {import("yaml-unist-types").YamlNode} */ node) => node.position.end.offset;

export { locEnd, locStart };
