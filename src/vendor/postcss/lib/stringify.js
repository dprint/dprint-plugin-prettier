// @nts-check
'use strict'

let Stringifier = require('./stringifier')

function stringify(/** @type {import("./node")} */ node, /** @type {import("./stringifier").Builder} */ builder) {
  let str = new Stringifier(builder)
  str.stringify(node)
}

module.exports = stringify
stringify.default = stringify
