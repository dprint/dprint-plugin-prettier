// @nts-check
import {
  parseHtml as angularHtmlParserParse,
  ParseLocation,
  ParseSourceFile,
  ParseSourceSpan,
} from "angular-html-parser";
import createError from "../../common/parser-create-error.js";
import { parseFrontMatter } from "../../main/front-matter/index.js";
import replaceNonLineBreaksWithSpace from "../../utilities/replace-non-line-breaks-with-space.js";
import {
  normalizeParseOptions,
  toAngularHtmlParserParseOptions,
} from "./parse-options.js";
import { postprocess } from "./postprocess.js";

/**
@import {HtmlParseOptions, Ast, ParseTreeResult} from "angular-html-parser";
@import {RawParseOptions, ParseOptions} from "./parse-options.js";
@import {FrontMatter} from "../../main/front-matter/parse.js"
@typedef {{filepath?: string}} Options
@typedef {FrontMatter & {kind: "frontMatter", sourceSpan: ParseSourceSpan}} HtmlFrontMatter
*/

/**
@param {string} input
@param {any} parseOptions
*/
function parseHtml(input, parseOptions) {
  const { rootNodes, errors } = angularHtmlParserParse(
    input,
    toAngularHtmlParserParseOptions(parseOptions),
  );

  if (errors.length > 0) {
    throwParseError(errors[0]);
  }

  return { parseOptions, rootNodes };
}

/**
@param {string} input
@param {any} parseOptions
*/
function parseVue(input, parseOptions) {
  const angularHtmlParserParseOptions =
    toAngularHtmlParserParseOptions(parseOptions);
  let { rootNodes, errors } = angularHtmlParserParse(
    input,
    angularHtmlParserParseOptions,
  );

  /** @type {boolean} */ const isHtml = rootNodes.some(
    /** @returns {boolean} */ (node) =>
      (node.kind === "docType" && node.value === "html") ||
      (node.kind === "element" && node.name.toLowerCase() === "html"),
  );

  // If not Vue.js SFC, treat as HTML
  if (isHtml) {
    return parseHtml(input, HTML_PARSE_OPTIONS);
  }

  /** @type {ParseTreeResult | undefined} */
  let secondParseResult;
  const getHtmlParseResult = /** @returns {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/parser.mjs").ParseTreeResult} */ () =>
    (secondParseResult ??= angularHtmlParserParse(input, {
      ...angularHtmlParserParseOptions,
      getTagContentType: undefined,
    }));

  const getElementWithSameLocation = /** @returns {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").Element} */ (/** @type {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").Element} */ node) => {
    const { offset } = node.startSourceSpan.start;
    return (
      getHtmlParseResult().rootNodes.find(
        /** @returns {boolean} */ (searching) =>
          searching.kind === "element" &&
          searching.startSourceSpan.start.offset === offset,
      ) ?? node
    );
  };
  for (const [index, node] of rootNodes.entries()) {
    if (node.kind !== "element") {
      continue;
    }

    if (node.isVoid) {
      errors = getHtmlParseResult().errors;
      rootNodes[index] = getElementWithSameLocation(node);
    } else if (shouldParseVueRootNodeAsHtml(node)) {
      const { endSourceSpan, startSourceSpan } = node;
      /** @type {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/lexer.mjs").TokenError | undefined} */ const error = getHtmlParseResult().errors.find(
        /** @returns {boolean} */ (error) =>
          error.span.start.offset > startSourceSpan.start.offset &&
          error.span.start.offset < endSourceSpan.end.offset,
      );
      if (error) {
        throwParseError(error);
      }
      rootNodes[index] = getElementWithSameLocation(node);
    }
  }

  if (errors.length > 0) {
    throwParseError(errors[0]);
  }

  return { parseOptions, rootNodes };
}

/**
@param {Ast.Node} node
@returns {boolean}
*/
function shouldParseVueRootNodeAsHtml(node) {
  if (node.kind !== "element" || node.name !== "template") {
    return false;
  }
  const language = node.attrs.find(/** @returns {boolean} */ (/** @type {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").Attribute} */ attr) => attr.name === "lang")?.value;
  return !language || language === "html";
}

function throwParseError(/** @type {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/parser.mjs").TreeError | import("../../../../src/vendor/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseError} */ error) {
  const {
    msg,
    span: { start, end },
  } = error;
  throw createError(msg, {
    loc: {
      start: { line: start.line + 1, column: start.col + 1 },
      end: { line: end.line + 1, column: end.col + 1 },
    },
    cause: error,
  });
}

/** @returns {import("./ast.js").Node} */ function parseSubHtml(
  parser,
  /** @type {string} */ text,
  /** @type {string} */ subContent,
  /** @type {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseLocation} */ startSpan,
  parseOptions,
  options,
) {
  const { offset } = startSpan;
  const textToParse =
    replaceNonLineBreaksWithSpace(text.slice(0, offset)) + subContent;
  const subAst = parse(
    textToParse,
    parser,
    { ...parseOptions, shouldParseFrontMatter: false },
    options,
  );

  // @ts-expect-error
  subAst.sourceSpan = new ParseSourceSpan(
    startSpan,
    // @ts-expect-error
    subAst.children.at(-1).sourceSpan.end,
  );
  // @ts-expect-error
  const firstText = subAst.children[0];
  if (firstText.length === offset) {
    /* c8 ignore next */ // @ts-expect-error
    subAst.children.shift();
  } else {
    firstText.sourceSpan = new ParseSourceSpan(
      firstText.sourceSpan.start.moveBy(offset),
      firstText.sourceSpan.end,
    );
    firstText.value = firstText.value.slice(offset);
  }
  return subAst;
}

/**
@param {string} text
@param {typeof parseHtml | typeof parseVue} parser
@param {any} parseOptions
@param {Options} options
* @returns {import("./ast.js").Node}
*/
function parse(text, parser, parseOptions, options = {}) {
  const { frontMatter, content: textToParse } =
    parseOptions.shouldParseFrontMatter
      ? parseFrontMatter(text)
      : { content: text };

  /** @type {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseSourceFile} */ const file = new ParseSourceFile(text, options.filepath);
  /** @type {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseLocation} */ const start = new ParseLocation(file, 0, 0, 0);
  /** @type {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseLocation} */ const end = start.moveBy(text.length);

  const { parseOptions: actualParseOptions, rootNodes } = parser(
    textToParse,
    parseOptions,
  );

  const rawAst = {
    kind: "root",
    sourceSpan: new ParseSourceSpan(start, end),
    children: rootNodes,
  };

  /** @type {HtmlFrontMatter} */
  let htmlFrontMatter;
  if (frontMatter) {
    const [start, end] = [frontMatter.start, frontMatter.end].map(
      /** @returns {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseLocation} */ (location) =>
        new ParseLocation(
          file,
          location.index,
          location.line - 1,
          location.column,
        ),
    );
    htmlFrontMatter = {
      ...frontMatter,
      kind: "frontMatter",
      sourceSpan: new ParseSourceSpan(start, end),
    };
  }

  const ast = postprocess(
    rawAst,
    htmlFrontMatter,
    actualParseOptions,
    /** @returns {import("./ast.js").Node} */ (subContent, startSpan) =>
      parseSubHtml(
        parser,
        text,
        subContent,
        startSpan,
        actualParseOptions,
        options,
      ),
  );

  return ast;
}

/** @type {any} */
const HTML_PARSE_OPTIONS = normalizeParseOptions({
  name: "html",
  normalizeTagName: true,
  normalizeAttributeName: true,
  allowHtmComponentClosingTags: true,
});

export { HTML_PARSE_OPTIONS, parse, parseHtml, parseVue };
