// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
/**
 * @import {Doc} from "../../document/index.js"
 */

import * as assert from "#universal/assert";
import {
  hardline,
  indent,
  join,
  line,
  replaceEndOfLine,
  softline,
} from "../../document/index.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { locEnd, locStart } from "../loc.js";
import {
  getLastDescendant,
  hasPrettierIgnore,
  isPreLikeNode,
  isTextLikeNode,
  isVueSfcBlock,
  shouldPreserveContent,
} from "../utilities/index.js";

/** @returns {any[]} */ function printClosingTag(/** @type {import("../parse/ast.js").Node} */ node, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  return [
    node.isSelfClosing ? "" : printClosingTagStart(node, options),
    printClosingTagEnd(node, options),
  ];
}

function printClosingTagStart(/** @type {import("../parse/ast.js").Node} */ node, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  return node.lastChild &&
    needsToBorrowParentClosingTagStartMarker(node.lastChild)
    ? ""
    : [
        printClosingTagPrefix(node, options),
        printClosingTagStartMarker(node, options),
      ];
}

function printClosingTagEnd(/** @type {import("../parse/ast.js").Node} */ node, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  return (
    node.next
      ? needsToBorrowPrevClosingTagEndMarker(node.next)
      : needsToBorrowLastChildClosingTagEndMarker(node.parent)
  )
    ? ""
    : [
        printClosingTagEndMarker(node, options),
        printClosingTagSuffix(node, options),
      ];
}

/** @returns {string} */ function printClosingTagPrefix(/** @type {import("../parse/ast.js").Node} */ node, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  return needsToBorrowLastChildClosingTagEndMarker(node)
    ? printClosingTagEndMarker(node.lastChild, options)
    : "";
}

/** @returns {string} */ function printClosingTagSuffix(/** @type {import("../parse/ast.js").Node} */ node, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  return needsToBorrowParentClosingTagStartMarker(node)
    ? printClosingTagStartMarker(node.parent, options)
    : needsToBorrowNextOpeningTagStartMarker(node)
      ? printOpeningTagStartMarker(node.next, options)
      : "";
}

/** @returns {string} */ function printClosingTagStartMarker(/** @type {import("../parse/ast.js").Node} */ node, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production") {
    assert.ok(!node.isSelfClosing);
  }
  /* c8 ignore next 3 */
  if (shouldNotPrintClosingTag(node, options)) {
    return "";
  }
  switch (node.kind) {
    case "ieConditionalComment":
      return "<!";
    case "element":
      if (node.hasHtmComponentClosingTag) {
        return "<//";
      }
    // fall through
    default:
      return `</${node.rawName}`;
  }
}

/** @returns {string} */ function printClosingTagEndMarker(/** @type {import("../parse/ast.js").Node} */ node, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  if (shouldNotPrintClosingTag(node, options)) {
    return "";
  }
  switch (node.kind) {
    case "ieConditionalComment":
    case "ieConditionalEndComment":
      return "[endif]-->";
    case "ieConditionalStartComment":
      return "]><!-->";
    case "interpolation":
      return "}}";
    case "angularIcuExpression":
      return "}";
    case "element":
      if (node.isSelfClosing) {
        return "/>";
      }
    // fall through
    default:
      return ">";
  }
}

/** @returns {boolean} */ function shouldNotPrintClosingTag(/** @type {import("../parse/ast.js").Node} */ node, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  return (
    !node.isSelfClosing &&
    !node.endSourceSpan &&
    (hasPrettierIgnore(node) || shouldPreserveContent(node.parent, options))
  );
}

/** @returns {boolean | undefined} */ function needsToBorrowPrevClosingTagEndMarker(/** @type {import("../parse/ast.js").Node} */ node) {
  /**
   *     <p></p
   *     >123
   *     ^
   *
   *     <p></p
   *     ><a
   *     ^
   */
  return (
    node.prev &&
    node.prev.kind !== "docType" &&
    node.kind !== "angularControlFlowBlock" &&
    !isTextLikeNode(node.prev) &&
    node.isLeadingSpaceSensitive &&
    !node.hasLeadingSpaces
  );
}

/** @returns {boolean | undefined} */ function needsToBorrowLastChildClosingTagEndMarker(/** @type {import("../parse/ast.js").Node} */ node) {
  /**
   *     <p
   *       ><a></a
   *       ></p
   *       ^
   *     >
   */
  return (
    node.lastChild?.isTrailingSpaceSensitive &&
    !node.lastChild.hasTrailingSpaces &&
    !isTextLikeNode(getLastDescendant(node.lastChild)) &&
    !isPreLikeNode(node)
  );
}

/** @returns {boolean | undefined} */ function needsToBorrowParentClosingTagStartMarker(/** @type {import("../parse/ast.js").Node} */ node) {
  /**
   *     <p>
   *       123</p
   *          ^^^
   *     >
   *
   *         123</b
   *       ></a
   *        ^^^
   *     >
   */
  return (
    !node.next &&
    !node.hasTrailingSpaces &&
    node.isTrailingSpaceSensitive &&
    isTextLikeNode(getLastDescendant(node))
  );
}

/** @returns {boolean | undefined} */ function needsToBorrowNextOpeningTagStartMarker(/** @type {import("../parse/ast.js").Node} */ node) {
  /**
   *     123<p
   *        ^^
   *     >
   */
  return (
    node.next &&
    !isTextLikeNode(node.next) &&
    isTextLikeNode(node) &&
    node.isTrailingSpaceSensitive &&
    !node.hasTrailingSpaces
  );
}

function getPrettierIgnoreAttributeCommentData(/** @type {string} */ value) {
  const match = value.trim().match(/^prettier-ignore-attribute(?:\s+(.+))?$/s);

  if (!match) {
    return false;
  }

  if (!match[1]) {
    return true;
  }

  return match[1].split(/\s+/);
}

/** @returns {boolean | undefined} */ function needsToBorrowParentOpeningTagEndMarker(/** @type {import("../parse/ast.js").Node} */ node) {
  /**
   *     <p
   *       >123
   *       ^
   *
   *     <p
   *       ><a
   *       ^
   */
  return !node.prev && node.isLeadingSpaceSensitive && !node.hasLeadingSpaces;
}

function printAttributes(/** @type {AstPath} */ path, /** @type {import("../print-options.js").HtmlPrintOptions} */ options, /** @type {() => any} */ print) {
  /** @type {{ node: import("../parse/ast.js").Node }} */ const { node } = path;

  const { attrs: attributes = [], startTagComments = [] } = node;

  if (attributes.length === 0 && startTagComments.length === 0) {
    return node.isSelfClosing
      ? /**
         *     <br />
         *        ^
         */
        " "
      : "";
  }

  const ignoreAttributeData =
    node.prev?.kind === "comment" &&
    getPrettierIgnoreAttributeCommentData(node.prev.value);

  const hasPrettierIgnoreAttribute =
    typeof ignoreAttributeData === "boolean"
      ? /** @returns {boolean} */ () => ignoreAttributeData
      : Array.isArray(ignoreAttributeData)
        ? /** @returns {boolean} */ (attribute) => ignoreAttributeData.includes(attribute.rawName)
        : () => false;

  const properties = ["attrs", "startTagComments"].filter(/** @returns {boolean} */ (property) =>
    isNonEmptyArray(node[property]),
  );
  const printedAttributes = properties.flatMap((property) =>
    path.map(
      (/** @type {AstPath & { node: import("../parse/ast.js").Node | import("../parse/ast.js").StartTagComment }} */ { node }) => ({
        loc: locStart(node),
        printed:
          node.kind === "attribute" && hasPrettierIgnoreAttribute(node)
            ? replaceEndOfLine(
                options.originalText.slice(locStart(node), locEnd(node)),
              )
            : print(),
      }),
      property,
    ),
  );

  if (properties.length > 1) {
    printedAttributes.sort((/** @type {{ loc: number }} */ a, /** @type {{ loc: number }} */ b) => a.loc - b.loc);
  }

  /** @type {boolean} */ const forceNotToBreakAttrContent =
    node.kind === "element" &&
    node.fullName === "script" &&
    attributes.length === 1 &&
    attributes[0].fullName === "src" &&
    node.children.length === 0 &&
    startTagComments.length === 0;
  const shouldForceBreak = startTagComments.some(
    (/** @type {import("../parse/ast.js").StartTagComment} */ comment) => comment.type === "single",
  );
  const shouldPrintAttributePerLine =
    shouldForceBreak ||
    (options.singleAttributePerLine &&
      attributes.length > 1 &&
      !isVueSfcBlock(node, options));
  const attributeLine = shouldPrintAttributePerLine ? hardline : line;

  /** @type {Doc[]} */
  const parts = [
    indent([
      forceNotToBreakAttrContent ? " " : shouldForceBreak ? hardline : line,
      join(
        attributeLine,
        printedAttributes.map(({ printed }) => printed),
      ),
    ]),
  ];

  if (
    /**
     *     123<a
     *       attr
     *           ~
     *       >456
     */
    (node.firstChild &&
      needsToBorrowParentOpeningTagEndMarker(node.firstChild)) ||
    /**
     *     <span
     *       >123<meta
     *                ~
     *     /></span>
     */
    (node.isSelfClosing &&
      needsToBorrowLastChildClosingTagEndMarker(node.parent)) ||
    forceNotToBreakAttrContent
  ) {
    parts.push(node.isSelfClosing ? " " : "");
  } else {
    parts.push(
      options.bracketSameLine
        ? node.isSelfClosing
          ? " "
          : ""
        : node.isSelfClosing
          ? line
          : softline,
    );
  }

  return parts;
}

/** @returns {string} */ function printOpeningTagEnd(/** @type {import("../parse/ast.js").Node} */ node) {
  return node.firstChild &&
    needsToBorrowParentOpeningTagEndMarker(node.firstChild)
    ? ""
    : printOpeningTagEndMarker(node);
}

/** @returns {any[]} */ function printOpeningTag(/** @type {AstPath} */ path, /** @type {import("../print-options.js").HtmlPrintOptions} */ options, /** @type {(selector?: any, args?: any) => any} */ print) {
  /** @type {{ node: import("../parse/ast.js").Node }} */ const { node } = path;

  return [
    printOpeningTagStart(node, options),
    printAttributes(path, options, print),
    node.isSelfClosing ? "" : printOpeningTagEnd(node),
  ];
}

function printOpeningTagStart(/** @type {import("../parse/ast.js").Node} */ node, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  return node.prev && needsToBorrowNextOpeningTagStartMarker(node.prev)
    ? ""
    : [
        printOpeningTagPrefix(node, options),
        printOpeningTagStartMarker(node, options),
      ];
}

/** @returns {string} */ function printOpeningTagPrefix(/** @type {import("../parse/ast.js").Node} */ node, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  return needsToBorrowParentOpeningTagEndMarker(node)
    ? printOpeningTagEndMarker(node.parent)
    : needsToBorrowPrevClosingTagEndMarker(node)
      ? printClosingTagEndMarker(node.prev, options)
      : "";
}

/** @type {string} */ const HTML5_DOCTYPE_START_MARKER = "<!doctype";
/** @returns {string} */ function printOpeningTagStartMarker(/** @type {import("../parse/ast.js").Node} */ node, /** @type {import("../print-options.js").HtmlPrintOptions} */ options) {
  switch (node.kind) {
    case "ieConditionalComment":
    case "ieConditionalStartComment":
      return `<!--[if ${node.condition}`;
    case "ieConditionalEndComment":
      return "<!--<!";
    case "interpolation":
      return "{{";
    case "docType": {
      // Only lowercase HTML5 doctype in `.html` and `.htm` files
      if (node.value === "html") {
        const { filepath } = options;
        if (filepath && /\.html?$/.test(filepath)) {
          return HTML5_DOCTYPE_START_MARKER;
        }
      }

      const start = locStart(node);
      return options.originalText.slice(
        start,
        start + HTML5_DOCTYPE_START_MARKER.length,
      );
    }

    case "angularIcuExpression":
      return "{";
    case "element":
      if (node.condition) {
        return `<!--[if ${node.condition}]><!--><${node.rawName}`;
      }
    // fall through
    default:
      return `<${node.rawName}`;
  }
}

/** @returns {string} */ function printOpeningTagEndMarker(/** @type {import("../parse/ast.js").Node} */ node) {
  /* c8 ignore next 3 */
  if (process.env.NODE_ENV !== "production") {
    assert.ok(!node.isSelfClosing);
  }
  switch (node.kind) {
    case "ieConditionalComment":
      return "]>";
    case "element":
      if (node.condition) {
        return "><!--<![endif]-->";
      }
    // fall through
    default:
      return ">";
  }
}

export {
  needsToBorrowLastChildClosingTagEndMarker,
  needsToBorrowNextOpeningTagStartMarker,
  needsToBorrowParentClosingTagStartMarker,
  needsToBorrowParentOpeningTagEndMarker,
  needsToBorrowPrevClosingTagEndMarker,
  printClosingTag,
  printClosingTagEnd,
  printClosingTagEndMarker,
  printClosingTagStartMarker,
  printClosingTagSuffix,
  printOpeningTag,
  printOpeningTagEndMarker,
  printOpeningTagPrefix,
  printOpeningTagStart,
  printOpeningTagStartMarker,
};
