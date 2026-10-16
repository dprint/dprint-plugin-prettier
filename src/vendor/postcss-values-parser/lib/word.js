// @nts-check
'use strict';

const Container = require('./container');
const Node = require('./node');

class Word extends Node {
  constructor (opts) {
    super(opts);
    /** @type {string} */ this.type = 'word';
  }
}

Container.registerWalker(Word);

module.exports = Word;
