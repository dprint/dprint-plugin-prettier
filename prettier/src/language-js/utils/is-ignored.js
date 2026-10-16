// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import { hasJsxIgnoreComment } from "../print/jsx.js";
import { hasNodeIgnoreComment } from "../utils/index.js";

/** @returns {boolean} */ function isIgnored(/** @type {AstPath} */ path) {
  return hasNodeIgnoreComment(path.node) || hasJsxIgnoreComment(path);
}

export default isIgnored;
