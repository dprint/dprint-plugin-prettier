// @nts-check
module.exports = /** @returns {any[]} */ function (/** @type {string} */ ary, /** @type {string} */ item) {
  var i = -1, indexes = []
  while((i = ary.indexOf(item, i + 1)) !== -1)
    indexes.push(i)
  return indexes
}
