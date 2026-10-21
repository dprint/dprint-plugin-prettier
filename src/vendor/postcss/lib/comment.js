// @nts-check
'use strict'

let Node = require('./node')

/**
 * @property {boolean} [inline] given by postcss-less
 */
class Comment extends Node {
  constructor(defaults) {
    super(defaults)
    /** @type {string} */ this.type = 'comment'
  }
}

module.exports = Comment
Comment.default = Comment
