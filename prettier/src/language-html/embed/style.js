// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import { getUnescapedAttributeValue } from "../utils/index.js";
import { printExpand } from "./utils.js";

function printStyleAttribute(/** @type {AstPath} */ path, options) {
  const { node } = path;
  /** @type {string} */ const text = getUnescapedAttributeValue(path.node).trim();
  if (
    node.fullName === "style" &&
    !options.parentParser &&
    !text.includes("{{")
  ) {
    return async (textToDoc) =>
      printExpand(
        await textToDoc(text, { parser: "css", __isHTMLStyleAttribute: true }),
      );
  }
}

export { printStyleAttribute };
