// @nts-check
import { hardline } from "../../document/index.js";
import isNextLineEmpty from "../../utilities/is-next-line-empty.js";
import { locEnd } from "../loc.js";

/** @import AstPath from "../../common/ast-path.js" */

/** @returns {any[]} */ function printSequence(/** @type {AstPath} */ path, options, /** @type {() => any} */ print, /** @type {string | undefined} */ property) {
  return path.map(({ isLast, node }) => {
    const printed = print();

    if (!isLast && isNextLineEmpty(options.originalText, locEnd(node))) {
      return [printed, hardline];
    }

    return printed;
  }, property);
}

export { printSequence };
