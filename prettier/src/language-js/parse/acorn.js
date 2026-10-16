// @nts-check
import { Parser as AcornParser } from "acorn";
import acornJsx from "acorn-jsx";
import createError from "../../common/parser-create-error.js";
import tryCombinations from "../../utils/try-combinations.js";
import postprocess from "./postprocess/index.js";
import createParser from "./utils/create-parser.js";
import getSourceType from "./utils/get-source-type.js";

/** @import {Options} from "acorn" */

/** @type {Options} */
const parseOptions = {
  ecmaVersion: "latest",
  // sourceType: "module",
  allowReturnOutsideFunction: true,
  // allowImportExportEverywhere: true,
  allowSuperOutsideMethod: true,
  locations: true,
  ranges: true,
};

function createParseError(error) {
  const { message, loc } = error;

  /* c8 ignore next 3 */
  if (!loc) {
    return error;
  }

  const { line, column } = loc;

  return createError(message.replace(/ \(\d+:\d+\)$/u, ""), {
    loc: {
      start: { line, column: column + 1 },
    },
    cause: error,
  });
}

/** @type {ReturnType<AcornParser.extend> | undefined} */
let parser;
const getParser = () => {
  parser ??= AcornParser.extend(acornJsx());
  return parser;
};

function parseWithOptions(/** @type {string} */ text, /** @type {string} */ sourceType) {
  const parser = getParser();

  const comments = [];
  const tokens = [];

  const ast = parser.parse(text, {
    ...parseOptions,
    sourceType,
    allowImportExportEverywhere: sourceType === "module",
    onComment: comments,
    onToken: tokens,
  });

  // @ts-expect-error -- expected
  ast.comments = comments;
  // @ts-expect-error -- expected
  ast.tokens = tokens;

  return ast;
}

function parse(/** @type {string | undefined} */ text, options = {}) {
  const sourceType = getSourceType(options);
  const combinations = (sourceType ? [sourceType] : ["module", "script"]).map(
    (sourceType) => () => parseWithOptions(text, sourceType),
  );

  let ast;
  try {
    ast = tryCombinations(combinations);
  } catch (/** @type {any} */ { errors: [error] }) {
    throw createParseError(error);
  }

  return postprocess(ast, { text });
}

export const acorn = createParser(parse);
