// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
/** @import {GraphqlNode, GraphqlOptions, GraphqlPrint} from "../print-types.js" */
import { group, indent, join, line, softline } from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";

function printDirectives(/** @type {AstPath} */ path, /** @type {GraphqlPrint} */ print) {
  /** @type {{ node: GraphqlNode }} */ const { node } = path;

  if (!isNonEmptyArray(node.directives)) {
    return "";
  }

  const printed = join(line, path.map(print, "directives"));

  if (
    node.kind === "FragmentDefinition" ||
    node.kind === "OperationDefinition"
  ) {
    return group([line, printed]);
  }

  return [" ", group(indent([softline, printed]))];
}

export { printDirectives };
