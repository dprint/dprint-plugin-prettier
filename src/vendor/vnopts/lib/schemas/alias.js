import { Schema } from '../schema.js';
export class AliasSchema extends Schema {
    constructor(parameters) {
        super(parameters);
        this._sourceName = parameters.sourceName;
    }
    expected(utils) {
        return utils.schemas[this._sourceName].expected(utils);
    }
    validate(value, utils) {
        return utils.schemas[this._sourceName].validate(value, utils);
    }
    redirect(_value, _utils) {
        return this._sourceName;
    }
}
