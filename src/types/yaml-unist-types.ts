// the places in a YAML file that yaml-unist-parser gives its nodes, as interfaces, which nts compiles to classes:
// the parser only ever creates them written out with these properties, and nothing lists or copies them
export interface Point {
  line: number;
  column: number;
  offset: number;
}

export interface Position {
  start: Point;
  end: Point;
}

// a node of the tree that yaml-unist-parser gives, which it writes out as an object with what its kind has, so that
// it is a record: one type for all kinds, as code reads them by kind, with what the kinds hold
export type YamlNode = {
  type: string;
  position: Position;
  children?: YamlNode[];
  leadingComments?: YamlNode[];
  middleComments?: YamlNode[];
  indicatorComment?: YamlNode | null;
  trailingComment?: YamlNode | null;
  endComments?: YamlNode[];
  anchor?: YamlNode | null;
  tag?: YamlNode | null;
  _parent?: YamlNode | null;
  comments?: YamlNode[];
  content?: YamlNode | null;
  head?: YamlNode;
  body?: YamlNode;
  key?: YamlNode;
  value?: any;
  indent: number | null;
  chomping?: string;
  name?: string;
  parameters?: any[];
  documentEndMarker?: any;
  directivesEndMarker?: any;
};

// what a node's tag, anchor and the comments between them are, which a node that has them is given by spreading it
export type Content = {
  anchor: YamlNode | null;
  tag: YamlNode | null;
  middleComments: YamlNode[];
};

// what a node of yaml is transformed with: the tokens of its tag, anchor and the comments around them
export type TransformProps = {
  tokens: import("./yaml-cst-types.ts").Token[];
};
