// @nts-check
import {
  getHtmlTagDefinition,
  parse as parseHtml,
  ParseLocation,
  ParseSourceFile,
  ParseSourceSpan,
  RecursiveVisitor,
  TagContentType,
  visitAll,
} from "angular-html-parser";
import createError from "../common/parser-create-error.js";
import parseFrontMatter from "../utils/front-matter/parse.js";
import inferParser from "../utils/infer-parser.js";
import isNonEmptyArray from "../utils/is-non-empty-array.js";
import { Node } from "./ast.js";
import { parseIeConditionalComment } from "./conditional-comment.js";
import { locEnd, locStart } from "./loc.js";
import { hasPragma } from "./pragma.js";
import HTML_ELEMENT_ATTRIBUTES from "./utils/html-elements-attributes.evaluate.js";
import HTML_TAGS from "./utils/html-tag-names.evaluate.js";
import isUnknownNamespace from "./utils/is-unknown-namespace.js";

/**
 * @import AngularHtmlParser, {ParseOptions as AngularHtmlParserParseOptions} from "angular-html-parser"
 * @import {Node as AstNode, Attribute, Element} from "angular-html-parser/lib/compiler/src/ml_parser/ast.js"
 * @import {ParseTreeResult} from "angular-html-parser/lib/compiler/src/ml_parser/parser.js"
 */

/**
 * @typedef {AngularHtmlParserParseOptions & {
 *   name: 'html' | 'angular' | 'vue' | 'lwc';
 *   normalizeTagName?: boolean;
 *   normalizeAttributeName?: boolean;
 *   shouldParseAsRawText?: (tagName: string, prefix: string, hasParent: boolean, attrs: Array<{
 *      prefix: string;
 *      name: string;
 *      value?: string;
 *   }>) => boolean;
 * }} ParseOptions
 * @typedef {{filepath?: string}} Options
 */

// `@else    if`
function normalizeAngularControlFlowBlock(/** @type {Node} */ node) {
  if (node.type !== "block") {
    return;
  }

  node.name = node.name.toLowerCase().replaceAll(/\s+/gu, " ").trim();
  node.type = "angularControlFlowBlock";

  if (!isNonEmptyArray(node.parameters)) {
    delete node.parameters;
    return;
  }

  for (const parameter of node.parameters) {
    parameter.type = "angularControlFlowBlockParameter";
  }

  node.parameters = {
    type: "angularControlFlowBlockParameters",
    children: node.parameters,
    sourceSpan: new ParseSourceSpan(
      node.parameters[0].sourceSpan.start,
      node.parameters.at(-1).sourceSpan.end,
    ),
  };
}

function normalizeAngularLetDeclaration(/** @type {Node} */ node) {
  if (node.type !== "letDeclaration") {
    return;
  }

  // Similar to `VariableDeclarator` in estree
  node.type = "angularLetDeclaration";
  node.id = node.name;
  node.init = {
    type: "angularLetDeclarationInitializer",
    sourceSpan: new ParseSourceSpan(node.valueSpan.start, node.valueSpan.end),
    value: node.value,
  };

  delete node.name;
  delete node.value;
}

function normalizeAngularIcuExpression(/** @type {Node} */ node) {
  if (node.type === "plural" || node.type === "select") {
    node.clause = node.type;
    node.type = "angularIcuExpression";
  }
  if (node.type === "expansionCase") {
    node.type = "angularIcuCase";
  }
}

/**
 * @param {string} input
 * @param {any} parseOptions
 * @param {Options} options
 * @returns {any[]}
 */
function ngHtmlParser(input, parseOptions, options) {
  const {
    name,
    canSelfClose = true,
    normalizeTagName = false,
    normalizeAttributeName = false,
    allowHtmComponentClosingTags = false,
    isTagNameCaseSensitive = false,
    shouldParseAsRawText,
  } = parseOptions;

  let { rootNodes, errors } = parseHtml(input, {
    canSelfClose,
    allowHtmComponentClosingTags,
    isTagNameCaseSensitive,
    getTagContentType: shouldParseAsRawText
      ? /** @returns {number | undefined} */ (...args) =>
          shouldParseAsRawText(...args) ? TagContentType.RAW_TEXT : undefined
      : undefined,
    tokenizeAngularBlocks: name === "angular" ? true : undefined,
    tokenizeAngularLetDeclaration: name === "angular" ? true : undefined,
  });

  if (name === "vue") {
    /** @type {boolean} */ const isHtml = rootNodes.some(
      /** @returns {boolean} */ (node) =>
        (node.type === "docType" && node.value === "html") ||
        (node.type === "element" && node.name.toLowerCase() === "html"),
    );

    // If not Vue SFC, treat as html
    if (isHtml) {
      return ngHtmlParser(input, HTML_PARSE_OPTIONS, options);
    }

    /** @type {ParseTreeResult | undefined} */
    let secondParseResult;
    const getHtmlParseResult = /** @returns {import("../../node_modules/angular-html-parser/lib/compiler/src/ml_parser/parser.js").ParseTreeResult} */ () =>
      (secondParseResult ??= parseHtml(input, {
        canSelfClose,
        allowHtmComponentClosingTags,
        isTagNameCaseSensitive,
      }));

    const getNodeWithSameLocation = /** @returns {import("../../node_modules/angular-html-parser/lib/compiler/src/ml_parser/ast.js").Element | undefined} */ (/** @type {import("../../node_modules/angular-html-parser/lib/compiler/src/ml_parser/ast.js").Element} */ node) =>
      getHtmlParseResult().rootNodes.find(
        /** @returns {boolean | undefined} */ ({ startSourceSpan }) =>
          startSourceSpan &&
          startSourceSpan.start.offset === node.startSourceSpan.start.offset,
      ) ?? node;
    for (const [index, node] of rootNodes.entries()) {
      const { endSourceSpan, startSourceSpan } = node;
      /** @type {boolean} */ const isVoidElement = endSourceSpan === null;
      if (isVoidElement) {
        errors = getHtmlParseResult().errors;
        rootNodes[index] = getNodeWithSameLocation(node);
      } else if (shouldParseVueRootNodeAsHtml(node, options)) {
        /** @type {import("../../node_modules/angular-html-parser/lib/compiler/src/ml_parser/lexer.js").TokenError | undefined} */ const error = getHtmlParseResult().errors.find(
          /** @returns {boolean} */ (error) =>
            error.span.start.offset > startSourceSpan.start.offset &&
            error.span.start.offset < endSourceSpan.end.offset,
        );
        if (error) {
          throwParseError(error);
        }
        rootNodes[index] = getNodeWithSameLocation(node);
      }
    }
  }

  if (errors.length > 0) {
    throwParseError(errors[0]);
  }

  /**
   * @param {Attribute | Element} node
   */
  const restoreName = (node) => {
    /** @type {string | null} */ const namespace = node.name.startsWith(":")
      ? node.name.slice(1).split(":")[0]
      : null;
    /** @type {string} */ const rawName = node.nameSpan.toString();
    /** @type {boolean} */ const hasExplicitNamespace =
      namespace !== null && rawName.startsWith(`${namespace}:`);
    /** @type {string} */ const name = hasExplicitNamespace
      ? rawName.slice(namespace.length + 1)
      : rawName;

    node.name = name;
    node.namespace = namespace;
    node.hasExplicitNamespace = hasExplicitNamespace;
  };

  /**
   * @param {any} node
   */
  const restoreNameAndValue = (node) => {
    switch (node.type) {
      case "element":
        restoreName(node);
        for (const attr of node.attrs) {
          restoreName(attr);
          if (!attr.valueSpan) {
            attr.value = null;
          } else {
            attr.value = attr.valueSpan.toString();
            if (/["']/u.test(attr.value[0])) {
              attr.value = attr.value.slice(1, -1);
            }
          }
        }
        break;
      case "comment":
        node.value = node.sourceSpan
          .toString()
          .slice("<!--".length, -"-->".length);
        break;
      case "text":
        node.value = node.sourceSpan.toString();
        break;
      // No default
    }
  };

  const lowerCaseIfFn = /** @returns {string} */ (/** @type {string} */ text, /** @type {(a0?: any) => any} */ fn) => {
    /** @type {string} */ const lowerCasedText = text.toLowerCase();
    return fn(lowerCasedText) ? lowerCasedText : text;
  };
  const normalizeName = (node) => {
    if (node.type === "element") {
      if (
        normalizeTagName &&
        (!node.namespace ||
          node.namespace === node.tagDefinition.implicitNamespacePrefix ||
          isUnknownNamespace(node))
      ) {
        node.name = lowerCaseIfFn(node.name, /** @returns {boolean} */ (lowerCasedName) =>
          HTML_TAGS.has(lowerCasedName),
        );
      }

      if (normalizeAttributeName) {
        for (const attr of node.attrs) {
          if (!attr.namespace) {
            attr.name = lowerCaseIfFn(
              attr.name,
              /** @returns {boolean} */ (lowerCasedAttrName) =>
                HTML_ELEMENT_ATTRIBUTES.has(node.name) &&
                (HTML_ELEMENT_ATTRIBUTES.get("*").has(lowerCasedAttrName) ||
                  HTML_ELEMENT_ATTRIBUTES.get(node.name).has(
                    lowerCasedAttrName,
                  )),
            );
          }
        }
      }
    }
  };

  const fixSourceSpan = (node) => {
    if (node.sourceSpan && node.endSourceSpan) {
      node.sourceSpan = new ParseSourceSpan(
        node.sourceSpan.start,
        node.endSourceSpan.end,
      );
    }
  };

  /**
   * @param {any} node
   */
  const addTagDefinition = (node) => {
    if (node.type === "element") {
      /** @type {import("../../node_modules/angular-html-parser/lib/compiler/src/ml_parser/html_tags.js").HtmlTagDefinition} */ const tagDefinition = getHtmlTagDefinition(
        isTagNameCaseSensitive ? node.name : node.name.toLowerCase(),
      );
      if (
        !node.namespace ||
        node.namespace === tagDefinition.implicitNamespacePrefix ||
        isUnknownNamespace(node)
      ) {
        node.tagDefinition = tagDefinition;
      } else {
        node.tagDefinition = getHtmlTagDefinition(""); // the default one
      }
    }
  };

  visitAll(
    new (class extends RecursiveVisitor {
      // Angular does not visit to the children of expansionCase
      // https://github.com/angular/angular/blob/e3a6bf9b6c3bef03df9bfc8f05b817bc875cbad6/packages/compiler/src/ml_parser/ast.ts#L161
      visitExpansionCase(ast, context) {
        if (name === "angular") {
          // @ts-expect-error
          this.visitChildren(context, (visit) => {
            visit(ast.expression);
          });
        }
      }
      visit(node) {
        restoreNameAndValue(node);
        addTagDefinition(node);
        normalizeName(node);
        fixSourceSpan(node);
      }
    })(),
    rootNodes,
  );

  return rootNodes;
}

/** @returns {boolean} */ function shouldParseVueRootNodeAsHtml(node, options) {
  if (node.type !== "element" || node.name !== "template") {
    return false;
  }
  const language = node.attrs.find(/** @returns {boolean} */ (/** @type {import("../../node_modules/angular-html-parser/lib/compiler/src/ml_parser/ast.js").Attribute} */ attr) => attr.name === "lang")?.value;
  return !language || inferParser(options, { language }) === "html";
}

function throwParseError(error) {
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

/**
 * @param {string} text
 * @param {any} parseOptions
 * @param {Options} options
 * @param {boolean} shouldParseFrontMatter
 * @returns {Node}
 */
function parse(
  text,
  parseOptions,
  options = {},
  shouldParseFrontMatter = true,
) {
  const { frontMatter, content } = shouldParseFrontMatter
    ? parseFrontMatter(text)
    : { frontMatter: null, content: text };

  /** @type {import("../../node_modules/angular-html-parser/lib/compiler/src/parse_util.js").ParseSourceFile} */ const file = new ParseSourceFile(text, options.filepath);
  /** @type {import("../../node_modules/angular-html-parser/lib/compiler/src/parse_util.js").ParseLocation} */ const start = new ParseLocation(file, 0, 0, 0);
  /** @type {import("../../node_modules/angular-html-parser/lib/compiler/src/parse_util.js").ParseLocation} */ const end = start.moveBy(text.length);
  const rawAst = {
    type: "root",
    sourceSpan: new ParseSourceSpan(start, end),
    children: ngHtmlParser(content, parseOptions, options),
  };

  if (frontMatter) {
    /** @type {import("../../node_modules/angular-html-parser/lib/compiler/src/parse_util.js").ParseLocation} */ const start = new ParseLocation(file, 0, 0, 0);
    /** @type {import("../../node_modules/angular-html-parser/lib/compiler/src/parse_util.js").ParseLocation} */ const end = start.moveBy(frontMatter.raw.length);
    frontMatter.sourceSpan = new ParseSourceSpan(start, end);
    // @ts-expect-error -- not a real AstNode
    rawAst.children.unshift(frontMatter);
  }

  /** @type {Node} */ const ast = new Node(rawAst);

  const parseSubHtml = /** @returns {Node} */ (/** @type {string} */ subContent, /** @type {import("../../node_modules/angular-html-parser/lib/compiler/src/parse_util.js").ParseLocation} */ startSpan) => {
    const { offset } = startSpan;
    /** @type {string} */ const fakeContent = text.slice(0, offset).replaceAll(/[^\n\r]/gu, " ");
    /** @type {string} */ const realContent = subContent;
    /** @type {Node} */ const subAst = parse(
      fakeContent + realContent,
      parseOptions,
      options,
      false,
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
  };

  ast.walk((/** @type {Node} */ node) => {
    if (node.type === "comment") {
      const ieConditionalComment = parseIeConditionalComment(
        node,
        parseSubHtml,
      );
      if (ieConditionalComment) {
        node.parent.replaceChild(node, ieConditionalComment);
      }
    }

    normalizeAngularControlFlowBlock(node);
    normalizeAngularLetDeclaration(node);
    normalizeAngularIcuExpression(node);
  });

  return ast;
}

/**
 * @param {any} parseOptions
 */
function createParser(parseOptions) {
  return {
    parse: /** @returns {Node} */ (/** @type {string | undefined} */ text, options) => parse(text, parseOptions, options),
    hasPragma,
    astFormat: "html",
    locStart,
    locEnd,
  };
}

/** @type {any} */
const HTML_PARSE_OPTIONS = {
  name: "html",
  normalizeTagName: true,
  normalizeAttributeName: true,
  allowHtmComponentClosingTags: true,
};

// HTML
export const html = createParser(HTML_PARSE_OPTIONS);
// Angular
export const angular = createParser({ name: "angular" });
// Vue
export const vue = createParser({
  name: "vue",
  isTagNameCaseSensitive: true,
  /** @returns {boolean} */ shouldParseAsRawText(/** @type {string | undefined} */ tagName, /** @type {string | undefined} */ prefix, hasParent, /** @type {any[] | undefined} */ attrs) {
    return (
      tagName.toLowerCase() !== "html" &&
      !hasParent &&
      (tagName !== "template" ||
        attrs.some(
          /** @returns {boolean} */ ({ name, value }) =>
            name === "lang" &&
            value !== "html" &&
            value !== "" &&
            value !== undefined,
        ))
    );
  },
});
// Lightning Web Components
export const lwc = createParser({ name: "lwc", canSelfClose: false });
