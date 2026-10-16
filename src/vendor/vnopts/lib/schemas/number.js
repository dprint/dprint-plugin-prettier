import { Schema } from '../schema.js';
export class NumberSchema extends Schema {
    expected() {
        return 'a number';
    }
    validate(value, _utils) {
        return typeof value === 'number';
    }
}
