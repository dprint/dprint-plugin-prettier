// @nts-check
// A empty function to provide visitor keys, and let core format front matter
function embed() {}

// `front-matter` only available on `css-root`
embed.getVisitorKeys = /** @returns {any[]} */ (/** @type {import("./types.js").CssNode} */ node) =>
  node.type === "css-root" ? ["frontMatter"] : [];

export default embed;
