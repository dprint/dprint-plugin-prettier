import picocolors from 'picocolors';
/** @import {VnoptsUtils} from '../../normalize.js' */
export const commonDeprecatedHandler = /** @returns {string} */ (/** @type {string | { key: string, value: any }} */ keyOrPair, /** @type {string | { key: string, value: any } | undefined} */ redirectTo, /** @type {VnoptsUtils} */ { descriptor }) => {
    const messages = [
        `${picocolors.yellow(typeof keyOrPair === 'string'
            ? descriptor.key(keyOrPair)
            : descriptor.pair(keyOrPair))} is deprecated`,
    ];
    if (redirectTo) {
        messages.push(`we now treat it as ${picocolors.blue(typeof redirectTo === 'string'
            ? descriptor.key(redirectTo)
            : descriptor.pair(redirectTo))}`);
    }
    return messages.join('; ') + '.';
};
