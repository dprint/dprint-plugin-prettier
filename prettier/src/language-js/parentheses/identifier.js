// @nts-check
import { isBinaryCastExpression } from "../utilities/node-types.js";
import { startsWithNoLookaheadToken } from "../utilities/starts-with-no-lookahead-token.js";

const namesNeedParenthesesAsExpressionOfBinaryCastExpression = new Set([
  "await",
  "interface",
  "module",
  "using",
  "yield",
  "let",
  "component",
  "hook",
  "type",
]);

/** @returns {boolean} */ function shouldAddParenthesesToIdentifier(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  // Identifiers never need parentheses.
  if (node.type !== "Identifier") {
    return false;
  }

  // ...unless those identifiers are embed placeholders. They might be substituted by complex
  // expressions, so the parens around them should not be dropped. Example (JS-in-HTML-in-JS):
  //     let tpl = html`<script> f((${expr}) / 2); </script>`;
  // If the inner JS formatter removes the parens, the expression might change its meaning:
  //     f((a + b) / 2)  vs  f(a + b / 2)
  if (
    node.extra?.parenthesized &&
    /^PRETTIER_HTML_PLACEHOLDER_\d+_\d+_IN_JS$/.test(node.name)
  ) {
    return true;
  }

  /** @type {{ key: any, parent: import("../types/estree.js").Node }} */ const { key, parent } = path;
  // `for ((async) of []);` and `for ((let) of []);`
  if (
    key === "left" &&
    ((node.name === "async" && !parent.await) || node.name === "let") &&
    parent.type === "ForOfStatement"
  ) {
    return true;
  }

  // `for ((let.a) of []);`
  // `for ((let.a) in []);`
  if (node.name === "let") {
    /** @type {import("../types/estree.js").Node | undefined} */ const statement = path.findAncestor(
      /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) =>
        node.type === "ForOfStatement" || node.type === "ForInStatement",
    );
    if (
      statement &&
      startsWithNoLookaheadToken(
        statement.left,
        /** @returns {boolean} */ (leftmostNode) => leftmostNode === node,
      )
    ) {
      return true;
    }
  }

  // `(let)[a] = 1`
  if (
    key === "object" &&
    node.name === "let" &&
    parent.type === "MemberExpression" &&
    parent.computed &&
    !parent.optional
  ) {
    /** @type {import("../types/estree.js").Node | undefined} */ const statement = path.findAncestor(
      /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) =>
        node.type === "ExpressionStatement" ||
        node.type === "ForStatement" ||
        node.type === "ForInStatement",
    );
    if (statement) {
      const expression =
        statement.type === "ExpressionStatement"
          ? statement.expression
          : statement.type === "ForStatement"
            ? statement.init
            : statement.left;
      if (
        startsWithNoLookaheadToken(
          expression,
          /** @returns {boolean} */ (leftmostNode) => leftmostNode === node,
        )
      ) {
        return true;
      }
    }
  }

  if (node.name === "await") {
    /** @type {import("../types/estree.js").Node | undefined} */ const statement = path.findAncestor(
      /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) => node.type === "ExpressionStatement",
    );
    if (statement) {
      const { expression } = statement;
      if (
        startsWithNoLookaheadToken(
          expression,
          /** @returns {boolean} */ (leftmostNode) => leftmostNode === node,
        )
      ) {
        return true;
      }
    }
  }

  // `(type) satisfies never;` and similar cases
  if (
    key === "expression" &&
    isBinaryCastExpression(parent) &&
    namesNeedParenthesesAsExpressionOfBinaryCastExpression.has(node.name) &&
    /** @type {import("../types/estree.js").Node} */ (path.findAncestor(/** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) => !isBinaryCastExpression(node))).type ===
      "ExpressionStatement"
  ) {
    return true;
  }

  return false;
}

export { shouldAddParenthesesToIdentifier };
