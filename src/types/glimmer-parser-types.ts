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

// the text of an attribute's value that glimmer's tokenizer events are putting together, a text node that its builder
// writes out as an object, which they give a character at a time
export type GlimmerTextPart = {
  type: string;
  chars: string;
  loc: SourceSpan;
};

// the attribute that glimmer's tokenizer events are putting together, which they write out as an object
export interface GlimmerPendingAttribute {
  name: string;
  parts: any[];
  currentPart: GlimmerTextPart | null;
  isQuoted: boolean;
  isDynamic: boolean;
  start: SourceOffset;
  valueSpan: SourceSpan;
}

// the positions that glimmer's offsets are made of (HbsPosition and CharPosition of @glimmer/syntax), which its module
// does not export: an offset holds one of them or an invisible position
type OffsetData = InstanceType<typeof src.SourceOffset>["data"];
type HbsPosition = Extract<OffsetData, { hbsPos: unknown }>;
type CharPosition = Extract<OffsetData, { charPos: number }>;

// the two ends of a span of the source (`HbsPositions` and `CharPositions` of @glimmer/syntax's spans), which it writes
// out as objects: interfaces, so that they are objects of classes whose ends are fields
export interface HbsPositions {
  start: HbsPosition;
  end: HbsPosition;
}

export interface CharPositions {
  start: CharPosition;
  end: CharPosition;
}
