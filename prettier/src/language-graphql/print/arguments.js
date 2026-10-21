// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
/** @import {GraphqlNode, GraphqlOptions, GraphqlPrint} from "../print-types.js" */
import {
  group,
  ifBreak,
  indent,
  join,
  softline,
} from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { printSequence } from "./sequence.js";

function printArguments(/** @type {AstPath} */ path, /** @type {GraphqlOptions} */ options, /** @type {GraphqlPrint} */ print) {
  /** @type {{ node: GraphqlNode }} */ const { node } = path;
  if (!isNonEmptyArray(node.arguments)) {
    return "";
  }

  return group([
    "(",
    indent([
      softline,
      join(
        [ifBreak("", ", "), softline],
        printSequence(path, options, print, "arguments"),
      ),
    ]),
    softline,
    ")",
  ]);
}

export { printArguments };
