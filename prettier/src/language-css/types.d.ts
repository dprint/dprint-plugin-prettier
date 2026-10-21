// the nodes of prettier's CSS tree as its code reads them: postcss's nodes, whose types prettier gives a "css-"
// prefix, the nodes of postcss-values-parser, postcss-selector-parser and postcss-media-query-parser, and the
// records that prettier writes out for the groups of a value and for what it does not parse
export interface CssNode {
  type?: string;
  value?: any;
  raws?: any;
  source?: any;
  sourceIndex?: any;
  groups?: CssNode[];
  group?: CssNode;
  nodes?: CssNode[];
  parent?: CssNode;
  params?: any;
  name?: any;
  selector?: any;
  prop?: any;
  text?: any;
  raw?: any;
  open?: any;
  close?: any;
  namespace?: any;
  attribute?: any;
  operator?: any;
  insensitive?: any;
  quoted?: any;
  unit?: any;
  important?: any;
  extend?: any;
  variable?: any;
  mixin?: any;
  function?: any;
  inline?: any;
  js?: any;
  scss?: any;
  scssGlobal?: any;
  scssDefault?: any;
  isHex?: any;
  isColor?: any;
  isNested?: any;
  isScssNestedProperty?: any;
  customSelector?: any;
  import?: any;
  frontMatter?: any;
  filename?: any;
  __prettier_attribute_selector_flag?: any;
}
