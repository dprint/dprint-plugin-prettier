// @nts-check
/**
 * The options that the printers of JavaScript read, as prettier normalizes them: every option of every language that
 * prettier supports is given its default, and what is only there for embedded code or a cursor may be missing.
 *
 * @typedef {{
 *   originalText: string,
 *   parser: string,
 *   filepath?: string | null,
 *   printWidth: number,
 *   tabWidth: number,
 *   useTabs: boolean,
 *   semi: boolean,
 *   singleQuote: boolean,
 *   jsxSingleQuote: boolean,
 *   bracketSpacing: boolean,
 *   bracketSameLine: boolean,
 *   singleAttributePerLine: boolean,
 *   experimentalTernaries: boolean,
 *   quoteProps: string,
 *   objectWrap: string,
 *   arrowParens: string,
 *   trailingComma: string,
 *   experimentalOperatorPosition: string,
 *   htmlWhitespaceSensitivity: string,
 *   plugins: any[],
 *   parentParser?: string | null,
 *   jsxBracketSameLine?: boolean | null,
 *   cursorNode?: any,
 *   nodeBeforeCursor?: any,
 *   nodeAfterCursor?: any,
 *   __inJestEach?: boolean | null,
 *   __isVueForBindingLeft?: boolean | null,
 *   __isVueBindings?: boolean | null,
 *   __isInHtmlInterpolation?: boolean | null,
 *   __isHtmlInlineEventHandler?: boolean | null,
 *   __isEmbeddedTypescriptGenericParameters?: boolean | null,
 *   __embeddedInHtml?: boolean | null,
 *   __babelSourceType?: string | null,
 *   __onHtmlBindingRoot?: any,
 * }} JsPrintOptions
 */

/**
 * What prints a part of the node that the path is at, given which part by its name or place (or nothing for the node
 * itself), and what the printer of that part is given beside it, which gives the part's doc.
 *
 * @typedef {(selector?: any, args?: any) => any} JsPrint
 */

export {};
