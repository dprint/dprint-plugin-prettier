// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import { getUnescapedAttributeValue } from "../utils/index.js";

function printClassNames(/** @type {AstPath} */ path, options) {
  const { node } = path;
  /** @type {string} */ const value = getUnescapedAttributeValue(node);
  if (
    node.fullName === "class" &&
    !options.parentParser &&
    !value.includes("{{")
  ) {
    return /** @returns {string} */ () => value.trim().split(/\s+/u).join(" ");
  }
}

export default printClassNames;
