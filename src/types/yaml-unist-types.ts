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
  children?: any[];
  leadingComments?: any[];
  middleComments?: any[];
  indicatorComment?: YamlNode | null;
  trailingComment?: YamlNode | null;
  endComments?: any[];
  anchor?: YamlNode | null;
  tag?: YamlNode | null;
  _parent?: any;
  comments?: any[];
  content?: any;
  head?: any;
  body?: any;
  key?: any;
  value?: any;
  indent: number | null;
  chomping?: string;
  name?: string;
  parameters?: any[];
  documentEndMarker?: any;
  directivesEndMarker?: any;
};
