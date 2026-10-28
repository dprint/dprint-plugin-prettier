// @nts-check
'use strict'

let { dirname, relative, resolve, sep } = require('path')
let { SourceMapConsumer, SourceMapGenerator } = require('source-map-js')
let { pathToFileURL } = require('url')

let Input = require('./input')

/** @type {boolean} */ let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator)
/** @type {boolean} */ let pathAvailable = Boolean(dirname && resolve && relative && sep)

class MapGenerator {
  constructor(/** @type {any} */ stringify, /** @type {any} */ root, /** @type {any} */ opts, /** @type {string | undefined} */ cssString) {
    /** @type {any} */ this.stringify = stringify
    /** @type {any} */ this.mapOpts = opts.map || {}
    /** @type {any} */ this.root = root
    /** @type {any} */ this.opts = opts
    /** @type {string | undefined} */ this.css = cssString
    /** @type {string | undefined} */ this.originalCSS = cssString
    /** @type {any} */ this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute

    /** @type {Map<string, string>} */ this.memoizedFileURLs = new Map()
    /** @type {Map<string, string>} */ this.memoizedPaths = new Map()
    /** @type {Map<string, string>} */ this.memoizedURLs = new Map()
  }

  addAnnotation() {
    /** @type {string} */ let content

    if (this.isInline()) {
      content =
        'data:application/json;base64,' + this.toBase64(this.map.toString())
    } else if (typeof this.mapOpts.annotation === 'string') {
      content = this.mapOpts.annotation
    } else if (typeof this.mapOpts.annotation === 'function') {
      content = this.mapOpts.annotation(this.opts.to, this.root)
    } else {
      content = this.outputFile() + '.map'
    }
    /** @type {string} */ let eol = '\n'
    if (this.css.includes('\r\n')) eol = '\r\n'

    this.css += eol + '/*# sourceMappingURL=' + content + ' */'
  }

  applyPrevMaps() {
    for (let prev of this.previous()) {
      /** @type {string} */ let from = this.toUrl(this.path(prev.file))
      /** @type {string} */ let root = prev.root || dirname(prev.file)
      /** @type {any} */ let map

      if (this.mapOpts.sourcesContent === false) {
        map = new SourceMapConsumer(prev.text)
        if (map.sourcesContent) {
          map.sourcesContent = null
        }
      } else {
        map = prev.consumer()
      }

      this.map.applySourceMap(map, from, this.toUrl(this.path(root)))
    }
  }

  clearAnnotation() {
    if (this.mapOpts.annotation === false) return

    if (this.root) {
      /** @type {any} */ let node
      for (let i = this.root.nodes.length - 1; i >= 0; i--) {
        node = this.root.nodes[i]
        if (node.type !== 'comment') continue
        if (node.text.startsWith('# sourceMappingURL=')) {
          this.root.removeChild(i)
        }
      }
    } else if (this.css) {
      /** @type {number} */ let startIndex
      while ((startIndex = this.css.lastIndexOf('/*#')) !== -1) {
        let endIndex = this.css.indexOf('*/', startIndex + 3)
        if (endIndex === -1) break
        while (startIndex > 0 && this.css[startIndex - 1] === '\n') {
          startIndex--
        }
        this.css = this.css.slice(0, startIndex) + this.css.slice(endIndex + 2)
      }
    }
  }

  /** @returns {any[]} */ generate() {
    this.clearAnnotation()
    if (pathAvailable && sourceMapAvailable && this.isMap()) {
      return this.generateMap()
    } else {
      /** @type {string} */ let result = ''
      this.stringify(this.root, (/** @type {string} */ i) => {
        result += i
      })
      return [result]
    }
  }

  /** @returns {any[]} */ generateMap() {
    if (this.root) {
      this.generateString()
    } else if (this.previous().length === 1) {
      /** @type {any} */ let prev = this.previous()[0].consumer()
      prev.file = this.outputFile()
      /** @type {any} */ this.map = SourceMapGenerator.fromSourceMap(prev, {
        ignoreInvalidMapping: true
      })
    } else {
      this.map = new SourceMapGenerator({
        file: this.outputFile(),
        ignoreInvalidMapping: true
      })
      this.map.addMapping({
        generated: { column: 0, line: 1 },
        original: { column: 0, line: 1 },
        source: this.opts.from
          ? this.toUrl(this.path(this.opts.from))
          : '<no source>'
      })
    }

    if (this.isSourcesContent()) this.setSourcesContent()
    if (this.root && this.previous().length > 0) this.applyPrevMaps()
    if (this.isAnnotation()) this.addAnnotation()

    if (this.isInline()) {
      return [this.css]
    } else {
      return [this.css, this.map]
    }
  }

  generateString() {
    this.css = ''
    this.map = new SourceMapGenerator({
      file: this.outputFile(),
      ignoreInvalidMapping: true
    })

    /** @type {number} */ let line = 1
    /** @type {number} */ let column = 1

    /** @type {string} */ let noSource = '<no source>'
    /** @type {{ generated: { column: number, line: number }, original: { column: number, line: number }, source: string }} */ let mapping = {
      generated: { column: 0, line: 0 },
      original: { column: 0, line: 0 },
      source: ''
    }

    /** @type {number} */ let last
    /** @type {RegExpMatchArray | null} */ let lines
    this.stringify(this.root, (/** @type {string} */ str, /** @type {any} */ node, /** @type {string | undefined} */ type) => {
      this.css += str

      if (node && type !== 'end') {
        mapping.generated.line = line
        mapping.generated.column = column - 1
        if (node.source && node.source.start) {
          mapping.source = this.sourcePath(node)
          mapping.original.line = node.source.start.line
          mapping.original.column = node.source.start.column - 1
          this.map.addMapping(mapping)
        } else {
          mapping.source = noSource
          mapping.original.line = 1
          mapping.original.column = 0
          this.map.addMapping(mapping)
        }
      }

      lines = str.match(/\n/g)
      if (lines) {
        line += lines.length
        last = str.lastIndexOf('\n')
        column = str.length - last
      } else {
        column += str.length
      }

      if (node && type !== 'start') {
        /** @type {any} */ let p = node.parent || { raws: {} }
        /** @type {boolean} */ let childless =
          node.type === 'decl' || (node.type === 'atrule' && !node.nodes)
        if (!childless || node !== p.last || p.raws.semicolon) {
          if (node.source && node.source.end) {
            mapping.source = this.sourcePath(node)
            mapping.original.line = node.source.end.line
            mapping.original.column = node.source.end.column - 1
            mapping.generated.line = line
            mapping.generated.column = column - 2
            this.map.addMapping(mapping)
          } else {
            mapping.source = noSource
            mapping.original.line = 1
            mapping.original.column = 0
            mapping.generated.line = line
            mapping.generated.column = column - 1
            this.map.addMapping(mapping)
          }
        }
      }
    })
  }

  /** @returns {any} */ isAnnotation() {
    if (this.isInline()) {
      return true
    }
    if (typeof this.mapOpts.annotation !== 'undefined') {
      return this.mapOpts.annotation
    }
    if (this.previous().length) {
      return this.previous().some(/** @returns {boolean} */ i => i.annotation)
    }
    return true
  }

  /** @returns {any} */ isInline() {
    if (typeof this.mapOpts.inline !== 'undefined') {
      return this.mapOpts.inline
    }

    /** @type {any} */ let annotation = this.mapOpts.annotation
    if (typeof annotation !== 'undefined' && annotation !== true) {
      return false
    }

    if (this.previous().length) {
      return this.previous().some(/** @returns {boolean} */ i => i.inline)
    }
    return true
  }

  /** @returns {boolean} */ isMap() {
    if (typeof this.opts.map !== 'undefined') {
      return !!this.opts.map
    }
    return this.previous().length > 0
  }

  /** @returns {any} */ isSourcesContent() {
    if (typeof this.mapOpts.sourcesContent !== 'undefined') {
      return this.mapOpts.sourcesContent
    }
    if (this.previous().length) {
      return this.previous().some(/** @returns {boolean} */ i => i.withContent())
    }
    return true
  }

  /** @returns {string} */ outputFile() {
    if (this.opts.to) {
      return this.path(this.opts.to)
    } else if (this.opts.from) {
      return this.path(this.opts.from)
    } else {
      return 'to.css'
    }
  }

  /** @returns {string} */ path(/** @type {string} */ file) {
    if (this.mapOpts.absolute) return file
    if (file.charCodeAt(0) === 60 /* `<` */) return file
    if (/^\w+:\/\//.test(file)) return file
    /** @type {string | undefined} */ let cached = this.memoizedPaths.get(file)
    if (cached) return cached

    /** @type {string} */ let from = this.opts.to ? dirname(this.opts.to) : '.'

    if (typeof this.mapOpts.annotation === 'string') {
      from = dirname(resolve(from, this.mapOpts.annotation))
    }

    /** @type {string} */ let path = relative(from, file)
    this.memoizedPaths.set(file, path)

    return path
  }

  /** @returns {import("./previous-map")[]} */ previous() {
    if (!this.previousMaps) {
      /** @type {import("./previous-map")[]} */ this.previousMaps = []
      if (this.root) {
        this.root.walk((/** @type {import("./node")} */ node) => {
          if (node.source && node.source.input.map) {
            let map = node.source.input.map
            if (!this.previousMaps.includes(map)) {
              this.previousMaps.push(map)
            }
          }
        })
      } else {
        let input = new Input(this.originalCSS, this.opts)
        if (input.map) this.previousMaps.push(input.map)
      }
    }

    return this.previousMaps
  }

  setSourcesContent() {
    /** @type {Record<string, boolean>} */ let already = {}
    if (this.root) {
      this.root.walk((/** @type {import("./node")} */ node) => {
        if (node.source) {
          /** @type {string} */ let from = node.source.input.from
          if (from && !already[from]) {
            already[from] = true
            /** @type {string} */ let fromUrl = this.usesFileUrls
              ? this.toFileUrl(from)
              : this.toUrl(this.path(from))
            this.map.setSourceContent(fromUrl, node.source.input.css)
          }
        }
      })
    } else if (this.css) {
      /** @type {string} */ let from = this.opts.from
        ? this.toUrl(this.path(this.opts.from))
        : '<no source>'
      this.map.setSourceContent(from, this.css)
    }
  }

  /** @returns {string} */ sourcePath(/** @type {import("./node")} */ node) {
    if (this.mapOpts.from) {
      return this.toUrl(this.mapOpts.from)
    } else if (this.usesFileUrls) {
      return this.toFileUrl(node.source.input.from)
    } else {
      return this.toUrl(this.path(node.source.input.from))
    }
  }

  /** @returns {string} */ toBase64(/** @type {string} */ str) {
    if (Buffer) {
      return Buffer.from(str).toString('base64')
    } else {
      return window.btoa(unescape(encodeURIComponent(str)))
    }
  }

  /** @returns {string} */ toFileUrl(/** @type {string} */ path) {
    /** @type {string | undefined} */ let cached = this.memoizedFileURLs.get(path)
    if (cached) return cached

    if (pathToFileURL) {
      /** @type {string} */ let fileURL = pathToFileURL(path).toString()
      this.memoizedFileURLs.set(path, fileURL)

      return fileURL
    } else {
      throw new Error(
        '`map.absolute` option is not available in this PostCSS build'
      )
    }
  }

  /** @returns {string} */ toUrl(/** @type {string} */ path) {
    /** @type {string | undefined} */ let cached = this.memoizedURLs.get(path)
    if (cached) return cached

    if (sep === '\\') {
      path = path.replace(/\\/g, '/')
    }

    /** @type {string} */ let url = encodeURI(path).replace(/[#?]/g, encodeURIComponent)
    this.memoizedURLs.set(path, url)

    return url
  }
}

module.exports = MapGenerator
