// @nts-check
// the types of what prettier's handlebars printer reads, for nts

/**
 * A node of glimmer's tree as the printer reads it, which glimmer's parser writes out as objects of a shape that
 * depends on the kind of node
 * @typedef {{
 *   type: string,
 *   tag?: string,
 *   chars?: string,
 *   name?: string,
 *   original?: string,
 *   key?: string,
 *   value?: any,
 *   program?: GlimmerNode,
 *   inverse?: GlimmerNode,
 *   path?: GlimmerNode,
 *   head?: GlimmerNode,
 *   hash?: GlimmerNode,
 *   loc?: any,
 *   trusting?: boolean,
 *   escaped?: boolean,
 *   selfClosing?: boolean,
 *   strip?: StripFlags,
 *   openStrip?: StripFlags,
 *   inverseStrip?: StripFlags,
 *   closeStrip?: StripFlags,
 *   children?: GlimmerNode[],
 *   body?: GlimmerNode[],
 *   params?: GlimmerNode[],
 *   parts?: any[],
 *   pairs?: GlimmerNode[],
 *   tail?: any[],
 *   attributes?: GlimmerNode[],
 *   modifiers?: GlimmerNode[],
 *   comments?: GlimmerNode[],
 *   blockParams?: any[],
 * }} GlimmerNode
 */

/** @typedef {{ open: boolean, close: boolean }} StripFlags */

/**
 * The options that the handlebars printer reads
 * @typedef {{
 *   htmlWhitespaceSensitivity: string,
 *   singleQuote: boolean,
 *   originalText: string,
 * }} GlimmerOptions
 */

/** @typedef {(selector?: any, args?: any) => any} GlimmerPrint */

export {};
