// @nts-check
import { getUnescapedAttributeValue } from "../utilities/index.js";

/**
@import {AttributeValuePredicate, AttributeValuePrint} from "./attribute.js"
*/

/** @type {AttributeValuePredicate} */
const isClassNames = /** @returns {boolean} */ ({ node }, options) =>
  !options.parentParser &&
  node.fullName === "class" &&
  !node.value.includes("{{");

/** @type {AttributeValuePrint} */
const printClassNames = /** @returns {string} */ (textToDoc, print, path /* , options*/) =>
  getUnescapedAttributeValue(path.node).trim().replaceAll(/\s+/g, " ");

export { isClassNames, printClassNames };
