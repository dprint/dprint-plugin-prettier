// A stand-in for the library that checks options, which passes the options on as they are.
// TODO: compile the library itself, which needs classes as values and prototypes.
class Schema {
  constructor(parameters) {
    this.parameters = parameters;
  }
}

export class AnySchema extends Schema {
  static create(parameters) {
    return new AnySchema(parameters);
  }
}
export class AliasSchema extends Schema {
  static create(parameters) {
    return new AliasSchema(parameters);
  }
}
export class ArraySchema extends Schema {
  static create(parameters) {
    return new ArraySchema(parameters);
  }
}
export class BooleanSchema extends Schema {
  static create(parameters) {
    return new BooleanSchema(parameters);
  }
}
export class ChoiceSchema extends Schema {
  static create(parameters) {
    return new ChoiceSchema(parameters);
  }
}
export class IntegerSchema extends Schema {
  static create(parameters) {
    return new IntegerSchema(parameters);
  }
}
export class StringSchema extends Schema {
  static create(parameters) {
    return new StringSchema(parameters);
  }
}

export const apiDescriptor = {
  key: (key) => key,
  value: (value) => String(value),
  pair: (pair) => pair.key + ": " + pair.value,
};

export function levenUnknownHandler(key, value, options) {
  return undefined;
}

export class Normalizer {
  constructor(schemas, options) {
    this.schemas = schemas;
  }

  normalize(options) {
    return { ...options };
  }
}
