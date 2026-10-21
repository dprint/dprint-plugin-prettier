// @nts-check
'use strict';

const Container = require('./container');
const Node = require('./node');

class StringNode extends Node {
  constructor (/** @type {any} */ opts) {
    super(opts);
    /** @type {string} */ this.type = 'string';
  }

  /** @returns {string} */ toString () {
    /** @type {string} */ let quote = this.quoted ? this.raws.quote : '';
    return [
      this.raws.before,
      quote,
      // we can't use String() here because it'll try using itself
      // as the constructor
      this.value + '',
      quote,
      this.raws.after
    ].join('');
  }
}

Container.registerWalker(StringNode);

module.exports = StringNode;
