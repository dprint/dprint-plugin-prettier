import { Schema } from '../schema.js';
export class BooleanSchema extends Schema {
    expected() {
        return 'true or false';
    }
    validate(value) {
        return typeof value === 'boolean';
    }
}
