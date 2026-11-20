// @nts-check
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
} from "../builders/types.js";
import getDocType from "./get-doc-type.js";
import InvalidDocError from "./invalid-doc-error.js";

/**
@import {Doc, Align, Fill, Group, IfBreak, Indent, IndentIfBreak, Label, LineSuffix} from "../builders/index.js";
@typedef {Indent | Align | IndentIfBreak | Label | LineSuffix} DocWithContents
@typedef {(doc: Doc) => void | boolean} OnEnter
@typedef {(doc: Doc) => void} OnExit
*/

// Using a unique object to compare by reference.
/** @type {any} */
const traverseDocOnExitStackMarker = {};

/**
@param {Doc} doc
@param {OnEnter} [onEnter]
@param {OnExit} [onExit]
@param {boolean} [shouldTraverseConditionalGroups = false]
*/
function traverseDoc(doc, onEnter, onExit, shouldTraverseConditionalGroups) {
  /** @type {Doc[]} */
  const docsStack = [doc];

  while (docsStack.length > 0) {
    const doc = docsStack.pop();

    if (doc === traverseDocOnExitStackMarker) {
      onExit(docsStack.pop());
      continue;
    }

    if (onExit) {
      docsStack.push(doc, traverseDocOnExitStackMarker);
    }

    /** @type {string | undefined} */ const docType = getDocType(doc);
    if (!docType) {
      throw new InvalidDocError(doc);
    }

    // Should Recurse
    if (onEnter?.(doc) === false) {
      continue;
    }

    // When there are multiple parts to process,
    // the parts need to be pushed onto the stack in reverse order,
    // so that they are processed in the original order
    // when the stack is popped.

    switch (docType) {
      case DOC_TYPE_ARRAY:
      case DOC_TYPE_FILL: {
        const parts =
          docType === DOC_TYPE_ARRAY
            ? /** @type {readonly Doc[]} */ (doc)
            : /** @type {Fill} */ (doc).parts;
        for (let ic = parts.length, i = ic - 1; i >= 0; --i) {
          docsStack.push(parts[i]);
        }
        break;
      }

      case DOC_TYPE_IF_BREAK:
        docsStack.push(
          /** @type {IfBreak} */ (doc).flatContents,
          /** @type {IfBreak} */ (doc).breakContents,
        );
        break;

      case DOC_TYPE_GROUP:
        if (
          shouldTraverseConditionalGroups &&
          /** @type {Group} */ (doc).expandedStates
        ) {
          for (
            let ic = /** @type {Group} */ (doc).expandedStates.length, i = ic - 1;
            i >= 0;
            --i
          ) {
            docsStack.push(/** @type {Group} */ (doc).expandedStates[i]);
          }
        } else {
          docsStack.push(/** @type {Group} */ (doc).contents);
        }
        break;

      case DOC_TYPE_ALIGN:
      case DOC_TYPE_INDENT:
      case DOC_TYPE_INDENT_IF_BREAK:
      case DOC_TYPE_LABEL:
      case DOC_TYPE_LINE_SUFFIX:
        docsStack.push(/** @type {DocWithContents} */ (doc).contents);
        break;

      case DOC_TYPE_STRING:
      case DOC_TYPE_CURSOR:
      case DOC_TYPE_TRIM:
      case DOC_TYPE_LINE_SUFFIX_BOUNDARY:
      case DOC_TYPE_LINE:
      case DOC_TYPE_BREAK_PARENT:
        // No children
        break;

      default:
        throw new InvalidDocError(doc);
    }
  }
}

export default traverseDoc;
