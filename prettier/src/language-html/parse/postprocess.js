// @nts-check
import {
  getHtmlTagDefinition,
  ParseSourceSpan,
  RecursiveVisitor,
  visitAll,
} from "angular-html-parser";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import HTML_ELEMENT_ATTRIBUTES from "../utilities/html-elements-attributes.evaluate.js";
import HTML_TAGS from "../utilities/html-tags.evaluate.js";
import isUnknownNamespace from "../utilities/is-unknown-namespace.js";
import { Node } from "./ast.js";
import { parseIeConditionalComment } from "./conditional-comment.js";

/**
@import {HtmlParseOptions, Ast, ParseTreeResult} from "angular-html-parser";
@import {ParseOptions} from "./parse-options.js";
@import {NormalizedParseOptions} from "./ast.js";
@import {Attribute, Element, ExpansionCase, Comment, Text, AstNode} from "../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs";
@import {ParseSourceSpan as SourceSpan, ParseLocation} from "../../../../src/vendor/angular-html-parser/dist/compiler/src/parse_util.mjs";
@typedef {{parseOptions: NormalizedParseOptions}} VisitContext
@typedef {{kind: string, sourceSpan: SourceSpan, children: any[]}} RawAst
*/

class Visitor extends RecursiveVisitor {
  // Angular does not visit to the children of expansionCase
  // https://github.com/angular/angular/blob/e3a6bf9b6c3bef03df9bfc8f05b817bc875cbad6/packages/compiler/src/ml_parser/ast.ts#L161
  visitExpansionCase(/** @type {ExpansionCase} */ ast, /** @type {VisitContext} */ context) {
    if (context.parseOptions.name === "angular") {
      // @ts-expect-error
      this.visitChildren(context, (/** @type {(children: any) => void} */ visit) => {
        visit(ast.expression);
      });
    }
  }
  visit(/** @type {AstNode} */ node, /** @type {VisitContext} */ { parseOptions }) {
    restoreNameAndValue(node);
    addTagDefinition(node, parseOptions);
    normalizeName(node, parseOptions);
    fixSourceSpan(node);
  }
}

/** @returns {Node} */ function postprocess(/** @type {RawAst} */ rawAst, frontMatter, /** @type {NormalizedParseOptions} */ parseOptions, /** @type {(subContent: string, startSpan: ParseLocation) => Node} */ parseSubHtml) {
  const isAngular = parseOptions.name === "angular";

  visitAll(new Visitor(), rawAst.children, { parseOptions });

  if (frontMatter) {
    rawAst.children.unshift(frontMatter);
  }

  /** @type {Node} */ const ast = new Node(rawAst);

  ast.walk((node) => {
    if (node.kind === "comment") {
      const ieConditionalComment = parseIeConditionalComment(
        node,
        parseSubHtml,
      );
      if (ieConditionalComment) {
        node.parent.replaceChild(node, ieConditionalComment);
      }
    } else if (isAngular && node.kind === "element" && node.comments) {
      node.startTagComments = node.comments;
      delete node.comments;
    }

    if (isAngular) {
      normalizeAngularControlFlowBlock(node);
      normalizeAngularLetDeclaration(node);
      normalizeAngularIcuExpression(node);
    }
  });

  return ast;
}

// `@else    if`
function normalizeAngularControlFlowBlock(/** @type {Node} */ node) {
  if (node.kind !== "block") {
    return;
  }

  node.name = node.name.toLowerCase().replaceAll(/\s+/g, " ").trim();
  node.kind = "angularControlFlowBlock";

  if (!isNonEmptyArray(node.parameters)) {
    delete node.parameters;
    return;
  }

  for (const parameter of node.parameters) {
    parameter.kind = "angularControlFlowBlockParameter";
  }

  node.parameters = {
    kind: "angularControlFlowBlockParameters",
    children: node.parameters,
    sourceSpan: new ParseSourceSpan(
      node.parameters[0].sourceSpan.start,
      node.parameters.at(-1).sourceSpan.end,
    ),
  };
}

function normalizeAngularLetDeclaration(/** @type {Node} */ node) {
  if (node.kind !== "letDeclaration") {
    return;
  }

  // Similar to `VariableDeclarator` in estree
  node.kind = "angularLetDeclaration";
  node.id = node.name;
  node.init = {
    kind: "angularLetDeclarationInitializer",
    sourceSpan: new ParseSourceSpan(node.valueSpan.start, node.valueSpan.end),
    value: node.value,
  };

  delete node.name;
  delete node.value;
}

function normalizeAngularIcuExpression(/** @type {Node} */ node) {
  if (node.kind === "expansion") {
    node.kind = "angularIcuExpression";
  }
  if (node.kind === "expansionCase") {
    node.kind = "angularIcuCase";
  }
}

/** @returns {string} */ function lowerCaseIf(/** @type {string} */ text, /** @type {(text: string) => boolean} */ fn) {
  /** @type {string} */ const lowerCasedText = text.toLowerCase();
  return fn(lowerCasedText) ? lowerCasedText : text;
}

/**
 * @param {Attribute | Element} node
 */
function restoreName(node) {
  /** @type {string | null} */ const namespace = node.name.startsWith(":")
    ? node.name.slice(1).split(":", 1)[0]
    : null;
  /** @type {string} */ const rawName = node.nameSpan.toString();
  /** @type {boolean} */ const hasExplicitNamespace =
    namespace !== null && rawName.startsWith(`${namespace}:`);
  /** @type {string} */ const name = hasExplicitNamespace
    ? rawName.slice(namespace.length + 1)
    : rawName;

  node.name = name;
  // @ts-expect-error -- expected
  node.namespace = namespace;
  // @ts-expect-error -- expected
  node.hasExplicitNamespace = hasExplicitNamespace;
}

/**
 * @param {AstNode} node
 */
function restoreNameAndValue(node) {
  switch (node.kind) {
    case "element":
      restoreName(/** @type {Element} */ (node));
      for (const attr of /** @type {Element} */ (node).attrs) {
        restoreName(attr);
        if (!attr.valueSpan) {
          attr.value = null;
        } else {
          attr.value = attr.valueSpan.toString();
          if (/["']/.test(attr.value[0])) {
            attr.value = attr.value.slice(1, -1);
          }
        }
      }
      break;

    case "comment":
      /** @type {Comment} */ (node).value = /** @type {SourceSpan} */ (node.sourceSpan)
        .toString()
        .slice("<!--".length, -"-->".length);
      break;

    case "text":
      /** @type {Text} */ (node).value = /** @type {SourceSpan} */ (node.sourceSpan).toString();
      break;

    // No default
  }
}

/**
 * @param {AstNode} node
 * @param {NormalizedParseOptions} parseOptions
 */
function addTagDefinition(node, parseOptions) {
  if (node.kind === "element") {
    /** @type {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/html_tags.mjs").HtmlTagDefinition} */ const tagDefinition = getHtmlTagDefinition(
      parseOptions.isTagNameCaseSensitive ? /** @type {Element} */ (node).name : /** @type {Element} */ (node).name.toLowerCase(),
    );
    if (
      // @ts-expect-error -- we add it
      !(/** @type {Element} */ (node).namespace) ||
      // @ts-expect-error -- we add it
      /** @type {Element} */ (node).namespace === tagDefinition.implicitNamespacePrefix ||
      isUnknownNamespace(/** @type {Element} */ (node))
    ) {
      // @ts-expect-error -- expected
      /** @type {Element} */ (node).tagDefinition = tagDefinition;
    } else {
      // @ts-expect-error -- expected
      /** @type {Element} */ (node).tagDefinition = getHtmlTagDefinition(""); // the default one
    }
  }
}

function fixSourceSpan(/** @type {AstNode} */ node) {
  if (node.sourceSpan && node.endSourceSpan) {
    node.sourceSpan = new ParseSourceSpan(
      node.sourceSpan.start,
      node.endSourceSpan.end,
    );
  }
}

function normalizeName(/** @type {AstNode} */ node, /** @type {NormalizedParseOptions} */ parseOptions) {
  if (node.kind === "element") {
    if (
      parseOptions.normalizeTagName &&
      (!(/** @type {Element} */ (node).namespace) ||
        /** @type {Element} */ (node).namespace === /** @type {Element} */ (node).tagDefinition.implicitNamespacePrefix ||
        isUnknownNamespace(node))
    ) {
      /** @type {Element} */ (node).name = lowerCaseIf(/** @type {Element} */ (node).name, /** @returns {boolean} */ (/** @type {string} */ lowerCasedName) =>
        HTML_TAGS.has(lowerCasedName),
      );
    }

    if (parseOptions.normalizeAttributeName) {
      for (const attr of /** @type {Element} */ (node).attrs) {
        if (!attr.namespace) {
          attr.name = lowerCaseIf(
            attr.name,
            /** @returns {boolean} */ (/** @type {string} */ lowerCasedAttrName) =>
              HTML_ELEMENT_ATTRIBUTES.has(node.name) &&
              (HTML_ELEMENT_ATTRIBUTES.get("*").has(lowerCasedAttrName) ||
                HTML_ELEMENT_ATTRIBUTES.get(/** @type {Element} */ (node).name).has(lowerCasedAttrName)),
          );
        }
      }
    }
  }
}

export { postprocess };
