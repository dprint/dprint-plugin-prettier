// @nts-check
import { ifBreak, line } from "../../document/index.js";
import { getUnescapedAttributeValue } from "../utilities/index.js";
import parsePermissionsPolicy from "./parse-permissions-policy.js";
import { printExpand } from "./utilities.js";

/**
@import {AttributePath, AttributeValuePredicate, AttributeValuePrint} from "./attribute.js"
*/

/** @type {AttributeValuePredicate} */
const isPermissionsPolicy = /** @returns {boolean} */ (/** @type {AttributePath} */ { node }, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) =>
  node.fullName === "allow" &&
  !options.parentParser &&
  node.parent.fullName === "iframe" &&
  !node.value.includes("{{");

/** @type {AttributeValuePrint} */
function printPermissionsPolicy(textToDoc, print, /** @type {import("../../common/ast-path.js").default} */ path /* , options*/) {
  /** @type {{ node: import("../parse/ast.js").Node }} */ const { node } = path;
  const directives = parsePermissionsPolicy(getUnescapedAttributeValue(node));

  if (directives.length === 0) {
    // Return a truthy value to bypass the check in `printAttributeWithValuePrinter`
    return [""];
  }

  return printExpand(
    directives.map(({ name, value }, index) => [
      [name, ...value].join(" "),
      index === directives.length - 1 ? ifBreak(";") : [";", line],
    ]),
  );
}

export { isPermissionsPolicy, printPermissionsPolicy };
