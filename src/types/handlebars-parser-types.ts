// where a token or a rule's match of handlebars' jison parser is, which jison writes out as an object: a record, as the
// parser keeps them in an array that it declares with others, which nts holds as anything, and would copy as an array
// of a class where it is read
export type JisonLocation = {
  first_line: number;
  last_line: number;
  first_column: number;
  last_column: number;
  range?: any[];
};

// what jison's lexer is told, which handlebars' lexer is given none of
export interface JisonLexerOptions {
  ranges?: boolean;
  backtrack_lexer?: boolean;
  flex?: boolean;
}

// the lexer of handlebars' jison parser, an object literal whose methods call each other through `this`: an interface,
// so that it is an object of a class, whose methods say that they are called on it, so that they are given it and
// called directly; the parser makes one for each input with `Object.create`, which copies it
export interface JisonLexer {
  EOF: number;
  last_line?: any;
  yy: any;
  yytext: string;
  yyleng: number;
  yylineno: number;
  yylloc: JisonLocation;
  match: string;
  matched: string;
  matches: any;
  offset: number;
  done: boolean;
  _input: string;
  _more: boolean;
  _backtrack: boolean;
  conditionStack: string[];
  // the rules that each condition tries, by their place in `rules`
  conditions: Record<string, any>;
  rules: RegExp[];
  options: JisonLexerOptions;
  parseError(this: JisonLexer, str: string, hash: any): any;
  setInput(this: JisonLexer, input: string, yy: any): JisonLexer;
  input(this: JisonLexer): string;
  unput(this: JisonLexer, ch: string): JisonLexer;
  more(this: JisonLexer): JisonLexer;
  reject(this: JisonLexer): any;
  less(this: JisonLexer, n: number): void;
  pastInput(this: JisonLexer): string;
  upcomingInput(this: JisonLexer): string;
  showPosition(this: JisonLexer): string;
  test_match(this: JisonLexer, match: RegExpMatchArray, indexed_rule: number): any;
  next(this: JisonLexer): any;
  lex(this: JisonLexer): any;
  begin(this: JisonLexer, condition: string): void;
  popState(this: JisonLexer): string;
  _currentRules(this: JisonLexer): any[];
  topState(this: JisonLexer, n?: number): string;
  pushState(this: JisonLexer, condition: string): void;
  stateStackSize(this: JisonLexer): number;
  performAction(this: JisonLexer, yy: any, yy_: JisonLexer, $avoiding_name_collisions: number, YY_START: string): any;
}
