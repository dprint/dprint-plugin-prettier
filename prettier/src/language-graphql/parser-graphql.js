// @nts-check
import { GraphQLError, parse as parseGraphql } from "graphql";
import createError from "../common/parser-create-error.js";
import { locEnd, locStart } from "./loc.js";
import { hasIgnorePragma, hasPragma } from "./pragma.js";

/**
@import {ParseOptions} from "graphql"
*/

/** @returns {any[]} */ function parseComments(/** @type {import("graphql-ast-types").GraphqlAstNode} */ ast) {
  const comments = [];
  const { startToken, endToken } = /** @type {import("../../../src/vendor/graphql/language/ast.mjs").Location} */ (ast.loc);
  for (let token = startToken; token !== endToken; token = token.next) {
    if (token.kind === "Comment") {
      comments.push({ ...token, loc: { start: token.start, end: token.end } });
    }
  }

  return comments;
}

/** @type {any} */
const parseOptions = {
  experimentalFragmentArguments: true,
};

function createParseError(/** @type {import("../../../src/vendor/graphql/error/GraphQLError.mjs").GraphQLError} */ error) {
  /* c8 ignore next 3 */
  if (!(error instanceof GraphQLError)) {
    return error;
  }

  const {
    message,
    locations: [start],
  } = error;
  return createError(message, { loc: { start }, cause: error });
}

function parse(/** @type {string | undefined} */ text /* , options */) {
  let ast;
  try {
    ast = parseGraphql(text, parseOptions);
  } catch (error) {
    throw createParseError(error);
  }

  // @ts-expect-error -- expected
  ast.comments = parseComments(ast);
  return ast;
}

export const graphql = {
  parse,
  astFormat: "graphql",
  hasPragma,
  hasIgnorePragma,
  locStart,
  locEnd,
};
