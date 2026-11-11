// @nts-check
'use strict'

let { existsSync, readFileSync } = require('fs')
let { dirname, join } = require('path')
let { SourceMapConsumer, SourceMapGenerator } = require('source-map-js')

/** @returns {string} */ function fromBase64(/** @type {string} */ str) {
  if (Buffer) {
    return Buffer.from(str, 'base64').toString()
  } else {
    /* c8 ignore next 2 */
    return window.atob(str)
  }
}

class PreviousMap {
  constructor(/** @type {string} */ css, /** @type {any} */ opts) {
    if (opts.map === false) return
    if (opts.unsafeMap) /** @type {boolean | undefined} */ this.unsafeMap = true
    this.loadAnnotation(css)
    /** @type {boolean} */ this.inline = this.startWith(this.annotation, 'data:')

    /** @type {any} */ let prev = opts.map ? opts.map.prev : undefined
    /** @type {any} */ let text = this.loadMap(opts.from, prev)
    if (!this.mapFile && opts.from) {
      /** @type {string | undefined} */ this.mapFile = opts.from
    }
    if (this.mapFile) /** @type {string | undefined} */ this.root = dirname(this.mapFile)
    if (text) /** @type {string | undefined} */ this.text = text
  }

  /** @returns {any} */ consumer() {
    if (!this.consumerCache) {
      /** @type {any} */ this.consumerCache = new SourceMapConsumer(this.json || this.text)
    }
    return this.consumerCache
  }

  /** @returns {string} */ decodeInline(/** @type {string} */ text) {
    /** @type {RegExp} */ let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/
    /** @type {RegExp} */ let baseUri = /^data:application\/json;base64,/
    /** @type {RegExp} */ let charsetUri = /^data:application\/json;charset=utf-?8,/
    /** @type {RegExp} */ let uri = /^data:application\/json,/

    /** @type {RegExpMatchArray | null} */ let uriMatch = text.match(charsetUri) || text.match(uri)
    if (uriMatch) {
      return decodeURIComponent(text.substr(uriMatch[0].length))
    }

    /** @type {RegExpMatchArray | null} */ let baseUriMatch = text.match(baseCharsetUri) || text.match(baseUri)
    if (baseUriMatch) {
      return fromBase64(text.substr(baseUriMatch[0].length))
    }

    /** @type {string} */ let encoding = text.slice('data:application/json;'.length)
    encoding = encoding.slice(0, encoding.indexOf(','))
    throw new Error('Unsupported source map encoding ' + encoding)
  }

  /** @returns {string} */ getAnnotationURL(/** @type {string} */ sourceMapString) {
    return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, '').trim()
  }

  /** @returns {boolean} */ isMap(/** @type {any} */ map) {
    if (typeof map !== 'object') return false
    return (
      typeof map.mappings === 'string' ||
      typeof map._mappings === 'string' ||
      Array.isArray(map.sections)
    )
  }

  loadAnnotation(/** @type {string} */ css) {
    /** @type {RegExpMatchArray | null} */ let comments = css.match(/\/\*\s*# sourceMappingURL=/g)
    if (!comments) return

    // sourceMappingURLs from comments, strings, etc.
    /** @type {number} */ let start = css.lastIndexOf(comments.pop())
    /** @type {number} */ let end = css.indexOf('*/', start)

    if (start > -1 && end > -1) {
      // Locate the last sourceMappingURL to avoid pickin
      /** @type {string | undefined} */ this.annotation = this.getAnnotationURL(css.substring(start, end))
    }
  }

  /** @returns {string | undefined} */ loadFile(/** @type {string} */ path, /** @type {any} */ cssFile, /** @type {boolean} */ trusted) {
    /* c8 ignore next 5 */
    if (!trusted && !this.unsafeMap) {
      if (!/\.map$/i.test(path)) {
        return undefined
      }
    }
    this.root = dirname(path)
    if (existsSync(path)) {
      this.mapFile = path
      return readFileSync(path, 'utf-8').toString().trim()
    }
  }

  /** @returns {any} */ loadMap(/** @type {string | undefined} */ file, /** @type {any} */ prev) {
    if (prev === false) return false

    if (prev) {
      if (typeof prev === 'string') {
        return prev
      } else if (typeof prev === 'function') {
        /** @type {any} */ let prevPath = prev(file)
        if (prevPath) {
          /** @type {string | undefined} */ let map = this.loadFile(prevPath, file, true)
          if (!map) {
            throw new Error(
              'Unable to load previous source map: ' + prevPath.toString()
            )
          }
          return map
        }
      } else if (prev instanceof SourceMapConsumer) {
        return SourceMapGenerator.fromSourceMap(prev).toString()
      } else if (prev instanceof SourceMapGenerator) {
        return prev.toString()
      } else if (this.isMap(prev)) {
        return JSON.stringify(prev)
      } else {
        throw new Error(
          'Unsupported previous source map format: ' + prev.toString()
        )
      }
    } else if (this.inline) {
      return this.decodeInline(this.annotation)
    } else if (this.annotation) {
      /** @type {string} */ let map = this.annotation
      if (file) map = join(dirname(file), map)
      /** @type {string | undefined} */ let unknown = this.loadFile(map, file, false)
      if (unknown) {
        try {
          /* c8 ignore next 4 */
          /** @type {any} */ this.json = JSON.parse(unknown.replace(/^\)]}'[^\n]*\n/, ''))
        } catch {
          return undefined
        }
      }
      return unknown
    }
  }

  /** @returns {boolean} */ startWith(/** @type {string | undefined} */ string, /** @type {string} */ start) {
    if (!string) return false
    return string.substr(0, start.length) === start
  }

  /** @returns {boolean} */ withContent() {
    return !!(
      this.consumer().sourcesContent &&
      this.consumer().sourcesContent.length > 0
    )
  }
}

module.exports = PreviousMap
PreviousMap.default = PreviousMap
