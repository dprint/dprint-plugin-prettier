// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import parseSrcset from "@prettier/parse-srcset";
import { ifBreak, join, line } from "../../document/index.js";
import { getUnescapedAttributeValue } from "../utilities/index.js";
import { printExpand } from "./utilities.js";

/**
@import {Doc} from "../../document/index.js"
@import {AttributeValuePredicate, AttributeValuePrint} from "./attribute.js"
*/

/** @type {AttributeValuePredicate} */
const isSrcset = /** @returns {boolean} */ (/** @type {import("../../common/ast-path.js").default} */ path /* , options*/) =>
  /** @type {import("../parse/ast.js").Node} */ (path.node).fullName === "srcset" &&
  (/** @type {import("../parse/ast.js").Node} */ (path.parent).fullName === "img" || /** @type {import("../parse/ast.js").Node} */ (path.parent).fullName === "source");

const SRCSET_UNITS = { width: "w", height: "h", density: "x" };
const SRCSET_TYPES = Object.keys(SRCSET_UNITS);

/** @type {AttributeValuePrint} */
function printSrcset(
  textToDoc,
  print,
  /** @type {AstPath} */ path,
  /* , options*/
) {
  /** @type {string} */ const value = getUnescapedAttributeValue(path.node);
  const srcset = parseSrcset(value);
  const types = SRCSET_TYPES.filter(/** @returns {boolean} */ (type) =>
    srcset.some(/** @returns {boolean} */ (candidate) => Object.hasOwn(candidate, type)),
  );

  if (types.length > 1) {
    throw new Error("Mixed descriptor in srcset is not supported");
  }

  const [key] = types;
  const unit = SRCSET_UNITS[key];

  const urls = srcset.map(/** @returns {string} */ (src) => src.source.value);
  const maxUrlLength = Math.max(...urls.map(/** @returns {number} */ (url) => url.length));

  const descriptors = srcset.map(/** @returns {string} */ (src) =>
    src[key] ? String(src[key].value) : "",
  );
  const descriptorLeftLengths = descriptors.map(/** @returns {number} */ (descriptor) => {
    const index = descriptor.indexOf(".");
    return index === -1 ? descriptor.length : index;
  });
  const maxDescriptorLeftLength = Math.max(...descriptorLeftLengths);

  return printExpand(
    join(
      [",", line],
      urls.map((url, index) => {
        /** @type {Doc[]} */
        const parts = [url];

        const descriptor = descriptors[index];
        if (descriptor) {
          const urlPadding = maxUrlLength - url.length + 1;
          const descriptorPadding =
            maxDescriptorLeftLength - descriptorLeftLengths[index];

          const alignment = " ".repeat(urlPadding + descriptorPadding);
          parts.push(ifBreak(alignment, " "), descriptor + unit);
        }

        return parts;
      }),
    ),
  );
}

export { isSrcset, printSrcset };
