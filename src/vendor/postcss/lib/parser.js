// @nts-check
'use strict'

let AtRule = require('./at-rule')
let Comment = require('./comment')
let Declaration = require('./declaration')
let Root = require('./root')
let Rule = require('./rule')
let tokenizer = require('./tokenize')

/**
 * @typedef {{ back: (token: [string, string, number?, number?]) => void, endOfFile: () => boolean, nextToken: (opts?: any) => [string, string, number?, number?], position: () => number }} Tokenizer
 */

/** @type {Record<string, boolean>} */ const SAFE_COMMENT_NEIGHBOR = {
  empty: true,
  space: true
}

/** @returns {number} */ function findLastWithPosition(/** @type {[string, string, number?, number?][]} */ tokens) {
  for (let i = tokens.length - 1; i >= 0; i--) {
    let token = tokens[i]
    let pos = token[3] || token[2]
    if (pos) return pos
  }
}

/** @returns {string} */ function tokensToString(/** @type {[string, string, number?, number?][]} */ tokens, /** @type {number} */ from, /** @type {number} */ to) {
  /** @type {string} */ let result = ''
  for (let i = from; i < to; i++) result += tokens[i][1]
  return result
}

class Parser {
  constructor(/** @type {import("./input")} */ input) {
    /** @type {import("./input")} */ this.input = input

    /** @type {import("./root")} */ this.root = new Root()
    /** @type {import("./container")} */ this.current = this.root
    /** @type {string} */ this.spaces = ''
    /** @type {boolean} */ this.semicolon = false

    this.createTokenizer()
    this.root.source = { input, start: { column: 1, line: 1, offset: 0 } }
  }

  atrule(/** @type {[string, string, number?, number?]} */ token) {
    let node = new AtRule()
    node.name = token[1].slice(1)
    if (node.name === '') {
      this.unnamedAtrule(node, token)
    }
    this.init(node, token[2])

    /** @type {string} */ let type
    /** @type {[string, string, number?, number?]} */ let prev
    /** @type {number | undefined} */ let shift
    /** @type {boolean} */ let last = false
    /** @type {boolean} */ let open = false
    /** @type {[string, string, number?, number?][]} */ let params = []
    /** @type {string[]} */ let brackets = []

    while (!this.tokenizer.endOfFile()) {
      token = this.tokenizer.nextToken()
      type = token[0]

      if (type === '(' || type === '[') {
        brackets.push(type === '(' ? ')' : ']')
      } else if (type === '{' && brackets.length > 0) {
        brackets.push('}')
      } else if (type === brackets[brackets.length - 1]) {
        brackets.pop()
      }

      if (brackets.length === 0) {
        if (type === ';') {
          node.source.end = this.getPosition(token[2])
          node.source.end.offset++
          this.semicolon = true
          break
        } else if (type === '{') {
          open = true
          break
        } else if (type === '}') {
          if (params.length > 0) {
            shift = params.length - 1
            prev = params[shift]
            while (prev && prev[0] === 'space') {
              prev = params[--shift]
            }
            if (prev) {
              node.source.end = this.getPosition(prev[3] || prev[2])
              node.source.end.offset++
            }
          }
          this.end(token)
          break
        } else {
          params.push(token)
        }
      } else {
        params.push(token)
      }

      if (this.tokenizer.endOfFile()) {
        last = true
        break
      }
    }

    node.raws.between = this.spacesAndCommentsFromEnd(params)
    if (params.length) {
      node.raws.afterName = this.spacesAndCommentsFromStart(params)
      this.raw(node, 'params', params)
      if (last) {
        token = params[params.length - 1]
        node.source.end = this.getPosition(token[3] || token[2])
        node.source.end.offset++
        this.spaces = node.raws.between
        node.raws.between = ''
      }
    } else {
      node.raws.afterName = ''
      node.params = ''
    }

    if (open) {
      node.nodes = []
      this.current = node
    }
  }

  checkMissedSemicolon(/** @type {[string, string, number?, number?][]} */ tokens) {
    /** @type {boolean} */ let colon = this.colon(tokens)
    if (colon === false) return

    /** @type {number} */ let founded = 0
    /** @type {[string, string, number?, number?]} */ let token
    for (let j = colon - 1; j >= 0; j--) {
      token = tokens[j]
      if (token[0] !== 'space') {
        founded += 1
        if (founded === 2) break
      }
    }
    // If the token is a word, e.g. `!important`, `red` or any other valid
    // property's value. Then we need to return the colon after that word
    // token. [3] is the "end" colon of that word. And because we need it
    // after that one we do +1 to get the next one.
    throw this.input.error(
      'Missed semicolon',
      token[0] === 'word' ? token[3] + 1 : token[2]
    )
  }

  /** @returns {boolean} */ colon(/** @type {[string, string, number?, number?][]} */ tokens) {
    /** @type {number} */ let brackets = 0
    let /** @type {[string, string, number?, number?]} */ prev, /** @type {[string, string, number?, number?]} */ token, /** @type {string} */ type
    for (let [i, element] of tokens.entries()) {
      token = element
      type = token[0]

      if (type === '(') {
        brackets += 1
      }
      if (type === ')') {
        brackets -= 1
      }
      if (brackets === 0 && type === ':') {
        if (!prev) {
          this.doubleColon(token)
        } else if (prev[0] === 'word' && prev[1] === 'progid') {
          continue
        } else {
          return i
        }
      }

      prev = token
    }
    return false
  }

  comment(/** @type {[string, string, number?, number?]} */ token) {
    let node = new Comment()
    this.init(node, token[2])
    node.source.end = this.getPosition(token[3] || token[2])
    node.source.end.offset++

    /** @type {string} */ let text = token[1].slice(2, -2)
    if (!text.trim()) {
      node.text = ''
      node.raws.left = text
      node.raws.right = ''
    } else {
      let match = text.match(/^(\s*)([^]*\S)(\s*)$/)
      node.text = match[2]
      node.raws.left = match[1]
      node.raws.right = match[3]
    }
  }

  createTokenizer() {
    /** @type {Tokenizer} */ this.tokenizer = tokenizer(this.input)
  }

  decl(/** @type {[string, string, number?, number?][]} */ tokens, /** @type {boolean} */ customProperty) {
    let node = new Declaration()
    this.init(node, tokens[0][2])

    /** @type {[string, string, number?, number?]} */ let last = tokens[tokens.length - 1]
    if (last[0] === ';') {
      this.semicolon = true
      tokens.pop()
    }

    node.source.end = this.getPosition(
      last[3] || last[2] || findLastWithPosition(tokens)
    )
    node.source.end.offset++

    /** @type {number} */ let start = 0
    while (tokens[start][0] !== 'word') {
      if (start === tokens.length - 1) this.unknownWord([tokens[start]])
      start++
    }
    node.raws.before += tokensToString(tokens, 0, start)
    node.source.start = this.getPosition(tokens[start][2])

    /** @type {number} */ let propStart = start
    while (start < tokens.length) {
      let type = tokens[start][0]
      if (type === ':' || type === 'space' || type === 'comment') {
        break
      }
      start++
    }
    node.prop = tokensToString(tokens, propStart, start)

    /** @type {number} */ let betweenStart = start
    /** @type {[string, string, number?, number?]} */ let token
    while (start < tokens.length) {
      token = tokens[start]
      start++
      if (token[0] === ':') break
      if (token[0] === 'word' && /\w/.test(token[1])) {
        this.unknownWord([token])
      }
    }
    node.raws.between = tokensToString(tokens, betweenStart, start)

    if (node.prop[0] === '_' || node.prop[0] === '*') {
      node.raws.before += node.prop[0]
      node.prop = node.prop.slice(1)
    }

    /** @type {number} */ let firstSpacesStart = start
    while (start < tokens.length) {
      let next = tokens[start][0]
      if (next !== 'space' && next !== 'comment') break
      start++
    }
    /** @type {[string, string, number?, number?][]} */ let firstSpaces = tokens.slice(firstSpacesStart, start)

    tokens = tokens.slice(start)

    this.precheckMissedSemicolon(tokens)

    for (let i = tokens.length - 1; i >= 0; i--) {
      token = tokens[i]
      if (token[1].toLowerCase() === '!important') {
        node.important = true
        /** @type {string} */ let string = this.stringFrom(tokens, i)
        string = this.spacesFromEnd(tokens) + string
        if (string !== ' !important') node.raws.important = string
        break
      } else if (token[1].toLowerCase() === 'important') {
        /** @type {[string, string, number?, number?][]} */ let cache = tokens.slice(0)
        /** @type {string} */ let str = ''
        for (let j = i; j > 0; j--) {
          let type = cache[j][0]
          if (str.trim().startsWith('!') && type !== 'space') {
            break
          }
          str = cache.pop()[1] + str
        }
        if (str.trim().startsWith('!')) {
          node.important = true
          node.raws.important = str
          tokens = cache
        }
      }

      if (token[0] !== 'space' && token[0] !== 'comment') {
        break
      }
    }

    /** @type {boolean} */ let hasWord = tokens.some(/** @returns {boolean} */ i => i[0] !== 'space' && i[0] !== 'comment')

    if (hasWord) {
      node.raws.between += firstSpaces.map(/** @returns {string} */ i => i[1]).join('')
      firstSpaces = []
    }
    this.raw(node, 'value', firstSpaces.concat(tokens), customProperty)

    if (node.value.includes(':') && !customProperty) {
      this.checkMissedSemicolon(tokens)
    }
  }

  doubleColon(/** @type {[string, string, number?, number?]} */ token) {
    throw this.input.error(
      'Double colon',
      { offset: token[2] },
      { offset: token[2] + token[1].length }
    )
  }

  emptyRule(/** @type {[string, string, number?, number?]} */ token) {
    let node = new Rule()
    this.init(node, token[2])
    node.selector = ''
    node.raws.between = ''
    this.current = node
  }

  end(/** @type {[string, string, number?, number?]} */ token) {
    if (this.current.nodes && this.current.nodes.length) {
      this.current.raws.semicolon = this.semicolon
    }
    this.semicolon = false

    this.current.raws.after = (this.current.raws.after || '') + this.spaces
    this.spaces = ''

    if (this.current.parent) {
      this.current.source.end = this.getPosition(token[2])
      this.current.source.end.offset++
      this.current = this.current.parent
    } else {
      this.unexpectedClose(token)
    }
  }

  endFile() {
    if (this.current.parent) this.unclosedBlock()
    if (this.current.nodes && this.current.nodes.length) {
      this.current.raws.semicolon = this.semicolon
    }
    this.current.raws.after = (this.current.raws.after || '') + this.spaces
    this.root.source.end = this.getPosition(this.tokenizer.position())
  }

  freeSemicolon(/** @type {[string, string, number?, number?]} */ token) {
    this.spaces += token[1]
    if (this.current.nodes) {
      let prev = this.current.nodes[this.current.nodes.length - 1]
      if (prev && prev.type === 'rule' && !prev.raws.ownSemicolon) {
        prev.raws.ownSemicolon = this.spaces
        this.spaces = ''
        prev.source.end = this.getPosition(token[2])
        prev.source.end.offset += prev.raws.ownSemicolon.length
      }
    }
  }

  // Helpers

  getPosition(/** @type {number} */ offset) {
    let pos = this.input.fromOffset(offset)
    return {
      column: pos.col,
      line: pos.line,
      offset
    }
  }

  init(/** @type {import("./node")} */ node, /** @type {number} */ offset) {
    this.current.push(node)
    node.source = {
      input: this.input,
      start: this.getPosition(offset)
    }
    node.raws.before = this.spaces
    this.spaces = ''
    if (node.type !== 'comment') this.semicolon = false
  }

  other(/** @type {[string, string, number?, number?]} */ start) {
    /** @type {boolean} */ let end = false
    /** @type {string} */ let type = null
    /** @type {boolean} */ let colon = false
    /** @type {[string, string, number?, number?]} */ let bracket = null
    /** @type {string[]} */ let brackets = []
    /** @type {boolean} */ let customProperty = start[1].startsWith('--')

    /** @type {[string, string, number?, number?][]} */ let tokens = []
    /** @type {any} */ let token = start
    while (token) {
      type = token[0]
      tokens.push(token)

      if (type === '(' || type === '[') {
        if (!bracket) bracket = token
        brackets.push(type === '(' ? ')' : ']')
      } else if (customProperty && colon && type === '{') {
        if (!bracket) bracket = token
        brackets.push('}')
      } else if (brackets.length === 0) {
        if (type === ';') {
          if (colon) {
            this.decl(tokens, customProperty)
            return
          } else {
            break
          }
        } else if (type === '{') {
          this.rule(tokens)
          return
        } else if (type === '}') {
          this.tokenizer.back(tokens.pop())
          end = true
          break
        } else if (type === ':') {
          colon = true
        }
      } else if (type === brackets[brackets.length - 1]) {
        brackets.pop()
        if (brackets.length === 0) bracket = null
      }

      token = this.tokenizer.nextToken()
    }

    if (this.tokenizer.endOfFile()) end = true
    if (brackets.length > 0) this.unclosedBracket(bracket)

    if (end && colon) {
      if (!customProperty) {
        while (tokens.length) {
          token = tokens[tokens.length - 1][0]
          if (token !== 'space' && token !== 'comment') break
          this.tokenizer.back(tokens.pop())
        }
      }
      this.decl(tokens, customProperty)
    } else {
      this.unknownWord(tokens)
    }
  }

  parse() {
    /** @type {[string, string, number?, number?]} */ let token
    while (!this.tokenizer.endOfFile()) {
      token = this.tokenizer.nextToken()

      switch (token[0]) {
        case 'space':
          this.spaces += token[1]
          break

        case ';':
          this.freeSemicolon(token)
          break

        case '}':
          this.end(token)
          break

        case 'comment':
          this.comment(token)
          break

        case 'at-word':
          this.atrule(token)
          break

        case '{':
          this.emptyRule(token)
          break

        default:
          this.other(token)
          break
      }
    }
    this.endFile()
  }

  precheckMissedSemicolon(/* tokens */) {
    // Hook for Safe Parser
  }

  raw(/** @type {import("./node")} */ node, /** @type {string} */ prop, /** @type {[string, string, number?, number?][]} */ tokens, /** @type {boolean} */ customProperty) {
    let /** @type {[string, string, number?, number?]} */ token, /** @type {string} */ type
    /** @type {number} */ let length = tokens.length
    /** @type {string} */ let value = ''
    /** @type {boolean} */ let clean = true
    let /** @type {string} */ next, /** @type {string} */ prev

    for (let i = 0; i < length; i += 1) {
      token = tokens[i]
      type = token[0]
      if (type === 'space' && i === length - 1 && !customProperty) {
        clean = false
      } else if (type === 'comment') {
        prev = tokens[i - 1] ? tokens[i - 1][0] : 'empty'
        next = tokens[i + 1] ? tokens[i + 1][0] : 'empty'
        if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) {
          if (value.slice(-1) === ',') {
            clean = false
          } else {
            value += token[1]
          }
        } else {
          clean = false
        }
      } else {
        value += token[1]
      }
    }
    if (!clean) {
      /** @type {string} */ let raw = tokens.reduce(/** @returns {string} */ (/** @type {string} */ all, i) => all + i[1], '')
      node.raws[prop] = { raw, value }
    }
    node[prop] = value
  }

  rule(/** @type {[string, string, number?, number?][]} */ tokens) {
    tokens.pop()

    let node = new Rule()
    this.init(node, tokens[0][2])

    node.raws.between = this.spacesAndCommentsFromEnd(tokens)
    this.raw(node, 'selector', tokens)
    this.current = node
  }

  /** @returns {string} */ spacesAndCommentsFromEnd(/** @type {[string, string, number?, number?][]} */ tokens) {
    /** @type {string} */ let lastTokenType
    /** @type {string} */ let spaces = ''
    while (tokens.length) {
      lastTokenType = tokens[tokens.length - 1][0]
      if (lastTokenType !== 'space' && lastTokenType !== 'comment') break
      spaces = tokens.pop()[1] + spaces
    }
    return spaces
  }

  // Errors

  /** @returns {string} */ spacesAndCommentsFromStart(/** @type {[string, string, number?, number?][]} */ tokens) {
    /** @type {string} */ let next
    /** @type {string} */ let spaces = ''
    while (tokens.length) {
      next = tokens[0][0]
      if (next !== 'space' && next !== 'comment') break
      spaces += tokens.shift()[1]
    }
    return spaces
  }

  /** @returns {string} */ spacesFromEnd(/** @type {[string, string, number?, number?][]} */ tokens) {
    /** @type {string} */ let lastTokenType
    /** @type {string} */ let spaces = ''
    while (tokens.length) {
      lastTokenType = tokens[tokens.length - 1][0]
      if (lastTokenType !== 'space') break
      spaces = tokens.pop()[1] + spaces
    }
    return spaces
  }

  /** @returns {string} */ stringFrom(/** @type {[string, string, number?, number?][]} */ tokens, /** @type {number} */ from) {
    /** @type {string} */ let result = ''
    for (let i = from; i < tokens.length; i++) {
      result += tokens[i][1]
    }
    tokens.splice(from, tokens.length - from)
    return result
  }

  unclosedBlock() {
    let pos = this.current.source.start
    throw this.input.error('Unclosed block', pos.line, pos.column)
  }

  unclosedBracket(/** @type {[string, string, number?, number?]} */ bracket) {
    throw this.input.error(
      'Unclosed bracket',
      { offset: bracket[2] },
      { offset: bracket[2] + 1 }
    )
  }

  unexpectedClose(/** @type {[string, string, number?, number?]} */ token) {
    throw this.input.error(
      'Unexpected }',
      { offset: token[2] },
      { offset: token[2] + 1 }
    )
  }

  unknownWord(/** @type {[string, string, number?, number?][]} */ tokens) {
    throw this.input.error(
      'Unknown word ' + tokens[0][1],
      { offset: tokens[0][2] },
      { offset: tokens[0][2] + tokens[0][1].length }
    )
  }

  unnamedAtrule(/** @type {import("./node")} */ node, /** @type {[string, string, number?, number?]} */ token) {
    throw this.input.error(
      'At-rule without name',
      { offset: token[2] },
      { offset: token[2] + token[1].length }
    )
  }
}

module.exports = Parser
