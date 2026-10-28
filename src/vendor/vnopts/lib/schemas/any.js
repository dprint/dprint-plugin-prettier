import { Schema } from '../schema.js';
export class AnySchema extends Schema {
    expected() {
        return 'anything';
    }
    validate() {
        return true;
    }
}
