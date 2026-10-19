import {
  group,
  ifBreak,
  indent,
  join,
  softline,
} from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";

/** @import AstPath from "../../common/ast-path.js" */

function printVariableDefinitions(/** @type {AstPath} */ path, print) {
  const { node } = path;
  if (!isNonEmptyArray(node.variableDefinitions)) {
    return "";
  }
  return group([
    "(",
    indent([
      softline,
      join(
        [ifBreak("", ", "), softline],
        path.map(print, "variableDefinitions"),
      ),
    ]),
    softline,
    ")",
  ]);
}

export { printVariableDefinitions };
