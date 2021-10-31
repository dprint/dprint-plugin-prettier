const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export abstract class MessagePart {
  intoString() {
    if (this instanceof VariableMessagePart) {
      return this.getString();
    } else {
      throw new Error("Message part did not support converting to string.");
    }
  }

  static fromString(text: string) {
    return new VariableMessagePart(Buffer.from(textEncoder.encode(text)));
  }

  static fromNumber(value: number) {
    return new NumberMessagePart(value);
  }
}

export class VariableMessagePart extends MessagePart {
  constructor(private readonly buffer: Buffer) {
    super();
  }

  getBuffer() {
    return this.buffer;
  }

  getString() {
    return textDecoder.decode(this.buffer);
  }
}

export class NumberMessagePart extends MessagePart {
  constructor(private readonly value: number) {
    super();
  }

  getValue() {
    return this.value;
  }
}
