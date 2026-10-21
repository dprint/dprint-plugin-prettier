// @nts-check
/**
 * The options of a file being formatted as prettier's core reads them once they are normalized, with what the parser
 * gives it: where a node starts and ends in the text, and the printer of the language.
 *
 * @import AstPath from "../common/ast-path.js"
 * @typedef {{
 *   originalText: string,
 *   parser: string,
 *   locStart: (node: any) => number,
 *   locEnd: (node: any) => number,
 *   printer: Printer,
 *   getVisitorKeys: any,
 *   plugins: any[],
 *   tabWidth: number,
 *   useTabs: boolean,
 *   printWidth: number,
 *   endOfLine: string,
 *   cursorOffset: number,
 *   rangeStart: number,
 *   rangeEnd: number,
 *   requirePragma: boolean,
 *   insertPragma: boolean,
 *   checkIgnorePragma: boolean,
 *   embeddedLanguageFormatting: string,
 *   cursorNode?: any,
 *   nodeBeforeCursor?: any,
 *   nodeAfterCursor?: any,
 * }} FormatOptions
 *
 * The printer of a language as the core calls it, once `normalizePrinter` has given it its features and its
 * visitor keys. What the hooks give is left as anything, as the printers of the languages give different things.
 *
 * @typedef {{
 *   print: (path: AstPath, options: any, print: any, args?: any) => any,
 *   embed?: any,
 *   preprocess?: (ast: any, options: any) => any,
 *   hasPrettierIgnore?: (path: AstPath) => any,
 *   printComment?: (path: AstPath, options: any) => any,
 *   printPrettierIgnored?: (path: AstPath, options: any, print: any, args?: any) => any,
 *   isBlockComment?: (comment: any) => any,
 *   willPrintOwnComments?: (path: AstPath, options: any) => any,
 *   canAttachComment?: (node: any, ancestors?: any[]) => any,
 *   getCommentChildNodes?: (node: any, options: any) => any,
 *   isGap?: (text: string, options: any) => any,
 *   handleComments?: any,
 *   massageAstNode?: any,
 *   insertPragma?: (text: string) => string,
 *   getVisitorKeys?: (node: any, nonTraversableKeys?: any) => any,
 *   features?: any,
 * }} Printer
 *
 * A comment of any language with the nodes around it that `attachComments` finds, and what its handlers are given.
 *
 * @typedef {{
 *   enclosingNode?: any,
 *   precedingNode?: any,
 *   followingNode?: any,
 *   comment: any,
 *   text: string,
 *   options: FormatOptions,
 *   ast: any,
 *   isLastComment: boolean,
 *   placement: string | undefined,
 * }} DecoratedComment
 */

export {};
