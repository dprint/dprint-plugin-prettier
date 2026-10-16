// @nts-check
'use strict';

const Container = require('./container');

class FunctionNode extends Container {
  constructor (opts) {
    super(opts);
    /** @type {string} */ this.type = 'func';
    // start off at -1 so we know there haven't been any parens added
    /** @type {number} */ this.unbalanced = -1;
  }
};

Container.registerWalker(FunctionNode);

module.exports = FunctionNode;
