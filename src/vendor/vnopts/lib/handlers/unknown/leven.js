import picocolors from 'picocolors';
import { closestMatch } from 'leven';
/** @import {VnoptsUtils} from '../../normalize.js' */
export const levenUnknownHandler = (/** @type {string} */ key, value, /** @type {VnoptsUtils} */ { descriptor, logger, schemas }) => {
    const messages = [
        `Ignored unknown option ${picocolors.yellow(descriptor.pair({ key, value }))}.`,
    ];
    const suggestion = closestMatch(key, Object.keys(schemas), { maxDistance: 3 });
    if (suggestion) {
        messages.push(`Did you mean ${picocolors.blue(descriptor.key(suggestion))}?`);
    }
    logger.warn(messages.join(' '));
};
