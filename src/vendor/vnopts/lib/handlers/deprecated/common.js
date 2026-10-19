import picocolors from 'picocolors';
export const commonDeprecatedHandler = (keyOrPair, redirectTo, { descriptor }) => {
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
