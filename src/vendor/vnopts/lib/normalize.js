// @nts-check
import { VALUE_NOT_EXIST, VALUE_UNCHANGED } from './constants.js';
import { defaultDeprecatedHandler, defaultDescriptor, defaultInvalidHandler, defaultUnknownHandler, } from './defaults.js';
import { createAutoChecklist, normalizeDefaultResult, normalizeDeprecatedResult, normalizeExpectedResult, normalizeForwardResult, normalizeInvalidHandler, normalizeRedirectResult, normalizeValidateResult, partition, recordFromArray, } from './utils.js';
export const normalize = (options, schemas, opts) => new Normalizer(schemas, opts).normalize(options);
export class Normalizer {
    constructor(/** @type {any[]} */ schemas, opts) {
        /* c8 ignore start */
        const { logger = console, loggerPrintWidth = 80, descriptor = defaultDescriptor, unknown = defaultUnknownHandler, invalid = defaultInvalidHandler, deprecated = defaultDeprecatedHandler, missing = /** @returns {boolean} */ () => false, required = /** @returns {boolean} */ () => false, preprocess = (x) => x, postprocess = () => VALUE_UNCHANGED, } = opts || {};
        /* c8 ignore stop */
        this._utils = {
            descriptor,
            logger: /* c8 ignore next */ logger || { warn: () => { } },
            loggerPrintWidth,
            schemas: recordFromArray(schemas, 'name'),
            normalizeDefaultResult,
            normalizeExpectedResult,
            normalizeDeprecatedResult,
            normalizeForwardResult,
            normalizeRedirectResult,
            normalizeValidateResult,
        };
        this._unknownHandler = unknown;
        this._invalidHandler = normalizeInvalidHandler(invalid);
        this._deprecatedHandler = deprecated;
        this._identifyMissing = /** @returns {boolean} */ (/** @type {string} */ k, o) => !(k in o) || missing(k, o);
        this._identifyRequired = required;
        this._preprocess = preprocess;
        this._postprocess = postprocess;
        this.cleanHistory();
    }
    cleanHistory() {
        this._hasDeprecationWarned = createAutoChecklist();
    }
    normalize(options) {
        const newOptions = {};
        const preprocessed = this._preprocess(options, this._utils);
        const restOptionsArray = [preprocessed];
        const applyNormalization = () => {
            while (restOptionsArray.length !== 0) {
                const currentOptions = restOptionsArray.shift();
                const transferredOptionsArray = this._applyNormalization(currentOptions, newOptions);
                restOptionsArray.push(...transferredOptionsArray);
            }
        };
        applyNormalization();
        for (const key of Object.keys(this._utils.schemas)) {
            const schema = this._utils.schemas[key];
            if (!(key in newOptions)) {
                const defaultResult = normalizeDefaultResult(schema.default(this._utils));
                if ('value' in defaultResult) {
                    restOptionsArray.push({ [key]: defaultResult.value });
                }
            }
        }
        applyNormalization();
        for (const key of Object.keys(this._utils.schemas)) {
            if (!(key in newOptions)) {
                continue;
            }
            const schema = this._utils.schemas[key];
            const value = newOptions[key];
            const newValue = schema.postprocess(value, this._utils);
            if (newValue === VALUE_UNCHANGED) {
                continue;
            }
            this._applyValidation(newValue, key, schema);
            newOptions[key] = newValue;
        }
        this._applyPostprocess(newOptions);
        this._applyRequiredCheck(newOptions);
        return newOptions;
    }
    /** @returns {any[]} */ _applyNormalization(options, newOptions) {
        const transferredOptionsArray = [];
        const { knownKeys, unknownKeys } = this._partitionOptionKeys(options);
        for (const key of knownKeys) {
            const schema = this._utils.schemas[key];
            const value = schema.preprocess(options[key], this._utils);
            this._applyValidation(value, key, schema);
            const appendTransferredOptions = ({ from, to }) => {
                transferredOptionsArray.push(typeof to === 'string' ? { [to]: from } : { [to.key]: to.value });
            };
            const warnDeprecated = ({ value: currentValue, redirectTo, }) => {
                const deprecatedResult = normalizeDeprecatedResult(schema.deprecated(currentValue, this._utils), value, 
                /* doNotNormalizeTrue */ true);
                if (deprecatedResult === false) {
                    return;
                }
                if (deprecatedResult === true) {
                    if (!this._hasDeprecationWarned(key)) {
                        this._utils.logger.warn(this._deprecatedHandler(key, redirectTo, this._utils));
                    }
                }
                else {
                    for (const { value: deprecatedValue } of deprecatedResult) {
                        const pair = { key, value: deprecatedValue };
                        if (!this._hasDeprecationWarned(pair)) {
                            const redirectToPair = typeof redirectTo === 'string'
                                ? { key: redirectTo, value: deprecatedValue }
                                : redirectTo;
                            this._utils.logger.warn(this._deprecatedHandler(pair, redirectToPair, this._utils));
                        }
                    }
                }
            };
            const forwardResult = normalizeForwardResult(schema.forward(value, this._utils), value);
            forwardResult.forEach(appendTransferredOptions);
            const redirectResult = normalizeRedirectResult(schema.redirect(value, this._utils), value);
            redirectResult.redirect.forEach(appendTransferredOptions);
            if ('remain' in redirectResult) {
                const remainingValue = redirectResult.remain;
                newOptions[key] =
                    key in newOptions
                        ? schema.overlap(newOptions[key], remainingValue, this._utils)
                        : remainingValue;
                warnDeprecated({ value: remainingValue });
            }
            for (const { from, to } of redirectResult.redirect) {
                warnDeprecated({ value: from, redirectTo: to });
            }
        }
        for (const key of unknownKeys) {
            const value = options[key];
            this._applyUnknownHandler(key, value, newOptions, (knownResultKey, knownResultValue) => {
                transferredOptionsArray.push({ [knownResultKey]: knownResultValue });
            });
        }
        return transferredOptionsArray;
    }
    _applyRequiredCheck(options) {
        for (const key of Object.keys(this._utils.schemas)) {
            if (this._identifyMissing(key, options)) {
                if (this._identifyRequired(key)) {
                    throw this._invalidHandler(key, VALUE_NOT_EXIST, this._utils);
                }
            }
        }
    }
    _partitionOptionKeys(options) {
        const [knownKeys, unknownKeys] = partition(Object.keys(options).filter(/** @returns {boolean} */ key => !this._identifyMissing(key, options)), /** @returns {boolean} */ key => key in this._utils.schemas);
        return { knownKeys, unknownKeys };
    }
    _applyValidation(value, /** @type {string} */ key, schema) {
        const validateResult = normalizeValidateResult(schema.validate(value, this._utils), value);
        if (validateResult !== true) {
            throw this._invalidHandler(key, validateResult.value, this._utils);
        }
    }
    _applyUnknownHandler(/** @type {string} */ key, value, newOptions, /** @type {(a0?: any, a1?: any) => any} */ knownResultHandler) {
        const unknownResult = this._unknownHandler(key, value, this._utils);
        if (!unknownResult) {
            return;
        }
        for (const resultKey of Object.keys(unknownResult)) {
            if (this._identifyMissing(resultKey, unknownResult)) {
                continue;
            }
            const resultValue = unknownResult[resultKey];
            if (resultKey in this._utils.schemas) {
                knownResultHandler(resultKey, resultValue);
            }
            else {
                newOptions[resultKey] = resultValue;
            }
        }
    }
    _applyPostprocess(options) {
        const postprocessed = this._postprocess(options, this._utils);
        if (postprocessed === VALUE_UNCHANGED) {
            return;
        }
        if (postprocessed.delete) {
            for (const deleteKey of postprocessed.delete) {
                delete options[deleteKey];
            }
        }
        if (postprocessed.override) {
            const { knownKeys, unknownKeys } = this._partitionOptionKeys(postprocessed.override);
            for (const key of knownKeys) {
                const value = postprocessed.override[key];
                this._applyValidation(value, key, this._utils.schemas[key]);
                options[key] = value;
            }
            for (const key of unknownKeys) {
                const value = postprocessed.override[key];
                this._applyUnknownHandler(key, value, options, (knownResultKey, knownResultValue) => {
                    const schema = this._utils.schemas[knownResultKey];
                    this._applyValidation(knownResultValue, knownResultKey, schema);
                    options[knownResultKey] = knownResultValue;
                });
            }
        }
    }
}
