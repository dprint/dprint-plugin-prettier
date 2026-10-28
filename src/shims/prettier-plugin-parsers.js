// the parsers of `prettier/plugins/babel` and `prettier/plugins/flow` as Prettier's package gives them to the Prettier
// plugins that import them, whose bundles have their own copies of what they share with Prettier's printers. What a
// parser remembers of the comments that it parses is not what the printer finds, which matters when a plugin changes
// the comments after parsing, as prettier-plugin-jsdoc does: the lines of a comment that the parser found to be one
// that may be indented (in merge-nestled-jsdoc-comments.js) are worked out again by the printer from what it holds then
import { deleteIndentableBlockCommentLines } from "../../prettier/src/language-js/utilities/indentable-block-comment.js";

/** Gives each parser a parse that leaves nothing that it remembers of the comments for the printer. */
export function withOwnCommentCaches(parsers) {
  const result = {};
  for (const [name, parser] of Object.entries(parsers)) {
    result[name] = {
      ...parser,
      parse(text, options) {
        const ast = parser.parse(text, options);
        return typeof ast?.then === "function" ? ast.then(forgetComments) : forgetComments(ast);
      },
    };
  }
  return result;
}

function forgetComments(ast) {
  for (const comment of ast?.comments ?? []) {
    deleteIndentableBlockCommentLines(comment);
  }
  return ast;
}
