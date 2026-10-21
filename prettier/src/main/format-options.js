// @nts-check
/**
 * The options of a file being formatted as prettier's core reads them once they are normalized, with what the parser
 * gives it: where a node starts and ends in the text, and the printer of the language.
 *
 * @typedef {{
 *   originalText: string,
 *   parser: string,
 *   locStart: (node: any) => number,
 *   locEnd: (node: any) => number,
 *   printer: any,
 *   getVisitorKeys: any,
 *   plugins: any[],
 *   tabWidth: number,
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
 */

export {};
