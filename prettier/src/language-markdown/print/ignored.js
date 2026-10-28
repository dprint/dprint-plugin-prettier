// @nts-check
/**
 * @import AstPath from "../../common/ast-path.js";
 * @import {Doc} from "../../document/index.js";
 * @import {MdastNode, MarkdownOptions} from "../utilities.js";
 */

/**
 * @param {AstPath} path
 * @param {MarkdownOptions} options
 * @returns {Doc}
 */
function printPrettierIgnored(path, options) {
  const originalText = options.originalText.slice(
    /** @type {MdastNode} */ (path.node).position.start.offset,
    /** @type {MdastNode} */ (path.node).position.end.offset,
  );

  if (options.parser === "mdx") {
    return originalText;
  }

  switch (/** @type {MdastNode} */ (path.node).type) {
    case "list":
      if (
        path.findAncestor(/** @returns {boolean} */ (/** @type {MdastNode} */ p) => p.type === "blockquote") &&
        options.proseWrap !== "always"
      ) {
        return originalText.replace(/\n>\s*$/, "");
      }
      return originalText;
    default:
      return originalText;
  }
}

export { printPrettierIgnored };
