// what the extensions of mdast-util-gfm import for turning trees back into markdown, which prettier does not do, so
// their handlers that use it are never called, as prettier's own build leaves it out
export const defaultHandlers = {};
