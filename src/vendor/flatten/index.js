// @nts-check
module.exports = /** @returns {any[]} */ function flatten(/** @type {any[]} */ list, /** @type {number | undefined} */ depth) {
  depth = (typeof depth == 'number') ? depth : Infinity;

  if (!depth) {
    if (Array.isArray(list)) {
      return list.map(function(i) { return i; });
    }
    return list;
  }

  return _flatten(list, 1);

  /** @returns {any[]} */ function _flatten(/** @type {any[]} */ list, /** @type {number} */ d) {
    return list.reduce(/** @returns {any[]} */ function (acc, item) {
      if (Array.isArray(item) && d < depth) {
        return acc.concat(_flatten(item, d + 1));
      }
      else {
        return acc.concat(item);
      }
    }, []);
  }
};
