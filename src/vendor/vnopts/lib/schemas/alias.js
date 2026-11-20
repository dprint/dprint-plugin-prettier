import { Schema } from '../schema.js';
/** @import {VnoptsUtils} from '../normalize.js' */
export class AliasSchema extends Schema {
    constructor(parameters) {
        super(parameters);
        /** @type {string} */ this._sourceName = parameters.sourceName;
    }
    expected(/** @type {VnoptsUtils} */ utils) {
        return utils.schemas[this._sourceName].expected(utils);
    }
    validate(value, /** @type {VnoptsUtils} */ utils) {
        return utils.schemas[this._sourceName].validate(value, utils);
    }
    redirect(_value, /** @type {import("../normalize.js").VnoptsUtils} */ _utils) {
        return this._sourceName;
    }
}
