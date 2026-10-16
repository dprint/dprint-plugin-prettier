// @nts-check
/** @type {string} */ export const DOC_TYPE_STRING = "string";
/** @type {string} */ export const DOC_TYPE_ARRAY = "array";
/** @type {string} */ export const DOC_TYPE_CURSOR = "cursor";
/** @type {string} */ export const DOC_TYPE_INDENT = "indent";
/** @type {string} */ export const DOC_TYPE_ALIGN = "align";
/** @type {string} */ export const DOC_TYPE_TRIM = "trim";
/** @type {string} */ export const DOC_TYPE_GROUP = "group";
/** @type {string} */ export const DOC_TYPE_FILL = "fill";
/** @type {string} */ export const DOC_TYPE_IF_BREAK = "if-break";
/** @type {string} */ export const DOC_TYPE_INDENT_IF_BREAK = "indent-if-break";
/** @type {string} */ export const DOC_TYPE_LINE_SUFFIX = "line-suffix";
/** @type {string} */ export const DOC_TYPE_LINE_SUFFIX_BOUNDARY = "line-suffix-boundary";
/** @type {string} */ export const DOC_TYPE_LINE = "line";
/** @type {string} */ export const DOC_TYPE_LABEL = "label";
/** @type {string} */ export const DOC_TYPE_BREAK_PARENT = "break-parent";

export const VALID_OBJECT_DOC_TYPES = new Set([
  DOC_TYPE_CURSOR,
  DOC_TYPE_INDENT,
  DOC_TYPE_ALIGN,
  DOC_TYPE_TRIM,
  DOC_TYPE_GROUP,
  DOC_TYPE_FILL,
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_INDENT_IF_BREAK,
  DOC_TYPE_LINE_SUFFIX,
  DOC_TYPE_LINE_SUFFIX_BOUNDARY,
  DOC_TYPE_LINE,
  DOC_TYPE_LABEL,
  DOC_TYPE_BREAK_PARENT,
]);
