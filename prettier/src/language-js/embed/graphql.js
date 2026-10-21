// @nts-check
import { hardline, indent, join } from "../../document/index.js";
import {
  escapeTemplateCharacters,
  printEmbeddedTemplateExpressions,
} from "../print/template-literal.js";
import { hasLanguageComment } from "./utilities.js";

async function printEmbedGraphQL(textToDoc, print, /** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, options) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  const numQuasis = node.quasis.length;

  const expressionDocs = printEmbeddedTemplateExpressions(path, options, print);
  const parts = [];

  for (let i = 0; i < numQuasis; i++) {
    const templateElement = node.quasis[i];
    /** @type {boolean} */ const isFirst = i === 0;
    /** @type {boolean} */ const isLast = i === numQuasis - 1;
    const text = templateElement.value.cooked;

    const lines = text.split("\n");
    const numLines = lines.length;

    // Bail out if an interpolation occurs within a comment.
    if (!isLast && /#[^\n\r]*$/.test(lines[numLines - 1])) {
      return null;
    }

    /** @type {boolean} */ const startsWithBlankLine =
      numLines > 2 && lines[0].trim() === "" && lines[1].trim() === "";
    /** @type {boolean} */ const endsWithBlankLine =
      numLines > 2 &&
      lines[numLines - 1].trim() === "" &&
      lines[numLines - 2].trim() === "";

    const commentsAndWhitespaceOnly = lines.every(/** @returns {boolean} */ (/** @type {string} */ line) =>
      /^\s*(?:#[^\n\r]*)?$/.test(line),
    );

    let doc;

    if (commentsAndWhitespaceOnly) {
      doc = printGraphqlComments(lines);
    } else {
      doc = await textToDoc(text, { parser: "graphql" });
    }

    if (doc) {
      doc = escapeTemplateCharacters(doc, false);
      if (!isFirst && startsWithBlankLine) {
        parts.push("");
      }
      parts.push(doc);
      if (!isLast && endsWithBlankLine) {
        parts.push("");
      }
    } else if (!isFirst && !isLast && startsWithBlankLine) {
      parts.push("");
    }

    if (!isLast) {
      parts.push(expressionDocs[i]);
    }
  }

  return ["`", indent([hardline, join(hardline, parts)]), hardline, "`"];
}

function printGraphqlComments(/** @type {any[]} */ lines) {
  const parts = [];
  /** @type {boolean} */ let seenComment = false;

  const array = lines.map(/** @returns {string} */ (/** @type {string} */ textLine) => textLine.trim());
  for (const [i, textLine] of array.entries()) {
    // Lines are either whitespace only, or a comment (with potential whitespace
    // around it). Drop whitespace-only lines.
    if (textLine === "") {
      continue;
    }

    if (array[i - 1] === "" && seenComment) {
      // If a non-first comment is preceded by a blank (whitespace only) line,
      // add in a blank line.
      parts.push([hardline, textLine]);
    } else {
      parts.push(textLine);
    }

    seenComment = true;
  }

  // If `lines` was whitespace only, return `null`.
  return parts.length === 0 ? null : join(hardline, parts);
}

/*
 * react-relay and graphql-tag
 * graphql`...`
 * graphql.experimental`...`
 * gql`...`
 * GraphQL comment block
 *
 * This intentionally excludes Relay Classic tags, as Prettier does not
 * support Relay Classic formatting.
 */
/** @returns {boolean} */ function isEmbedGraphQL(/** @type {import("../../common/ast-path.js").default} */ { node, parent }) {
  return (
    hasLanguageComment({ node, parent }, "GraphQL") ||
    (parent &&
      ((parent.type === "TaggedTemplateExpression" &&
        ((parent.tag.type === "MemberExpression" &&
          parent.tag.object.name === "graphql" &&
          parent.tag.property.name === "experimental") ||
          (parent.tag.type === "Identifier" &&
            (parent.tag.name === "gql" || parent.tag.name === "graphql")))) ||
        (parent.type === "CallExpression" &&
          parent.callee.type === "Identifier" &&
          parent.callee.name === "graphql")))
  );
}

export { isEmbedGraphQL, printEmbedGraphQL };
