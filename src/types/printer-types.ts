/// <reference path="../../../nts/lib.d.ts" />
// The shapes that prettier's `src/document/printer.js` describes in comments, as interfaces: an
// object that the printer says is of one of them is then an object with fields of these types.

/** What the printer has yet to print: a document, how far it is indented and whether it is broken. */
export interface Command extends FitsCommand {
  ind: Indentation;
}

/** What is looked at to see if it fits on the rest of the line: a document and whether it is broken. */
export interface FitsCommand {
  doc: any;
  mode: any;
}

/** How far a line is indented: the text that indents it, how wide that is and what it was made of. */
export interface Indentation {
  value: string;
  length: number;
  queue: any[];
  root?: Indentation;
}
