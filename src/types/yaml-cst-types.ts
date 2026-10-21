// the tokens of yaml's concrete syntax tree (yaml/dist/parse/cst.d.ts), which yaml's lexer and parser only ever write
// out as objects: one record type for all kinds, with what each kind holds, as code reads them by their type. An
// array of records is an array of anything to nts, so arrays of tokens are the same arrays that the parser creates
// and keeps adding to; `start` is a token of a flow collection and an array of tokens of a document
export type Token = {
  type: string;
  offset: number;
  indent?: number;
  source?: string;
  message?: string;
  start?: any;
  value?: Token;
  end?: Token[];
  props?: Token[];
  items?: CollectionItem[];
};

// an item of a collection of the tree, which the parser writes out as an object
export type CollectionItem = {
  start: Token[];
  explicitKey?: true;
  key?: Token | null;
  sep?: Token[];
  value?: Token;
};

// what composing a document is given (yaml/dist/compose/compose-node.d.ts), which yaml writes out as an object, or
// as a copy of one with another value
export type ComposeContext = {
  atKey: boolean;
  atRoot: boolean;
  directives: import("../vendor/yaml/browser/dist/doc/directives.js").Directives;
  options: any;
  schema: import("../vendor/yaml/browser/dist/schema/Schema.js").Schema;
};

// what composing calls with what it finds wrong (yaml/dist/compose/composer.d.ts): the composer's own function, or
// one that composing a scalar writes around it
export type ComposeErrorHandler = (source: any, code: string, message: string, warning?: boolean) => void;

// what resolveProps gives (yaml/dist/compose/resolve-props.d.ts), which it writes out as an object
export type ResolvedProps = {
  comma: Token | null;
  found: Token | null;
  spaceBefore: boolean;
  comment: string;
  hasNewline: boolean;
  anchor: Token | null;
  tag: Token | null;
  newlineAfterProp: Token | null;
  end: number;
  start: number;
};

// what resolving the end of a node gives (yaml/dist/compose/resolve-end.d.ts), written out as an object
export type ResolvedEnd = {
  comment: string;
  offset: number;
};
