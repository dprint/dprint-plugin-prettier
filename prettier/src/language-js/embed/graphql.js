// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import { hardline, indent, join } from "../../document/builders.js";
import {
  escapeTemplateCharacters,
  printTemplateExpressions,
} from "../print/template-literal.js";
import { hasLanguageComment } from "./utils.js";

async function printEmbedGraphQL(/** @type {(a0?: any, a1?: any) => any} */ textToDoc, print, /** @type {AstPath} */ path /*, options*/) {
  const { node } = path;

  const numQuasis = node.quasis.length;

  const expressionDocs = printTemplateExpressions(path, print);
  const parts = [];

  for (let i = 0; i < numQuasis; i++) {
    const templateElement = node.quasis[i];
    /** @type {boolean} */ const isFirst = i === 0;
    /** @type {boolean} */ const isLast = i === numQuasis - 1;
    const text = templateElement.value.cooked;

    const lines = text.split("\n");
    const numLines = lines.length;
    const expressionDoc = expressionDocs[i];

    /** @type {boolean} */ const startsWithBlankLine =
      numLines > 2 && lines[0].trim() === "" && lines[1].trim() === "";
    /** @type {boolean} */ const endsWithBlankLine =
      numLines > 2 &&
      lines[numLines - 1].trim() === "" &&
      lines[numLines - 2].trim() === "";

    const commentsAndWhitespaceOnly = lines.every(/** @returns {boolean} */ (/** @type {string} */ line) =>
      /^\s*(?:#[^\n\r]*)?$/u.test(line),
    );

    // Bail out if an interpolation occurs within a comment.
    if (!isLast && /#[^\n\r]*$/u.test(lines[numLines - 1])) {
      return null;
    }

    let doc = null;

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

    if (expressionDoc) {
      parts.push(expressionDoc);
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
/** @returns {boolean} */ function isGraphQL({ node, parent }) {
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

function printGraphql(path /*, options*/) {
  if (isGraphQL(path)) {
    return printEmbedGraphQL;
  }
}

export default printGraphql;
