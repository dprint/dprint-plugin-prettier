// @nts-check
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { isVueScriptTag } from "./index.js";

/** @import AstPath from "../../common/ast-path.js" */

const cache = new WeakMap();
/** @returns {boolean} */ function isVueSfcWithTypescriptScript(/** @type {AstPath} */ path, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  return getOrInsertComputed(cache, path.root, /** @returns {boolean} */ (/** @type {import("../parse/ast.js").Node} */ root) =>
    root.children.some(
      /** @returns {boolean} */ (/** @type {import("../parse/ast.js").Node} */ child) =>
        isVueScriptTag(child, options) &&
        ["ts", "typescript"].includes(child.attrMap.lang),
    ),
  );
}

export default isVueSfcWithTypescriptScript;
