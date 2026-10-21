// what angular-html-parser's lexer writes out as objects, as interfaces that nts makes classes of: the state of a
// cursor, which is copied and changed for every character, and the tokens that the parser reads

// where a cursor is in the text, with the character there
export interface CursorState {
  peek: number;
  offset: number;
  line: number;
  column: number;
}

// a token of the lexer, which the parser reads
export interface Token {
  type: number;
  parts: string[];
  sourceSpan: InstanceType<typeof import("angular-html-parser").ParseSourceSpan>;
}

// an attribute of a start tag, as what decides the content type of the tag is given it
export interface TagAttribute {
  prefix: string;
  name: string;
  value: string | undefined;
}
