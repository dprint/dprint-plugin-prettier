// @nts-check
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import { locStart } from "../loc.js";

const cache = new WeakMap();
const hasExplicitOperation = /** @returns {boolean} */ (node, options) =>
  getOrInsertComputed(
    cache,
    node,
    /** @returns {boolean} */ (node) => options.originalText[locStart(node)] !== "{",
  );

export { hasExplicitOperation };
