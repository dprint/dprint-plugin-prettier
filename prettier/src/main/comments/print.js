// @nts-check
import { commentsPropertyInOptions } from "../../constants.js";
import {
  breakParent,
  hardline,
  indent,
  inheritLabel,
  join,
  line,
  lineSuffix,
} from "../../document/index.js";
import hasNewline from "../../utilities/has-newline.js";
import isPreviousLineEmpty from "../../utilities/is-previous-line-empty.js";
import { skipSpaces } from "../../utilities/skip.js";
import skipNewline from "../../utilities/skip-newline.js";

/**
@import AstPath from "../../common/ast-path.js"
@import {Doc, HardLine, Line} from "../../document/index.js"
@typedef {{
  filter?: (comment: any) => boolean,
}} CommentPrintOptions
@typedef {{doc: Doc, isBlock: any, hasLineSuffix: boolean}} PrintedTrailingComment
*/

const returnTrue = /** @returns {boolean} */ () => true;

function printComment(/** @type {AstPath} */ path, /** @type {import("../../../../prettier/src/main/format-options.js").FormatOptions} */ options) {
  const comment = path.node;
  comment.printed = true;
  return options.printer.printComment(path, options);
}

/** @returns {any[]} */ function printLeadingComment(/** @type {AstPath} */ path, /** @type {import("../../../../prettier/src/main/format-options.js").FormatOptions} */ options) {
  const comment = path.node;
  const parts = [printComment(path, options)];

  const { printer, originalText, locStart, locEnd } = options;
  /** @type {boolean | undefined} */
  const isBlock = printer.isBlockComment?.(comment);

  // Leading block comments should see if they need to stay on the
  // same line or not.
  if (isBlock) {
    /** @type {HardLine | Line | " "} */
    let lineBreak = " ";
    if (hasNewline(originalText, locEnd(comment))) {
      if (hasNewline(originalText, locStart(comment), { backwards: true })) {
        lineBreak = hardline;
      } else {
        lineBreak = line;
      }
    }

    parts.push(lineBreak);
  } else {
    parts.push(hardline);
  }

  const index = skipNewline(
    originalText,
    skipSpaces(originalText, locEnd(comment)),
  );

  if (index !== false && hasNewline(originalText, index)) {
    parts.push(hardline);
  }

  return parts;
}

/** @returns {PrintedTrailingComment} */
function printTrailingComment(/** @type {AstPath} */ path, /** @type {import("../../../../prettier/src/main/format-options.js").FormatOptions} */ options, /** @type {PrintedTrailingComment | undefined} */ previousComment) {
  const comment = path.node;
  const printed = printComment(path, options);

  const { printer, originalText, locStart } = options;
  const isBlock = printer.isBlockComment?.(comment);

  if (
    (previousComment?.hasLineSuffix && !previousComment?.isBlock) ||
    hasNewline(originalText, locStart(comment), { backwards: true })
  ) {
    // This allows comments at the end of nested structures:
    // {
    //   x: 1,
    //   y: 2
    //   // A comment
    // }
    // Those kinds of comments are almost always leading comments, but
    // here it doesn't go "outside" the block and turns it into a
    // trailing comment for `2`. We can simulate the above by checking
    // if this a comment on its own line; normal trailing comments are
    // always at the end of another expression.

    /** @type {boolean} */ const isLineBeforeEmpty = isPreviousLineEmpty(
      originalText,
      locStart(comment),
    );

    return {
      doc: lineSuffix([hardline, isLineBeforeEmpty ? hardline : "", printed]),
      isBlock,
      hasLineSuffix: true,
    };
  }

  if (!isBlock || previousComment?.hasLineSuffix) {
    return {
      doc: [lineSuffix([" ", printed]), breakParent],
      isBlock,
      hasLineSuffix: true,
    };
  }

  return { doc: [" ", printed], isBlock, hasLineSuffix: false };
}

/**
 * @param {AstPath} path
 * @param {CommentPrintOptions & {
 *  indent?: boolean,
 *  marker?: symbol | string,
 * }} [danglingCommentsPrintOptions]
 * @returns {Doc}
 */
function printDanglingComments(
  path,
  /** @type {import("../../../../prettier/src/main/format-options.js").FormatOptions} */ options,
  danglingCommentsPrintOptions = {},
) {
  const {
    indent: shouldIndent = false,
    marker,
    filter = returnTrue,
  } = danglingCommentsPrintOptions;
  const danglingComments = new Set(
    /** @type {any[] | undefined} */ (path.node?.comments)?.filter(
      /** @returns {boolean} */ (/** @type {any} */ comment) =>
        !(
          comment.leading ||
          comment.trailing ||
          comment.marker !== marker ||
          !filter(comment)
        ),
    ),
  );

  if (danglingComments.size === 0) {
    return "";
  }

  const parts = path
    .map(
      ({ node: comment }) =>
        danglingComments.has(comment) ? printComment(path, options) : "",
      "comments",
    )
    .filter(Boolean);

  const doc = join(hardline, parts);
  return shouldIndent ? indent([hardline, doc]) : doc;
}

/**
@param {AstPath} path
@param {CommentPrintOptions} [printOptions]
@returns {Doc}
*/
function printLeadingComments(path, /** @type {import("../../../../prettier/src/main/format-options.js").FormatOptions} */ options, printOptions) {
  /** @type {Set<any> | undefined} */
  const printed = options[Symbol.for("printedComments")];
  const filter = printOptions?.filter ?? returnTrue;
  const leadingComments = new Set(
    /** @type {any[] | undefined} */ (path.node?.comments)?.filter(
      /** @returns {boolean} */ (/** @type {any} */ comment) => !printed?.has(comment) && comment.leading && filter(comment),
    ),
  );

  if (leadingComments.size === 0) {
    return "";
  }

  return path
    .map(
      ({ node: comment }) =>
        leadingComments.has(comment) ? printLeadingComment(path, options) : "",
      "comments",
    )
    .filter(Boolean);
}

/**
@param {AstPath} path
@param {CommentPrintOptions} [printOptions]
@returns {Doc}
*/
function printTrailingComments(path, /** @type {import("../../../../prettier/src/main/format-options.js").FormatOptions} */ options, printOptions) {
  /** @type {any[] | undefined} */
  const comments = path.node?.comments;
  const trailingComments = new Set(
    comments?.filter(/** @returns {boolean} */ (comment) => comment.trailing),
  );
  /** @type {Set<any> | undefined} */
  const printed = options[Symbol.for("printedComments")];
  const filter = printOptions?.filter ?? returnTrue;
  const commentsShouldPrint = new Set(
    comments?.filter(
      /** @returns {boolean} */ (comment) =>
        trailingComments.has(comment) &&
        !printed?.has(comment) &&
        filter(comment),
    ),
  );

  if (commentsShouldPrint.size === 0) {
    return "";
  }

  /** @type {Doc[]} */
  const docs = [];
  /** @type {PrintedTrailingComment | undefined} */
  let printedTrailingComment;
  path.each(({ node: comment }) => {
    if (!trailingComments.has(comment)) {
      return;
    }

    printedTrailingComment = printTrailingComment(
      path,
      options,
      printedTrailingComment,
    );

    if (commentsShouldPrint.has(comment)) {
      docs.push(printedTrailingComment.doc);
    }
  }, "comments");

  return docs;
}

/**
@param {CommentPrintOptions} [printOptions]
@returns {{leading: Doc, trailing: Doc}}
*/
function printCommentsSeparately(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../../../../prettier/src/main/format-options.js").FormatOptions} */ options, printOptions) {
  return {
    leading: printLeadingComments(path, options, printOptions),
    trailing: printTrailingComments(path, options, printOptions),
  };
}

/**
@param {CommentPrintOptions} [printOptions]
@returns {Doc}
*/
function printComments(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {Doc} */ doc, /** @type {import("../../../../prettier/src/main/format-options.js").FormatOptions} */ options, printOptions) {
  const leading = printLeadingComments(path, options, printOptions);
  const trailing = printTrailingComments(path, options, printOptions);
  return leading || trailing
    ? inheritLabel(doc, (/** @type {Doc} */ doc) => [leading, doc, trailing])
    : doc;
}

function ensureAllCommentsPrinted(/** @type {import("../../../../prettier/src/main/format-options.js").FormatOptions} */ options) {
  const {
    [commentsPropertyInOptions]: comments,
    [Symbol.for("printedComments")]: printedComments,
  } = options;

  for (const comment of comments) {
    if (!comment.printed && !printedComments.has(comment)) {
      throw new Error(
        'Comment "' +
          comment.value.trim() +
          '" was not printed. Please report this error!',
      );
    }
    delete comment.printed;
  }
}

export {
  ensureAllCommentsPrinted,
  printComments,
  printCommentsSeparately,
  printDanglingComments,
  printLeadingComments,
};
