// @nts-check
exports.isRemarkParser = isRemarkParser
exports.isRemarkCompiler = isRemarkCompiler

/** @returns {boolean} */ function isRemarkParser(parser) {
  return Boolean(parser && parser.prototype && parser.prototype.blockTokenizers)
}

/** @returns {boolean} */ function isRemarkCompiler(compiler) {
  return Boolean(compiler && compiler.prototype && compiler.prototype.visitors)
}
