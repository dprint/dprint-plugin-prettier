// @nts-check
import { hasJsxIgnoreComment } from "./has-jsx-ignore-comment.js";
import { hasNodeIgnoreComment } from "./has-node-ignore-comment.js";

/** @import AstPath from "../../common/ast-path.js" */

/** @returns {boolean} */ function isIgnored(/** @type {AstPath} */ path) {
  return hasNodeIgnoreComment(path.node) || hasJsxIgnoreComment(path);
}

export default isIgnored;
