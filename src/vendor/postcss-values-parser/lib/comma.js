// @nts-check
'use strict';

const Container = require('./container');
const Node = require('./node');

class Comma extends Node {
  constructor (opts) {
    super(opts);
    /** @type {string} */ this.type = 'comma';
  }
}

Container.registerWalker(Comma);

module.exports = Comma;
