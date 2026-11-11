// @nts-check
'use strict';

const Container = require('./container');
const Node = require('./node');

class UnicodeRange extends Node {
  constructor (/** @type {any} */ opts) {
    super(opts);
    /** @type {string} */ this.type = 'unicode-range';
  }
}

Container.registerWalker(UnicodeRange);

module.exports = UnicodeRange;
