// the tokens of yaml's concrete syntax tree (yaml/dist/parse/cst.d.ts), which yaml's lexer and parser only ever write
// out as objects: one record type for all kinds, with what each kind holds, as code reads them by their type. Arrays
// are of anything, as the parser creates them as arrays of anything and keeps adding to them, which an array of
// another type would be a copy of
export type Token = {
  type: string;
  offset: number;
  indent?: number;
  source?: string;
  message?: string;
  start?: any;
  value?: Token;
  end?: any[];
  props?: any[];
  items?: any[];
};

// an item of a collection of the tree, which the parser writes out as an object
export type CollectionItem = {
  start: any[];
  explicitKey?: true;
  key?: Token | null;
  sep?: any[];
  value?: Token;
};

// what composing a document is given (yaml/dist/compose/compose-node.d.ts), which yaml writes out as an object, or
// as a copy of one with another value
export type ComposeContext = {
  atKey: boolean;
  atRoot: boolean;
  directives: any;
  options: any;
  schema: any;
};
