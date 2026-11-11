// a node of the trees that glimmer's parser builds (@glimmer/syntax's ASTv1 and the Handlebars tree it is made
// from), which it writes out as objects, some with getters: one record type for every kind, with what any kind holds
// (the arrays of nodes are the arrays the parsers create, as an array of records is one of anything to nts)
export type GlimmerNode = {
  type: string;
  attributes?: GlimmerNode[];
  blockParams?: any;
  body?: GlimmerNode[];
  chained?: any;
  chars?: string;
  children?: GlimmerNode[];
  closeStrip?: any;
  closeTag?: any;
  comments?: GlimmerNode[];
  data?: any;
  depth?: any;
  escaped?: any;
  hash?: GlimmerNode | null;
  head?: any;
  indent?: any;
  inverse?: GlimmerNode | null;
  inverseStrip?: any;
  key?: any;
  loc?: any;
  modifiers?: GlimmerNode[];
  name?: any;
  openStrip?: any;
  openTag?: any;
  original?: any;
  pairs?: GlimmerNode[];
  params?: GlimmerNode[];
  parts?: any;
  path?: GlimmerNode | null;
  program?: GlimmerNode | null;
  selfClosing?: any;
  strip?: any;
  tag?: string;
  tail?: any;
  this?: any;
  trusting?: any;
  value?: any;
};
