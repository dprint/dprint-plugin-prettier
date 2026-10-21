import type { src } from "@glimmer/syntax";

type SourceOffset = InstanceType<typeof src.SourceOffset>;
type SourceSpan = InstanceType<typeof src.SourceSpan>;

// the comment, text or tag that glimmer's tokenizer events are putting together (@glimmer/syntax's
// parser/tokenizer-event-handlers.ts), which it writes out as objects: an interface, so that they are objects of a class
// whose fields the events give a character at a time, in the order of the objects' properties
export interface GlimmerPendingNode {
  type: string;
  value?: string;
  chars?: string;
  name?: string;
  nameStart?: SourceOffset | null;
  nameEnd?: SourceOffset | null;
  attributes?: any[];
  modifiers?: any[];
  comments?: any[];
  params?: any[];
  selfClosing?: boolean;
  start: SourceOffset;
}

// the attribute that glimmer's tokenizer events are putting together, which they write out as an object
export interface GlimmerPendingAttribute {
  name: string;
  parts: any[];
  currentPart: any;
  isQuoted: boolean;
  isDynamic: boolean;
  start: SourceOffset;
  valueSpan: SourceSpan;
}
