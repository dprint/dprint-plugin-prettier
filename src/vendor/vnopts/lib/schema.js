// @nts-check
import { VALUE_UNCHANGED } from './constants.js';
const HANDLER_KEYS = [
    'default',
    'expected',
    'validate',
    'deprecated',
    'forward',
    'redirect',
    'overlap',
    'preprocess',
    'postprocess',
];
export function createSchema(SchemaConstructor, parameters) {
    const schema = new SchemaConstructor(parameters);
    const subSchema = Object.create(schema);
    for (const handlerKey of HANDLER_KEYS) {
        if (handlerKey in parameters) {
            // @ts-ignore
            subSchema[handlerKey] = normalizeHandler(parameters[handlerKey], schema, Schema.prototype[handlerKey].length);
        }
    }
    return subSchema;
}
export class Schema {
    static create(parameters) {
        // @ts-ignore: https://github.com/Microsoft/TypeScript/issues/5863
        return createSchema(this, parameters);
    }
    constructor(parameters) {
        /** @type {string} */ this.name = parameters.name;
    }
    default(_utils) {
        return undefined;
    }
    // this is actually an abstract method but we need a placeholder to get `function.length`
    /* c8 ignore start */
    expected(_utils) {
        return 'nothing';
    }
    /* c8 ignore stop */
    // this is actually an abstract method but we need a placeholder to get `function.length`
    /* c8 ignore start */
    validate(_value, _utils) {
        return false;
    }
    /* c8 ignore stop */
    deprecated(_value, _utils) {
        return false;
    }
    forward(_value, _utils) {
        return undefined;
    }
    redirect(_value, _utils) {
        return undefined;
    }
    overlap(currentValue, _newValue, _utils) {
        return currentValue;
    }
    preprocess(value, _utils) {
        return value;
    }
    postprocess(_value, _utils) {
        return VALUE_UNCHANGED;
    }
}
function normalizeHandler(handler, superSchema, /** @type {number} */ handlerArgumentsLength) {
    return typeof handler === 'function'
        ? /** @returns {boolean} */ (...args) => handler(...args.slice(0, handlerArgumentsLength - 1), superSchema, ...args.slice(handlerArgumentsLength - 1))
        : () => handler;
}
