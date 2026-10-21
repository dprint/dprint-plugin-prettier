// @nts-check
import isNextLineEmptyAfterIndex from "../../utilities/is-next-line-empty.js";
import { locEnd, locEndWithFullText } from "../location/index.js";

/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {import("../types/estree.js").Node} node
 * @param {import("../print-options.js").JsPrintOptions} options
 * @returns {boolean}
 */
const isNextLineEmpty = (node, { originalText }) => {
  const end = locEnd(node);

  if (isNextLineEmptyAfterIndex(originalText, end)) {
    return true;
  }

  const endWithSemicolon = locEndWithFullText(node);
  if (endWithSemicolon === end) {
    return false;
  }

  return isNextLineEmptyAfterIndex(originalText, endWithSemicolon);
};

export { isNextLineEmpty };
