// @nts-check
import { ParseSourceSpan } from "angular-html-parser";

// https://css-tricks.com/how-to-create-an-ie-only-stylesheet

/**
@import {Ast} from "angular-html-parser";
@typedef {(data: string, startSpan: import("../../../../src/vendor/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseLocation) => import("./ast.js").Node} ParseSubHtml
@typedef {{kind: string, sourceSpan: any, condition?: string, complete?: boolean, children?: any[], startSourceSpan?: any, endSourceSpan?: any}} IeConditionalComment
*/

const parseFunctions = [
  {
    // <!--[if ... ]> ... <![endif]-->
    regex:
      /^(?<openingTagSuffix>\[if(?<condition>[^\]]*)\]>)(?<data>.*?)<!\s*\[endif\]$/s,
    parse: parseIeConditionalStartEndComment,
  },
  {
    // <!--[if ... ]><!-->
    regex: /^\[if(?<condition>[^\]]*)\]><!$/,
    parse: parseIeConditionalStartComment,
  },
  {
    // <!--<![endif]-->
    regex: /^<!\s*\[endif\]$/,
    parse: parseIeConditionalEndComment,
  },
];

/**
@param {Ast.Comment} node
@returns {IeConditionalComment | null}
*/
function parseIeConditionalComment(/** @type {import("./ast.js").Node} */ node, /** @type {ParseSubHtml} */ parseHtml) {
  if (node.value) {
    for (const { regex, parse } of parseFunctions) {
      const match = /** @type {string} */ (node.value).match(regex);
      if (match) {
        return parse(node, match, parseHtml);
      }
    }
  }
  return null;
}

/**
@param {import("./ast.js").Node} node
@param {RegExpMatchArray} match
@param {ParseSubHtml} parseHtml
@returns {IeConditionalComment}
*/
function parseIeConditionalStartEndComment(node, match, parseHtml) {
  const { openingTagSuffix, condition, data } = match.groups;
  const offset = "<!--".length + openingTagSuffix.length;
  const contentStartSpan = node.sourceSpan.start.moveBy(offset);
  const contentEndSpan = contentStartSpan.moveBy(data.length);
  const [complete, children] = (/** @returns {any[]} */ () => {
    try {
      return [true, parseHtml(data, contentStartSpan).children];
    } catch {
      const text = {
        kind: "text",
        value: data,
        sourceSpan: new ParseSourceSpan(contentStartSpan, contentEndSpan),
      };
      return [false, [text]];
    }
  })();
  return {
    kind: "ieConditionalComment",
    complete,
    children,
    condition: condition.trim().replaceAll(/\s+/g, " "),
    sourceSpan: node.sourceSpan,
    startSourceSpan: new ParseSourceSpan(
      node.sourceSpan.start,
      contentStartSpan,
    ),
    endSourceSpan: new ParseSourceSpan(contentEndSpan, node.sourceSpan.end),
  };
}

/**
@param {import("./ast.js").Node} node
@param {RegExpMatchArray} match
@returns {IeConditionalComment}
*/
function parseIeConditionalStartComment(node, match /* , parseHtml */) {
  const { condition } = match.groups;
  return {
    kind: "ieConditionalStartComment",
    condition: condition.trim().replaceAll(/\s+/g, " "),
    sourceSpan: node.sourceSpan,
  };
}

/** @returns {IeConditionalComment} */
function parseIeConditionalEndComment(/** @type {import("./ast.js").Node} */ node /* , match, parseHtml */) {
  return {
    kind: "ieConditionalEndComment",
    sourceSpan: node.sourceSpan,
  };
}

export { parseIeConditionalComment };
