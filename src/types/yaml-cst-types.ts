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
  options: DocumentOptions;
  schema: import("../vendor/yaml/browser/dist/schema/Schema.js").Schema;
};

// the options of a document (yaml/dist/options.d.ts), which `new Document` writes out as a copy of its defaults with
// what it is given put over them, so that what the caller gives as missing may be missing
export type DocumentOptions = {
  intAsBigInt?: boolean;
  keepSourceTokens?: boolean;
  logLevel?: string;
  prettyErrors?: boolean;
  strict?: boolean;
  stringKeys?: boolean;
  uniqueKeys?: any;
  version?: string;
  merge?: boolean;
  lineCounter?: any;
  _directives?: import("../vendor/yaml/browser/dist/doc/directives.js").Directives;
};

// a tag of a schema (yaml/dist/schema/types.d.ts), which yaml writes out as an object for each kind of value, or as
// a copy of one with `default` or `test` put over it; what it calls are functions of different kinds
export type SchemaTag = {
  tag: string;
  default?: boolean | string;
  test?: RegExp;
  format?: string;
  collection?: string;
  nodeClass?: any;
  resolve?: (value: any, onError: (message: string) => void, options: DocumentOptions) => any;
  identify?: any;
  stringify?: any;
  createNode?: any;
};

// the options of writing a document out (yaml/dist/options.d.ts), which createStringifyContext writes out as its
// defaults with what the schema and the caller give put over them
export type StringifyOptions = {
  blockQuote?: boolean | string;
  collectionStyle?: string;
  commentString?: (comment: string) => string;
  defaultKeyType?: string | null;
  defaultStringType?: string;
  directives?: boolean | null;
  doubleQuotedAsJSON?: boolean;
  doubleQuotedMinMultiLineLength?: number;
  falseStr?: string;
  flowCollectionPadding?: boolean;
  indent?: number;
  indentSeq?: boolean;
  lineWidth?: number;
  minContentWidth?: number;
  nullStr?: string;
  simpleKeys?: boolean;
  singleQuote?: boolean | null;
  trailingComma?: boolean;
  trueStr?: string;
  verifyAliasOrder?: boolean;
};

// what writing a node out is given (yaml/dist/stringify/stringify.d.ts), which createStringifyContext writes out as an
// object, and which is copied with more put over it for what is inside a node
export type StringifyContext = {
  actualString?: boolean;
  allNullValues?: boolean;
  anchors: Set<string>;
  doc: import("../vendor/yaml/browser/dist/doc/Document.js").Document;
  flowCollectionPadding?: string;
  forceBlockIndent?: boolean;
  implicitKey?: boolean;
  inFlow?: boolean | null;
  indent: string;
  indentAtStart?: number;
  indentStep?: string;
  noValues?: boolean;
  options: StringifyOptions;
  resolvedAliases?: Set<any>;
};

// what making nodes of values of JavaScript is given (yaml/dist/doc/createNode.d.ts), which Document#createNode writes
// out as an object
export type CreateNodeContext = {
  aliasDuplicateObjects?: boolean;
  keepUndefined?: boolean;
  onAnchor: (source: any) => string;
  onTagObj?: (tagObj: SchemaTag) => void;
  replacer?: any;
  schema: import("../vendor/yaml/browser/dist/schema/Schema.js").Schema;
  sourceObjects: Map<any, any>;
};

// what turning nodes into values of JavaScript is given (yaml/dist/nodes/toJS.d.ts), which Document#toJS writes out as
// an object; what the anchors map to are written out as objects too, which the map holds as anything
export type ToJSContext = {
  aliasResolveCache?: any[];
  anchors: Map<any, any>;
  doc: import("../vendor/yaml/browser/dist/doc/Document.js").Document;
  keep: boolean;
  mapAsMap: boolean;
  mapKeyWarned: boolean;
  maxAliasCount: number;
  onCreate?: (res: any) => void;
};

// what the anchors of ToJSContext map a node to
export type ToJSAnchor = {
  aliasCount: number;
  count: number;
  res: any;
};

// what resolving a flow or block scalar gives (yaml/dist/compose/resolve-flow-scalar.d.ts), written out as an object
export type ResolvedScalar = {
  value: string;
  type: string | null;
  comment: string;
  range: number[];
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

