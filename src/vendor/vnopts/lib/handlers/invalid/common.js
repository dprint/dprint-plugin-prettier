// @nts-check
import picocolors from 'picocolors';
import { VALUE_NOT_EXIST } from '../../constants.js';
/**
 * @import {VnoptsDescriptor, VnoptsUtils} from '../../normalize.js'
 * @import {VnoptsExpected} from '../../utils.js'
 */
/** @type {string} */ const INDENTATION = ' '.repeat(2);
export const commonInvalidHandler = (/** @type {string} */ key, value, /** @type {VnoptsUtils} */ utils) => {
    const { text, list } = utils.normalizeExpectedResult(utils.schemas[key].expected(utils));
    /** @type {string[]} */ const descriptions = [];
    if (text) {
        descriptions.push(getDescription(key, value, text, utils.descriptor));
    }
    if (list) {
        descriptions.push([getDescription(key, value, list.title, utils.descriptor)]
            .concat(list.values.map(valueDescription => getListDescription(valueDescription, utils.loggerPrintWidth)))
            .join('\n'));
    }
    return chooseDescription(descriptions, utils.loggerPrintWidth);
};
/** @returns {string} */ function getDescription(/** @type {string} */ key, value, /** @type {string} */ expected, /** @type {VnoptsDescriptor} */ descriptor) {
    return [
        `Invalid ${picocolors.red(descriptor.key(key))} value.`,
        `Expected ${picocolors.blue(expected)},`,
        `but received ${value === VALUE_NOT_EXIST
            ? picocolors.gray('nothing')
            : picocolors.red(descriptor.value(value))}.`,
    ].join(' ');
}
/** @returns {string} */ function getListDescription(/** @type {VnoptsExpected} */ { text, list }, /** @type {number} */ printWidth) {
    /** @type {string[]} */ const descriptions = [];
    if (text) {
        descriptions.push(`- ${picocolors.blue(text)}`);
    }
    if (list) {
        descriptions.push([`- ${picocolors.blue(list.title)}:`]
            .concat(list.values.map(valueDescription => getListDescription(valueDescription, printWidth - INDENTATION.length).replace(/^|\n/g, `$&${INDENTATION}`)))
            .join('\n'));
    }
    return chooseDescription(descriptions, printWidth);
}
/** @returns {string} */ function chooseDescription(/** @type {string[]} */ descriptions, /** @type {number} */ printWidth) {
    if (descriptions.length === 1) {
        return descriptions[0];
    }
    const [firstDescription, secondDescription] = descriptions;
    const [firstWidth, secondWidth] = descriptions.map(description => description.split('\n', 1)[0].length);
    return firstWidth > printWidth && firstWidth > secondWidth
        ? secondDescription
        : firstDescription;
}
