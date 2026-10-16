// @nts-check
'use strict';

const Container = require('./container');
const Node = require('./node');

class Parenthesis extends Node {
  constructor (opts) {
    super(opts);
    /** @type {string} */ this.type = 'paren';
    /** @type {string} */ this.parenType = '';
  }
}

Container.registerWalker(Parenthesis);

module.exports = Parenthesis;
