// @nts-check
import { trimNewlinesEnd } from "trim-newlines";
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import {
  DOC_TYPE_ALIGN,
  DOC_TYPE_ARRAY,
  DOC_TYPE_BREAK_PARENT,
  DOC_TYPE_CURSOR,
  DOC_TYPE_FILL,
  DOC_TYPE_GROUP,
  DOC_TYPE_IF_BREAK,
  DOC_TYPE_INDENT,
  DOC_TYPE_INDENT_IF_BREAK,
  DOC_TYPE_LABEL,
  DOC_TYPE_LINE,
  DOC_TYPE_LINE_SUFFIX,
  DOC_TYPE_LINE_SUFFIX_BOUNDARY,
  DOC_TYPE_STRING,
  DOC_TYPE_TRIM,
  join,
  literalline,
} from "../builders/index.js";
import getDocType from "./get-doc-type.js";
import InvalidDocError from "./invalid-doc-error.js";
import traverseDoc from "./traverse-doc.js";

/**
@import {Doc, Align, Fill, Group, IfBreak, Indent, IndentIfBreak, Label, Line, LineSuffix} from "../builders/index.js";
@typedef {Indent | Align | IndentIfBreak | Label | LineSuffix} DocWithContents
*/

/**
@param {Doc} doc
@param {(a0?: any) => any} cb
*/
function mapDoc(doc, cb) {
  // Avoid creating `Map`
  if (typeof doc === "string") {
    return cb(doc);
  }

  // Within a doc tree, the same subtrees can be found multiple times.
  // E.g., often this happens in conditional groups.
  // As an optimization (those subtrees can be huge) and to maintain the
  // reference structure of the tree, the mapping results are cached in
  // a map and reused.
  const mapped = new Map();

  return rec(doc);

  /** @param {Doc} doc */
  function rec(doc) {
    return getOrInsertComputed(mapped, doc, process);
  }

  /** @param {Doc} doc */
  function process(doc) {
    switch (getDocType(doc)) {
      case DOC_TYPE_ARRAY:
        return cb(/** @type {readonly Doc[]} */ (doc).map(rec));

      case DOC_TYPE_FILL:
        return cb(
          /** @type {Fill} */ ({
            .../** @type {Fill} */ (doc),
            parts: /** @type {Fill} */ (doc).parts.map(rec),
          }),
        );

      case DOC_TYPE_IF_BREAK:
        return cb(
          /** @type {IfBreak} */ ({
            .../** @type {IfBreak} */ (doc),
            breakContents: rec(/** @type {IfBreak} */ (doc).breakContents),
            flatContents: rec(/** @type {IfBreak} */ (doc).flatContents),
          }),
        );

      case DOC_TYPE_GROUP: {
        let { expandedStates, contents } = /** @type {Group} */ (doc);
        if (expandedStates) {
          expandedStates = expandedStates.map(rec);
          contents = expandedStates[0];
        } else {
          contents = rec(contents);
        }
        return cb(
          /** @type {Group} */ ({
            .../** @type {Group} */ (doc),
            contents,
            expandedStates,
          }),
        );
      }

      case DOC_TYPE_ALIGN:
      case DOC_TYPE_INDENT:
      case DOC_TYPE_INDENT_IF_BREAK:
      case DOC_TYPE_LABEL:
      case DOC_TYPE_LINE_SUFFIX:
        return cb(
          /** @type {DocWithContents} */ ({
            .../** @type {DocWithContents} */ (doc),
            contents: rec(/** @type {DocWithContents} */ (doc).contents),
          }),
        );

      case DOC_TYPE_STRING:
      case DOC_TYPE_CURSOR:
      case DOC_TYPE_TRIM:
      case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
      case DOC_TYPE_LINE:
      case DOC_TYPE_BREAK_PARENT:
        return cb(doc);

      default:
        /* c8 ignore next 3 */
        throw new InvalidDocError(doc);
    }
  }
}

/** @returns {boolean} */ function findInDoc(/** @type {Doc} */ doc, /** @type {(a0?: any) => any} */ fn, /** @type {boolean} */ defaultValue) {
  let result = defaultValue;
  /** @type {boolean} */ let shouldSkipFurtherProcessing = false;
  /** @returns {boolean | undefined} */ function findInDocOnEnterFn(doc) {
    if (shouldSkipFurtherProcessing) {
      return false;
    }

    const maybeResult = fn(doc);
    if (maybeResult !== undefined) {
      shouldSkipFurtherProcessing = true;
      result = maybeResult;
    }
  }
  traverseDoc(doc, findInDocOnEnterFn);
  return result;
}

/** @returns {boolean | undefined} */ function willBreakFn(doc) {
  if (doc.type === DOC_TYPE_GROUP && /** @type {Group} */ (doc).break) {
    return true;
  }
  if (doc.type === DOC_TYPE_LINE && /** @type {Line} */ (doc).hard) {
    return true;
  }
  if (doc.type === DOC_TYPE_BREAK_PARENT) {
    return true;
  }
}

/** @returns {boolean} */ function willBreak(/** @type {Doc} */ doc) {
  return findInDoc(doc, willBreakFn, false);
}

function breakParentGroup(/** @type {Group[]} */ groupStack) {
  if (groupStack.length > 0) {
    const parentGroup = groupStack.at(-1);
    // Breaks are not propagated through conditional groups because
    // the user is expected to manually handle what breaks.
    if (!parentGroup.expandedStates && !parentGroup.break) {
      // An alternative truthy value allows to distinguish propagated group breaks
      // and not to print them as `group(..., { break: true })` in `--debug-print-doc`.
      parentGroup.break = "propagated";
    }
  }
  return null;
}

function propagateBreaks(/** @type {Doc} */ doc) {
  /** @type {Set<Group>} */
  const alreadyVisitedSet = new Set();
  /** @type {Group[]} */
  const groupStack = [];
  /** @returns {boolean | undefined} */ function propagateBreaksOnEnterFn(doc) {
    if (doc.type === DOC_TYPE_BREAK_PARENT) {
      breakParentGroup(groupStack);
    }
    if (doc.type === DOC_TYPE_GROUP) {
      groupStack.push(doc);
      if (alreadyVisitedSet.has(doc)) {
        return false;
      }
      alreadyVisitedSet.add(doc);
    }
  }
  function propagateBreaksOnExitFn(doc) {
    if (doc.type === DOC_TYPE_GROUP) {
      const group = groupStack.pop();
      if (group.break) {
        breakParentGroup(groupStack);
      }
    }
  }
  traverseDoc(
    doc,
    propagateBreaksOnEnterFn,
    propagateBreaksOnExitFn,
    /* shouldTraverseConditionalGroups */ true,
  );
}

function removeLinesFn(doc) {
  // Force this doc into flat mode by statically converting all
  // lines into spaces (or soft lines into nothing). Hard lines
  // should still output because there's too great of a chance
  // of breaking existing assumptions otherwise.
  if (doc.type === DOC_TYPE_LINE && !(/** @type {Line} */ (doc).hard)) {
    return /** @type {Line} */ (doc).soft ? "" : " ";
  }

  if (doc.type === DOC_TYPE_IF_BREAK) {
    return /** @type {IfBreak} */ (doc).flatContents;
  }

  return doc;
}

function removeLines(/** @type {Doc} */ doc) {
  return mapDoc(doc, removeLinesFn);
}

/** @returns {any[]} */ function stripTrailingHardlineFromParts(/** @type {any[]} */ parts) {
  parts = [...parts];

  while (
    parts.length >= 2 &&
    parts.at(-2).type === DOC_TYPE_LINE &&
    parts.at(-1).type === DOC_TYPE_BREAK_PARENT
  ) {
    parts.length -= 2;
  }

  if (parts.length > 0) {
    const lastPart = stripTrailingHardlineFromDoc(parts.at(-1));
    parts[parts.length - 1] = lastPart;
  }

  return parts;
}

/**
@param {Doc} doc
@returns {Doc}
*/
function stripTrailingHardlineFromDoc(doc) {
  switch (getDocType(doc)) {
    case DOC_TYPE_INDENT:
    case DOC_TYPE_INDENT_IF_BREAK:
    case DOC_TYPE_GROUP:
    case DOC_TYPE_LINE_SUFFIX:
    case DOC_TYPE_LABEL: {
      const contents = stripTrailingHardlineFromDoc(
        /** @type {DocWithContents | Group} */ (doc).contents,
      );
      return { .../** @type {DocWithContents | Group} */ (doc), contents };
    }

    case DOC_TYPE_IF_BREAK:
      return {
        .../** @type {IfBreak} */ (doc),
        breakContents: stripTrailingHardlineFromDoc(
          /** @type {IfBreak} */ (doc).breakContents,
        ),
        flatContents: stripTrailingHardlineFromDoc(
          /** @type {IfBreak} */ (doc).flatContents,
        ),
      };

    case DOC_TYPE_FILL:
      return {
        .../** @type {Fill} */ (doc),
        parts: stripTrailingHardlineFromParts(/** @type {Fill} */ (doc).parts),
      };

    case DOC_TYPE_ARRAY:
      return stripTrailingHardlineFromParts(/** @type {any[]} */ (doc));

    case DOC_TYPE_STRING:
      return trimNewlinesEnd(/** @type {string} */ (doc));

    case DOC_TYPE_ALIGN:
    case DOC_TYPE_CURSOR:
    case DOC_TYPE_TRIM:
    case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
    case DOC_TYPE_LINE:
    case DOC_TYPE_BREAK_PARENT:
      // No op
      break;

    default:
      throw new InvalidDocError(doc);
  }

  return doc;
}

function stripTrailingHardline(/** @type {Doc} */ doc) {
  // HACK remove ending hardline, original PR: #1984
  return stripTrailingHardlineFromDoc(cleanDoc(doc));
}

/** @param {Doc} doc */
function cleanDocFn(doc) {
  switch (getDocType(doc)) {
    case DOC_TYPE_FILL: {
      const { parts } = /** @type {Fill} */ (doc);

      if (parts.every(/** @returns {boolean} */ (part) => part === "")) {
        return "";
      }
      if (parts.length === 1) {
        return parts[0];
      }

      break;
    }
    case DOC_TYPE_GROUP:
      if (
        !(/** @type {Group} */ (doc).contents) &&
        !(/** @type {Group} */ (doc).id) &&
        !(/** @type {Group} */ (doc).break) &&
        !(/** @type {Group} */ (doc).expandedStates)
      ) {
        return "";
      }
      // Remove nested only group
      if (
        /** @type {any} */ (/** @type {Group} */ (doc).contents).type ===
          DOC_TYPE_GROUP &&
        /** @type {Group} */ (/** @type {Group} */ (doc).contents).id ===
          /** @type {Group} */ (doc).id &&
        /** @type {Group} */ (/** @type {Group} */ (doc).contents).break ===
          /** @type {Group} */ (doc).break &&
        /** @type {Group} */ (/** @type {Group} */ (doc).contents)
          .expandedStates === /** @type {Group} */ (doc).expandedStates
      ) {
        return /** @type {Group} */ (doc).contents;
      }
      break;
    case DOC_TYPE_ALIGN:
    case DOC_TYPE_INDENT:
    case DOC_TYPE_INDENT_IF_BREAK:
    case DOC_TYPE_LINE_SUFFIX:
      if (!(/** @type {DocWithContents} */ (doc).contents)) {
        return "";
      }
      break;
    case DOC_TYPE_IF_BREAK:
      if (
        !(/** @type {IfBreak} */ (doc).flatContents) &&
        !(/** @type {IfBreak} */ (doc).breakContents)
      ) {
        return "";
      }
      break;
    case DOC_TYPE_ARRAY: {
      // Flat array, concat strings
      /** @type {any[]} */
      const parts = [];
      for (const part of /** @type {readonly Doc[]} */ (doc)) {
        if (!part) {
          continue;
        }
        const [currentPart, ...restParts] = Array.isArray(part) ? part : [part];
        if (
          typeof currentPart === "string" &&
          typeof parts.at(-1) === "string"
        ) {
          parts[parts.length - 1] += currentPart;
        } else {
          parts.push(currentPart);
        }
        parts.push(...restParts);
      }

      if (parts.length === 0) {
        return "";
      }

      if (parts.length === 1) {
        return parts[0];
      }

      return parts;
    }
    case DOC_TYPE_STRING:
    case DOC_TYPE_CURSOR:
    case DOC_TYPE_TRIM:
    case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
    case DOC_TYPE_LINE:
    case DOC_TYPE_LABEL:
    case DOC_TYPE_BREAK_PARENT:
      // No op
      break;
    default:
      /* c8 ignore next 3 */
      throw new InvalidDocError(doc);
  }

  return doc;
}

// - concat strings
// - flat arrays except for parts of `fill`
// - merge arrays of strings into single strings
// - remove nested `group`s and empty `fill`/`align`/`indent`/`line-suffix`/`if-break` if possible
function cleanDoc(/** @type {Doc} */ doc) {
  return mapDoc(doc, (/** @type {Doc} */ currentDoc) => cleanDocFn(currentDoc));
}

/**
@param {Doc} doc
@param {Doc} [replacement]
@returns {Doc}
*/
function replaceEndOfLine(doc, replacement = literalline) {
  return mapDoc(doc, (/** @type {Doc} */ currentDoc) =>
    typeof currentDoc === "string"
      ? join(replacement, currentDoc.split("\n"))
      : currentDoc,
  );
}

/** @returns {boolean | undefined} */ function canBreakFn(doc) {
  if (doc.type === DOC_TYPE_LINE) {
    return true;
  }
}

/** @returns {boolean} */ function canBreak(/** @type {Doc} */ doc) {
  return findInDoc(doc, canBreakFn, false);
}

function inheritLabel(doc, /** @type {(a0?: any) => any} */ fn) {
  return doc.type === DOC_TYPE_LABEL
    ? /** @type {Label} */ ({
        .../** @type {Label} */ (doc),
        contents: fn(/** @type {Label} */ (doc).contents),
      })
    : fn(doc);
}

/**
returns true iff cleanDoc(doc) === ""
@param {Doc} doc
@returns {boolean}
*/
function isEmptyDoc(doc) {
  let isEmpty = true;
  traverseDoc(doc, /** @returns {boolean | undefined} */ (doc) => {
    switch (getDocType(doc)) {
      case DOC_TYPE_STRING:
        if (doc === "") {
          break;
        }
      // fallthrough
      case DOC_TYPE_TRIM:
      case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
      case DOC_TYPE_LINE:
      case DOC_TYPE_BREAK_PARENT:
        isEmpty = false;
        return false;
    }
  });
  return isEmpty;
}

export {
  canBreak,
  cleanDoc,
  findInDoc,
  getDocType,
  inheritLabel,
  InvalidDocError,
  isEmptyDoc,
  mapDoc,
  propagateBreaks,
  removeLines,
  replaceEndOfLine,
  stripTrailingHardline,
  traverseDoc,
  willBreak,
};
export { assertDocArray } from "./assert-doc.js";
