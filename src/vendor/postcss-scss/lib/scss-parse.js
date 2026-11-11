// @nts-check
let { Input } = require('postcss')

let ScssParser = require('./scss-parser')

module.exports = function scssParse(/** @type {string} */ scss, /** @type {any} */ opts) {
  let input = new Input(scss, opts)

  let parser = new ScssParser(input)
  parser.parse()

  return parser.root
}
