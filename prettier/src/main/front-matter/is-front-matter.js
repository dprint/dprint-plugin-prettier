// @nts-check
import { FRONT_MATTER_MARK } from "./constants.js";

/** @returns {boolean} */ function isFrontMatter(node) {
  return Boolean(node?.[FRONT_MATTER_MARK]);
}

export default isFrontMatter;
