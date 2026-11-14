// @nts-check
/** @returns {boolean} */ function isDtsFile(/** @type {string | undefined} */ filepath) {
  return typeof filepath === "string" && /\.d\.(?:ts|mts|cts)$/i.test(filepath);
}

export { isDtsFile };
