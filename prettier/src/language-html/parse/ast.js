// @nts-check
import { isFrontMatter } from "../../main/front-matter/index.js";

const NODES_KEYS = {
  attrs: true,
  children: true,
  cases: true, // plural and select
  expression: true, // for expansionCase
};

const NON_ENUMERABLE_PROPERTIES = new Set(["parent"]);

// TODO: typechecking is problematic for this class because of this issue:
// https://github.com/microsoft/TypeScript/issues/26811

/**
 * @typedef {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseSourceSpan} ParseSourceSpan
 * @typedef {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/html_tags.mjs").HtmlTagDefinition} HtmlTagDefinition
 * @typedef {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").BlockParameter} BlockParameter
 * @typedef {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").StartTagComment} StartTagComment
 *
 * the parameters of an Angular control flow block, which prettier writes out in place of the array of them
 * @typedef {{kind: string, children: BlockParameter[], sourceSpan: ParseSourceSpan}} AngularControlFlowBlockParameters
 *
 * what an Angular let declaration is given, which prettier writes out
 * @typedef {{kind: string, sourceSpan: ParseSourceSpan, value: string}} AngularLetDeclarationInitializer
 *
 * what the printer is given as a node: the nodes, the parameters of Angular blocks with what prettier writes out for
 * them, the initializers of let declarations and the comments in start tags
 * @typedef {Node | BlockParameter | StartTagComment | AngularControlFlowBlockParameters | AngularLetDeclarationInitializer} HtmlNode
 *
 * the options that a parser of HTML is created with, once the defaults are added
 * @typedef {{
 *   name: string,
 *   canSelfClose?: boolean,
 *   normalizeTagName?: boolean,
 *   normalizeAttributeName?: boolean,
 *   allowHtmComponentClosingTags?: boolean,
 *   allowStartTagComments?: boolean,
 *   isTagNameCaseSensitive?: boolean,
 *   shouldParseFrontMatter?: boolean,
 *   tokenizeAngularBlocks?: boolean,
 *   tokenizeAngularLetDeclaration?: boolean,
 *   shouldParseAsRawText?: any,
 * }} NormalizedParseOptions
 */

/**
 * @property {ParseSourceSpan} [sourceSpan]
 * @property {ParseSourceSpan} [startSourceSpan]
 * @property {ParseSourceSpan | null} [endSourceSpan]
 * @property {ParseSourceSpan} [nameSpan]
 * @property {ParseSourceSpan} [keySpan]
 * @property {ParseSourceSpan} [valueSpan]
 * @property {any} [switchValueSourceSpan]
 * @property {any} [expSourceSpan]
 * @property {any} [valueSourceSpan]
 * @property {string} [name]
 * @property {any} [value]
 * @property {any} [type]
 * @property {Node[]} [children]
 * @property {Node[]} [attrs]
 * @property {any} [directives]
 * @property {any} [comments]
 * @property {any} [tokens]
 * @property {any} [valueTokens]
 * @property {any} [parameters]
 * @property {Node[]} [cases]
 * @property {any} [expression]
 * @property {any} [switchValue]
 * @property {any} [namespace]
 * @property {boolean} [hasExplicitNamespace]
 * @property {HtmlTagDefinition} [tagDefinition]
 * @property {any} [isSelfClosing]
 * @property {boolean} [isVoid]
 * @property {any} [i18n]
 * @property {any} [componentName]
 * @property {any} [tagName]
 * @property {string} [cssDisplay]
 * @property {boolean} [isWhitespaceSensitive]
 * @property {boolean} [isIndentationSensitive]
 * @property {boolean} [hasLeadingSpaces]
 * @property {boolean} [hasTrailingSpaces]
 * @property {boolean} [hasDanglingSpaces]
 * @property {boolean} [isLeadingSpaceSensitive]
 * @property {boolean} [isTrailingSpaceSensitive]
 * @property {boolean} [isDanglingSpaceSensitive]
 * @property {any} [hasHtmComponentClosingTag]
 * @property {any} [condition]
 * @property {any} [complete]
 * @property {any} [startTagComments]
 * @property {any} [language]
 * @property {any} [explicitLanguage]
 * @property {any} [startDelimiter]
 * @property {any} [endDelimiter]
 * @property {any} [raw]
 * @property {any} [start]
 * @property {any} [end]
 * @property {any} [id]
 * @property {any} [init]
 */
class Node {
  /** @type {string} */ kind;
  /** @type {Node | undefined} */ parent;

  constructor(nodeOrProperties = {}) {
    for (const property of new Set([
      ...NON_ENUMERABLE_PROPERTIES,
      ...Object.keys(nodeOrProperties),
    ])) {
      this.setProperty(property, nodeOrProperties[property]);
    }

    if (isFrontMatter(nodeOrProperties)) {
      for (const property of Object.getOwnPropertySymbols(nodeOrProperties)) {
        this.setProperty(property, nodeOrProperties[property]);
      }
    }
  }

  setProperty(/** @type {any} */ property, value) {
    if (this[property] === value) {
      return;
    }

    if (property in NODES_KEYS) {
      value = value.map(/** @returns {Node} */ (node) => this.createChild(node));
    }

    if (!NON_ENUMERABLE_PROPERTIES.has(property)) {
      this[property] = value;
      return;
    }

    Object.defineProperty(this, property, {
      value,
      enumerable: false,
      configurable: true,
    });
  }

  map(fn) {
    /** @type{any} */
    let newNode;

    for (const NODES_KEY in NODES_KEYS) {
      const nodes = this[NODES_KEY];
      if (nodes) {
        const mappedNodes = mapNodesIfChanged(nodes, (node) => node.map(fn));
        if (newNode !== nodes) {
          newNode ??= new Node({ parent: this.parent });
          newNode.setProperty(NODES_KEY, mappedNodes);
        }
      }
    }

    if (newNode) {
      for (const key in this) {
        if (!(key in NODES_KEYS)) {
          newNode[key] = this[key];
        }
      }
    }

    return fn(newNode || this);
  }

  walk(/** @type {(node: Node) => void} */ fn) {
    for (const NODES_KEY in NODES_KEYS) {
      /** @type {Node[] | undefined} */ const nodes = this[NODES_KEY];
      if (nodes) {
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].walk(fn);
        }
      }
    }
    fn(this);
  }

  /** @returns {Node} */ createChild(/** @type {import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").Text | import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").Element | import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").Attribute | import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").Comment | import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").DocType | object | Node | import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").CDATA | import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").Block | import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").LetDeclaration} */ nodeOrProperties) {
    /** @type {Node} */ const node =
      nodeOrProperties instanceof Node
        ? nodeOrProperties.clone()
        : new Node(nodeOrProperties);
    node.setProperty("parent", this);
    return node;
  }

  /**
   * @param {Node} [target]
   * @param {Object} [node]
   */
  insertChildBefore(target, node) {
    const children = this.$children;
    children.splice(children.indexOf(target), 0, this.createChild(node));
  }

  /**
   * @param {Node} [child]
   */
  removeChild(child) {
    const children = this.$children;
    children.splice(children.indexOf(child), 1);
  }

  /**
   * @param {Node} [target]
   * @param {Object} [node]
   */
  replaceChild(target, node) {
    const children = this.$children;
    children[children.indexOf(target)] = this.createChild(node);
  }

  /** @returns {Node} */ clone() {
    return new Node(this);
  }

  get #childrenProperty() {
    if (this.kind === "angularIcuCase") {
      return "expression";
    }

    if (this.kind === "angularIcuExpression") {
      return "cases";
    }

    return "children";
  }

  // Use `$` prefix since `children` already exits in the original AST,
  // Can't use `#children` either, since it need be public
  // There are other children in different Node, see `#childrenProperty`
  /** @returns {Node[] | undefined} */ get $children() {
    return this[this.#childrenProperty];
  }

  set $children(/** @type {Node[] | undefined} */ value) {
    this[this.#childrenProperty] = value;
  }

  /** @returns {Node | undefined} */ get firstChild() {
    return this.$children?.[0];
  }

  /** @returns {Node | undefined} */ get lastChild() {
    return this.$children?.at(-1);
  }

  /** @returns {Node[]} */ get #siblings() {
    return this.parent?.$children ?? [];
  }

  /** @returns {Node | undefined} */ get prev() {
    const siblings = this.#siblings;
    return siblings[siblings.indexOf(this) - 1];
  }

  /** @returns {Node | undefined} */ get next() {
    const siblings = this.#siblings;
    return siblings[siblings.indexOf(this) + 1];
  }

  // for element and attribute
  /** @returns {string} */ get rawName() {
    // @ts-expect-error
    return this.hasExplicitNamespace ? this.fullName : this.name;
  }

  /** @returns {string | undefined} */ get fullName() {
    // @ts-expect-error
    return this.namespace ? this.namespace + ":" + this.name : this.name;
  }

  get attrMap() {
    return Object.fromEntries(
      // @ts-expect-error
      this.attrs.map(/** @returns {any[]} */ (/** @type {Node} */ attr) => [attr.fullName, attr.value]),
    );
  }
}

function mapNodesIfChanged(nodes, fn) {
  const newNodes = nodes.map(fn);
  return newNodes.some((newNode, index) => newNode !== nodes[index])
    ? newNodes
    : nodes;
}

export { Node };
