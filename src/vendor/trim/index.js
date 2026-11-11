// @nts-check

exports = module.exports = trim;

/** @returns {string} */ function trim(/** @type {string | undefined} */ str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};
