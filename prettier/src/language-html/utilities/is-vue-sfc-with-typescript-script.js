// @nts-check
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { isVueScriptTag } from "./index.js";

/** @import AstPath from "../../common/ast-path.js" */

const cache = new WeakMap();
/** @returns {boolean} */ function isVueSfcWithTypescriptScript(/** @type {AstPath} */ path, options) {
  return getOrInsertComputed(cache, path.root, /** @returns {boolean} */ (root) =>
    root.children.some(
      /** @returns {boolean} */ (child) =>
        isVueScriptTag(child, options) &&
        ["ts", "typescript"].includes(child.attrMap.lang),
    ),
  );
}

export default isVueSfcWithTypescriptScript;
