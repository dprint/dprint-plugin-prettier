// @nts-check
'use strict';

const Container = require('./container');

module.exports = class Value extends Container {
  constructor (opts) {
    super(opts);
    /** @type {string} */ this.type = 'value';
    /** @type {number} */ this.unbalanced = 0;
  }
};
