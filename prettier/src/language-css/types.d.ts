// the nodes of prettier's CSS tree as its code reads them: postcss's nodes, whose types prettier gives a "css-"
// prefix, the nodes of postcss-values-parser, postcss-selector-parser and postcss-media-query-parser, and the
// records that prettier writes out for the groups of a value and for what it does not parse
export interface CssNode {
  type?: string;
  value?: any;
  raws?: CssRaws;
  source?: CssSource;
  sourceIndex?: number;
  groups?: CssNode[];
  group?: CssNode;
  nodes?: CssNode[];
  parent?: CssNode;
  params?: any;
  name?: string;
  selector?: any;
  prop?: string;
  text?: string;
  raw?: any;
  open?: any;
  close?: any;
  namespace?: any;
  attribute?: string;
  operator?: string;
  insensitive?: boolean;
  quoted?: boolean;
  unit?: string;
  important?: boolean;
  extend?: boolean;
  variable?: boolean;
  mixin?: boolean;
  function?: boolean;
  inline?: boolean;
  js?: any;
  scss?: any;
  scssGlobal?: boolean;
  scssDefault?: boolean;
  isHex?: boolean;
  isColor?: boolean;
  isNested?: boolean;
  isScssNestedProperty?: boolean;
  customSelector?: string;
  import?: boolean;
  frontMatter?: any;
  filename?: any;
  __prettier_attribute_selector_flag?: any;
}

// where a node is: postcss gives its line, column and offset, the other parsers its line and column, and prettier
// gives every node its offsets in the text (`endOffset` is null where it could not be found)
export interface CssSource {
  input?: any;
  start?: CssPosition;
  end?: CssPosition;
  startOffset?: number;
  endOffset?: number | null;
}

export interface CssPosition {
  line?: number;
  column?: number;
  offset?: number;
}

// what the parsers keep of the text around a node; the selector, value and params are postcss's records of what
// was written, over which prettier writes texts
export interface CssRaws {
  before?: string;
  after?: string;
  between?: string;
  afterName?: string;
  semicolon?: boolean;
  ownSemicolon?: string;
  important?: string;
  identifier?: string;
  inline?: boolean;
  quote?: string;
  left?: string;
  right?: string;
  text?: string;
  begin?: string;
  scssDefault?: string;
  scssGlobal?: string;
  insensitive?: string;
  unquoted?: string;
  selector?: any;
  value?: any;
  params?: any;
}
