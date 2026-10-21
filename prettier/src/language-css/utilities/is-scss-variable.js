// @nts-check
/** @import { CssOptions } from "./index.js" */
/** @returns {boolean} */ function isSCSSVariable(node, /** @type {CssOptions} */ options) {
  return Boolean(
    options.parser === "scss" &&
    node?.type === "word" &&
    node.value.startsWith("$"),
  );
}

export default isSCSSVariable;
