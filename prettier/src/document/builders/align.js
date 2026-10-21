// @nts-check
import { assertAlignType, assertDoc } from "../utilities/assert-doc.js";
import { indent } from "./indent.js";
import { DOC_TYPE_ALIGN } from "./types.js";

/**
@import {Doc} from "./index.js";
@import {Indent} from "./indent.js";
@typedef {{readonly type: "root"}} AlignTypeRoot
@typedef {number | string | AlignTypeRoot} AlignType
@typedef {{
  readonly type: DOC_TYPE_ALIGN;
  readonly contents: Doc;
  readonly n: AlignType;
}} Align
*/

/**
@template {AlignType} [N = AlignType]
@template {Doc} [D = Doc]
@param {any} alignType
@param {any} contents
@returns {Align}
*/
function align(alignType, contents) {
  assertAlignType(alignType);
  assertDoc(contents);

  return { type: DOC_TYPE_ALIGN, contents, n: alignType };
}

/**
@param {Doc} contents
@returns {any}
*/
function dedentToRoot(contents) {
  return align(Number.NEGATIVE_INFINITY, contents);
}

/**
@param {Doc} contents
@returns {any}
*/
function markAsRoot(contents) {
  return align(/** @type {AlignTypeRoot} */ ({ type: "root" }), contents);
}

/**
@param {Doc} contents
@returns {any}
*/
function dedent(contents) {
  return align(-1, contents);
}

/**
@param {Doc} doc
@param {number} size
@param {number} tabWidth
@returns {Doc}
*/
function addAlignmentToDoc(doc, size, tabWidth) {
  assertDoc(doc);

  let aligned = doc;
  if (size > 0) {
    // Use indent to add tabs for all the levels of tabs we need
    for (let level = 0; level < Math.floor(size / tabWidth); ++level) {
      aligned = indent(aligned);
    }
    // Use align for all the spaces that are needed
    aligned = align(size % tabWidth, aligned);
    // size is absolute from 0 and not relative to the current
    // indentation, so we use -Infinity to reset the indentation to 0
    aligned = align(Number.NEGATIVE_INFINITY, aligned);
  }
  return aligned;
}

export { addAlignmentToDoc, align, dedent, dedentToRoot, markAsRoot };
