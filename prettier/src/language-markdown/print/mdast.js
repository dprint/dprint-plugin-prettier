// @nts-check
import collapseWhiteSpace from "collapse-white-space";
import {
  align,
  DOC_TYPE_STRING,
  fill,
  getDocType,
  group,
  hardline,
  indent,
  line,
  literalline,
  markAsRoot,
  replaceEndOfLine,
  softline,
} from "../../document/index.js";
import getMinNotPresentContinuousCount from "../../utilities/get-min-not-present-continuous-count.js";
import { getPreferredQuote } from "../../utilities/get-preferred-quote.js";
import UnexpectedNodeError from "../../utilities/unexpected-node-error.js";
import { locEnd, locStart } from "../loc.js";
import {
  getNthListSiblingIndex,
  isAutolink,
  isPrettierIgnore,
  splitText,
} from "../utilities.js";
import { printChildren } from "./children.js";
import { printCode } from "./code.js";
import { printHeading } from "./heading.js";
import { printList, printListLegacy } from "./list.js";
import { printParagraph } from "./paragraph.js";
import { printSentence } from "./sentence.js";
import { printTable } from "./table.js";
import { printWhitespace, printWhitespaceNode } from "./whitespace.js";
import { printWord, printWordLegacy } from "./word.js";

/**
 * @import AstPath from "../../common/ast-path.js";
 * @import {Doc} from "../../document/index.js";
 * @import {MdastNode, MarkdownOptions} from "../utilities.js";
 * @returns {boolean}
 */

function prevOrNextWord(/** @type {AstPath} */ path) {
  /** @type {{ previous: MdastNode | null, next: MdastNode | null }} */
  const { previous, next } = path;
  const hasPrevOrNextWord =
    (previous?.type === "sentence" &&
      previous.children.at(-1)?.type === "word" &&
      !previous.children.at(-1).hasTrailingPunctuation &&
      // https://spec.commonmark.org/0.31.2/#unicode-whitespace-character
      !/[\p{Space_Separator}\t\n\f\r]$/u.test(
        previous.children.at(-1).value,
      )) ||
    (next?.type === "sentence" &&
      next.children[0]?.type === "word" &&
      !next.children[0].hasLeadingPunctuation &&
      !/^[\p{Space_Separator}\t\n\f\r]/u.test(next.children[0].value));
  return hasPrevOrNextWord;
}

function printMdast(
  /** @type {AstPath} */ path,
  /** @type {MarkdownOptions} */ options,
  /** @type {(selector?: any, args?: any) => any} */ print,
) {
  /** @type {{ node: MdastNode }} */ const { node } = path;

  if (shouldRemainTheSameContent(path)) {
    /*
     * We assume parts always meet following conditions:
     * - parts.length is odd
     * - odd (0-indexed) elements are line-like doc
     */
    /** @type {Doc[]} */
    const parts = [""];
    const textsNodes = splitText(
      options.originalText.slice(
        node.position.start.offset,
        node.position.end.offset,
      ),
    );
    for (const node of textsNodes) {
      if (node.type === "word") {
        parts.push([parts.pop(), node.value]);
        continue;
      }
      const doc = printWhitespace(
        path,
        node.value,
        options.proseWrap,
        true,
        options,
      );
      if (getDocType(doc) === DOC_TYPE_STRING) {
        parts.push([parts.pop(), doc]);
        continue;
      }
      // In this path, doc is line. To meet the condition, we need additional element "".
      parts.push(doc, "");
    }
    return fill(parts);
  }

  switch (node.type) {
    case "root":
      /* c8 ignore next 3 */
      if (node.children.length === 0) {
        return "";
      }
      return [printRoot(path, options, print), hardline];
    case "paragraph":
      return printParagraph(path, options, print);
    case "sentence":
      return printSentence(path, print);
    case "word":
      return options.parser !== "mdx"
        ? printWord(path, options)
        : printWordLegacy(path);
    case "whitespace":
      return printWhitespaceNode(path, options);
    case "emphasis": {
      /** @type {string | undefined} */ let style;
      if (isAutolink(node.children[0])) {
        style = options.originalText[node.position.start.offset];
      } else {
        const hasPrevOrNextWord = prevOrNextWord(path); // `1*2*3` is considered emphasis but `1_2_3` is not
        const inStrongAndHasPrevOrNextWord = // `1***2***3` is considered strong emphasis but `1**_2_**3` is not
          path.callParent(
            /** @returns {boolean} */ (/** @type {AstPath & { node: MdastNode }} */ { node }) => node.type === "strong" && prevOrNextWord(path),
          );
        style =
          hasPrevOrNextWord ||
          inStrongAndHasPrevOrNextWord ||
          path.hasAncestor(/** @returns {boolean} */ (/** @type {MdastNode} */ node) => node.type === "emphasis")
            ? "*"
            : "_";
      }
      return [style, printChildren(path, options, print), style];
    }
    case "strong":
      return ["**", printChildren(path, options, print), "**"];
    case "delete":
      return ["~~", printChildren(path, options, print), "~~"];
    case "inlineCode": {
      let code =
        options.proseWrap === "preserve"
          ? node.value
          : node.value.replaceAll("\n", " ");
      if (
        options.parser !== "mdx" &&
        path.hasAncestor(/** @returns {boolean} */ (/** @type {MdastNode} */ node) => node.type === "tableCell")
      ) {
        code = code.replaceAll("|", String.raw`\|`);
      }
      /** @type {number} */ const backtickCount = getMinNotPresentContinuousCount(code, "`");
      const backtickString = "`".repeat(backtickCount);
      const padding =
        code.startsWith("`") ||
        code.endsWith("`") ||
        (/^[\n ]/.test(code) && /[\n ]$/.test(code) && /[^\n ]/.test(code))
          ? " "
          : "";
      return [backtickString, padding, code, padding, backtickString];
    }
    case "wikiLink": {
      /** @type {string} */ let contents;
      if (options.proseWrap === "preserve") {
        contents = node.value;
      } else {
        contents = node.value.replaceAll(/[\t\n]+/g, " ");
      }

      return ["[[", contents, "]]"];
    }
    case "link":
      switch (options.originalText[node.position.start.offset]) {
        case "<": {
          /** @type {string} */ const mailto = "mailto:";
          /** @type {string} */ const url =
            // <hello@example.com> is parsed as { url: "mailto:hello@example.com" }
            node.url.startsWith(mailto) &&
            options.originalText.slice(
              node.position.start.offset + 1,
              node.position.start.offset + 1 + mailto.length,
            ) !== mailto
              ? node.url.slice(mailto.length)
              : node.url;
          return ["<", url, ">"];
        }
        case "[":
          return [
            "[",
            printChildren(path, options, print),
            "](",
            options.parser !== "mdx" && node.url === ""
              ? "<>"
              : printUrl(node.url, false),
            printTitle(node.title, options),
            ")",
          ];
        default:
          return options.originalText.slice(
            node.position.start.offset,
            node.position.end.offset,
          );
      }
    case "image":
      return [
        "![",
        printImageAlt(node, options),
        "](",
        options.parser !== "mdx" && node.url === ""
          ? "<>"
          : printUrl(node.url, false),
        printTitle(node.title, options),
        ")",
      ];
    case "blockquote":
      return ["> ", align("> ", printChildren(path, options, print))];
    case "heading":
      return printHeading(path, options, print);
    case "code":
      return printCode(path, options);
    case "html": {
      /** @type {{ parent: import("../utilities.js").MdastNode, isLast: any }} */ const { parent, isLast } = path;
      /** @type {string} */ const value =
        parent.type === "root" && isLast ? node.value.trimEnd() : node.value;
      const isHtmlComment = /^<!--.*-->$/s.test(value);

      return replaceEndOfLine(
        value,
        isHtmlComment ? hardline : markAsRoot(literalline),
      );
    }
    case "list":
      if (options.parser === "mdx") {
        return printListLegacy(path, options, print);
      }
      return printList(path, options, print);
    case "thematicBreak": {
      const { ancestors } = path;
      /** @type {number} */ const counter = ancestors.findIndex(/** @returns {boolean} */ (/** @type {MdastNode} */ node) => node.type === "list");
      if (counter === -1) {
        // Prevent it from becoming a "front matter"
        if (path.isFirst && path.parent.type === "root") {
          return "***";
        }

        return "---";
      }
      /** @type {number | undefined} */ const nthSiblingIndex = getNthListSiblingIndex(
        ancestors[counter],
        ancestors[counter + 1],
      );
      return nthSiblingIndex % 2 === 0 ? "***" : "---";
    }
    case "linkReference":
      return [
        "[",
        printChildren(path, options, print),
        "]",
        node.referenceType === "full"
          ? printLinkReference(node)
          : node.referenceType === "collapsed"
            ? "[]"
            : "",
      ];
    case "imageReference": {
      const alt = printImageAlt(node, options);

      switch (node.referenceType) {
        case "full":
          return ["![", alt, "]", printLinkReference(node)];
        default:
          return [
            ...(options.parser === "mdx"
              ? ["![", alt, "]"]
              : ["!", printLinkReference(node)]),
            node.referenceType === "collapsed" ? "[]" : "",
          ];
      }
    }
    case "definition": {
      const lineOrSpace = options.proseWrap === "always" ? line : " ";
      return group([
        printLinkReference(node),
        ":",
        indent([
          lineOrSpace,
          options.parser !== "mdx" && node.url === ""
            ? "<>"
            : printUrl(node.url, true),
          node.title === null
            ? ""
            : [lineOrSpace, printTitle(node.title, options, false)],
        ]),
      ]);
    }
    // `footnote` requires `.use(footnotes, {inlineNotes: true})`, we are not using this option
    // https://github.com/remarkjs/remark-footnotes#optionsinlinenotes
    /* c8 ignore next 2 */
    case "footnote":
      return ["[^", printChildren(path, options, print), "]"];
    case "footnoteReference":
      return printFootnoteReference(node);
    case "footnoteDefinition": {
      /** @type {boolean} */ const shouldInlineFootnote =
        node.children.length === 1 &&
        node.children[0].type === "paragraph" &&
        (options.proseWrap === "never" ||
          (options.proseWrap === "preserve" &&
            node.children[0].position.start.line ===
              node.children[0].position.end.line));
      return [
        printFootnoteReference(node),
        ": ",
        shouldInlineFootnote
          ? printChildren(path, options, print)
          : group([
              align(
                " ".repeat(4),
                printChildren(path, options, print, {
                  processor: (/** @type {AstPath} */ { isFirst }) =>
                    isFirst ? group([softline, print()]) : print(),
                }),
              ),
            ]),
      ];
    }
    case "table":
      return printTable(path, options, print);
    case "tableCell":
      return printChildren(path, options, print);
    case "break":
      return /\s/.test(options.originalText[node.position.start.offset])
        ? ["  ", markAsRoot(literalline)]
        : ["\\", hardline];
    case "liquidNode":
      return replaceEndOfLine(node.value, hardline);
    // MDX
    // fallback to the original text if multiparser failed
    // or `embeddedLanguageFormatting: "off"`
    case "import":
    case "export":
    case "jsx":
      return node.value.trimEnd();
    case "esComment":
      return ["{/* ", node.value, " */}"];
    case "math":
      return [
        "$$",
        node.meta ? " " + node.meta : "",
        hardline,
        node.value ? [replaceEndOfLine(node.value, hardline), hardline] : "",
        "$$",
      ];
    case "inlineMath":
      // remark-math trims content but we don't want to remove whitespaces
      // since it's very possible that it's recognized as math accidentally
      return options.originalText.slice(locStart(node), locEnd(node));
    case "text":
      return replaceEndOfLine(node.value, hardline);

    case "frontMatter": // Handled in core
    case "tableRow": // handled in "table"
    case "listItem": // handled in "list"
    default:
      /* c8 ignore next */
      throw new UnexpectedNodeError(node, "Markdown");
  }
}

/** @returns {any[]} */ function printRoot(/** @type {AstPath} */ path, /** @type {MarkdownOptions} */ options, /** @type {(selector?: any, args?: any) => any} */ print) {
  /** @typedef {{ index: number, offset: number }} IgnorePosition */
  /** @type {Array<{start: IgnorePosition, end: IgnorePosition}>} */
  const ignoreRanges = [];

  /** @type {IgnorePosition | null} */
  let ignoreStart = null;

  const { children } = /** @type {MdastNode} */ (path.node);
  for (const [index, childNode] of children.entries()) {
    switch (isPrettierIgnore(childNode)) {
      case "start":
        if (ignoreStart === null) {
          ignoreStart = { index, offset: childNode.position.end.offset };
        }
        break;
      case "end":
        if (ignoreStart !== null) {
          ignoreRanges.push({
            start: ignoreStart,
            end: { index, offset: childNode.position.start.offset },
          });
          ignoreStart = null;
        }
        break;
      default:
        // do nothing
        break;
    }
  }

  return printChildren(path, options, print, {
    processor(/** @type {AstPath} */ { index }) {
      if (ignoreRanges.length > 0) {
        const ignoreRange = ignoreRanges[0];

        if (index === ignoreRange.start.index) {
          return [
            printIgnoreComment(children[ignoreRange.start.index]),
            options.originalText.slice(
              ignoreRange.start.offset,
              ignoreRange.end.offset,
            ),
            printIgnoreComment(children[ignoreRange.end.index]),
          ];
        }

        if (ignoreRange.start.index < index && index < ignoreRange.end.index) {
          return false;
        }

        if (index === ignoreRange.end.index) {
          ignoreRanges.shift();
          return false;
        }
      }

      return print();
    },
  });
}

function printIgnoreComment(/** @type {import("../utilities.js").MdastNode} */ node) {
  if (node.type === "html") {
    return node.value;
  }

  if (
    node.type === "paragraph" &&
    Array.isArray(node.children) &&
    node.children.length === 1 &&
    node.children[0].type === "esComment"
  ) {
    return ["{/* ", node.children[0].value, " */}"];
  }
}

/** @returns {boolean | undefined} */ function shouldRemainTheSameContent(/** @type {AstPath} */ path) {
  /** @type {MdastNode | undefined} */
  const node = path.findAncestor(
    /** @returns {boolean} */ (/** @type {MdastNode} */ node) => node.type === "linkReference" || node.type === "imageReference",
  );
  return (
    node && (node.type !== "linkReference" || node.referenceType !== "full")
  );
}

// https://spec.commonmark.org/0.31.2/#entity-and-numeric-character-references
// https://github.com/micromark/micromark/blob/774a70c6bae6dd94486d3385dbd9a0f14550b709/packages/micromark-util-decode-string/dev/index.js#L6
const characterReferenceRegex =
  /&(?=(?:#\d{1,7}|#x[\da-f]{1,6}|[\da-z]{1,31});)/gi;
const escapeCharacterReferences = (value) =>
  value.replaceAll(characterReferenceRegex, String.raw`\&`);

/**
 * @param {string} url
 * @param {boolean} unwrapBalancedParens
 * @returns {string}
 */
function printUrl(url, unwrapBalancedParens) {
  // Backslash followed by ASCII punctuation would be misinterpreted as an
  // escape sequence, so must itself be escaped.
  url = url.replaceAll(/\\(?![^!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, "\\\\");
  url = escapeCharacterReferences(url);

  // CommonMark forbids ASCII controls, space, unbalanced parentheses, and
  // initial <, unless wrapped in <> with any inner < or > escaped. CommonMark
  // only suggests implementations "should" support at least three levels of
  // parenthesis nesting, so it's unclear whether we can safely rely on three
  // levels as we do here, but we certainly can't expect more.
  if (
    // eslint-disable-next-line no-control-regex
    /[\x00-\x1f\x7f ]|^</.test(url) ||
    (unwrapBalancedParens
      ? !/^(?:[^()]|\((?:[^()]|\((?:[^()]|\([^()]*\))*\))*\))*$/.test(url)
      : /[()]/.test(url))
  ) {
    url = `<${url.replaceAll(/([<>])/g, String.raw`\$1`)}>`;
  }

  return url;
}

/** @returns {string} */ function printTitle(/** @type {string | null} */ title, /** @type {MarkdownOptions} */ options, printSpace = true) {
  if (!title) {
    return "";
  }
  if (printSpace) {
    return " " + printTitle(title, options, false);
  }

  // title is escaped before `remark-parse` v10
  if (options.parser === "mdx") {
    title = title.replaceAll(/\\(?=["')])/g, "");
  }

  const quote =
    // avoid escaped quotes
    title.includes('"') &&
    title.includes("'") &&
    !title.includes("(") &&
    !title.includes(")")
      ? undefined
      : getPreferredQuote(title, options.singleQuote);

  title = title.replaceAll("\\", "\\\\");

  if (quote) {
    title = title.replaceAll(quote, `\\${quote}`);
  }

  title = escapeCharacterReferences(title);
  title = quote ? `${quote}${title}${quote}` : `(${title})`;

  return title;
}

/** @returns {string} */ function printLinkReference(/** @type {import("../utilities.js").MdastNode} */ node, /** @type {MarkdownOptions | undefined} */ options) {
  // `remark-parse` lowercase the `label` as `identifier`, we don't want do that
  // https://github.com/remarkjs/remark/blob/daddcb463af2d5b2115496c395d0571c0ff87d15/packages/remark-parse/lib/tokenize/reference.js
  const label = collapseWhiteSpace(node.label);
  if (options?.parser === "mdx") {
    return `[${label}]`;
  }
  const name = label.replaceAll(/[\\[\]]/g, /** @returns {string} */ (s) => `\\${s}`);
  return `[${name}]`;
}

/** @returns {string} */ function printFootnoteReference(/** @type {import("../utilities.js").MdastNode} */ node) {
  return `[^${node.label}]`;
}

/** @returns {string} */ function printImageAlt(/** @type {import("../utilities.js").MdastNode} */ node, /** @type {MarkdownOptions} */ options) {
  if (options.parser !== "mdx" && node.originalAltText) {
    return node.originalAltText;
  }

  return node.alt || "";
}

export { printMdast };
