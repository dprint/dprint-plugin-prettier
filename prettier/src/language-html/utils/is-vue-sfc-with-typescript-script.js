// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import { isVueScriptTag } from "./index.js";

const cache = new WeakMap();
/** @returns {boolean} */ function isVueSfcWithTypescriptScript(/** @type {AstPath} */ path, options) {
  const { root } = path;
  if (!cache.has(root)) {
    cache.set(
      root,
      root.children.some(
        /** @returns {boolean} */ (/** @type {import("../ast.js").Node} */ child) =>
          isVueScriptTag(child, options) &&
          ["ts", "typescript"].includes(child.attrMap.lang),
      ),
    );
  }

  return cache.get(root);
}

export default isVueSfcWithTypescriptScript;
