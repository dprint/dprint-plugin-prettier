import { Schema } from '../schema.js';
export class NumberSchema extends Schema {
    expected() {
        return 'a number';
    }
    validate(value, /** @type {import("../normalize.js").VnoptsUtils} */ _utils) {
        return typeof value === 'number';
    }
}
