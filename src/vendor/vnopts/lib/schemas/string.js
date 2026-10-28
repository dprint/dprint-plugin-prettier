import { Schema } from '../schema.js';
export class StringSchema extends Schema {
    expected() {
        return 'a string';
    }
    validate(value) {
        return typeof value === 'string';
    }
}
