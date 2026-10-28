function debug(/** @type {string} */ logLevel, ...messages) {
    if (logLevel === 'debug')
        console.log(...messages);
}
function warn(/** @type {string} */ logLevel, warning) {
    if (logLevel === 'debug' || logLevel === 'warn') {
        console.warn(warning);
    }
}

export { debug, warn };
