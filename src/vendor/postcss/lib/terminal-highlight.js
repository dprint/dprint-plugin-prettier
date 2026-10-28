// @nts-check
'use strict'

let pico = require('picocolors')

let tokenizer = require('./tokenize')

/** @type {typeof import("./input")} */ let Input

function registerInput(/** @type {typeof import("./input")} */ dependant) {
  Input = dependant
}

/** @type {Record<string, (text: string) => string>} */ const HIGHLIGHT_THEME = {
  ';': pico.yellow,
  ':': pico.yellow,
  '(': pico.cyan,
  ')': pico.cyan,
  '[': pico.yellow,
  ']': pico.yellow,
  '{': pico.yellow,
  '}': pico.yellow,
  'at-word': pico.cyan,
  'brackets': pico.cyan,
  'call': pico.cyan,
  'class': pico.yellow,
  'comment': pico.gray,
  'hash': pico.magenta,
  'string': pico.green
}

/** @returns {string} */ function getTokenType(/** @type {[string, string, number?, number?]} */ [type, value], /** @type {import("./parser").Tokenizer} */ processor) {
  if (type === 'word') {
    if (value[0] === '.') {
      return 'class'
    }
    if (value[0] === '#') {
      return 'hash'
    }
  }

  if (!processor.endOfFile()) {
    /** @type {[string, string, number?, number?]} */ let next = processor.nextToken()
    processor.back(next)
    if (next[0] === 'brackets' || next[0] === '(') return 'call'
  }

  return type
}

/** @returns {string} */ function terminalHighlight(/** @type {string} */ css) {
  /** @type {import("./parser").Tokenizer} */ let processor = tokenizer(new Input(css), { ignoreErrors: true })
  /** @type {string} */ let result = ''
  while (!processor.endOfFile()) {
    /** @type {[string, string, number?, number?]} */ let token = processor.nextToken()
    /** @type {(text: string) => string} */ let color = HIGHLIGHT_THEME[getTokenType(token, processor)]
    if (color) {
      result += token[1]
        .split(/\r?\n/)
        .map(/** @returns {string} */ i => color(i))
        .join('\n')
    } else {
      result += token[1]
    }
  }
  return result
}

terminalHighlight.registerInput = registerInput

module.exports = terminalHighlight
