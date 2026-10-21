// @nts-check
import { assertNever, assign, dict } from "@glimmer/util";

import { parseWithoutProcessing, parse } from "@handlebars/parser";

import { EntityParser, EventedTokenizer, HTML5NamedCharRefs } from "simple-html-tokenizer";

import { DEBUG } from "@glimmer/env";

import { SexpOpcodes } from "@glimmer/wire-format";

const ATTR_VALUE_REGEX_TEST = /["\x26\xa0]/u, ATTR_VALUE_REGEX_REPLACE = new RegExp(ATTR_VALUE_REGEX_TEST.source, "gu"), TEXT_REGEX_TEST = /[&<>\xa0]/u, TEXT_REGEX_REPLACE = new RegExp(TEXT_REGEX_TEST.source, "gu");

// \x26 is ampersand, \xa0 is non-breaking space
function attrValueReplacer(char) {
    switch (char.charCodeAt(0)) {
      case 160:
        return "&nbsp;";

      case 34:
        return "&quot;";

      case 38:
        return "&amp;";

      default:
        return char;
    }
}

function textReplacer(char) {
    switch (char.charCodeAt(0)) {
      case 160:
        return "&nbsp;";

      case 38:
        return "&amp;";

      case 60:
        return "&lt;";

      case 62:
        return "&gt;";

      default:
        return char;
    }
}

function escapeAttrValue(attrValue) {
    return ATTR_VALUE_REGEX_TEST.test(attrValue) ? attrValue.replace(ATTR_VALUE_REGEX_REPLACE, attrValueReplacer) : attrValue;
}

function sortByLoc(a, b) {
    // If either is invisible, don't try to order them
    return a.loc.isInvisible || b.loc.isInvisible ? 0 : a.loc.startPosition.line < b.loc.startPosition.line || a.loc.startPosition.line === b.loc.startPosition.line && a.loc.startPosition.column < b.loc.startPosition.column ? -1 : a.loc.startPosition.line === b.loc.startPosition.line && a.loc.startPosition.column === b.loc.startPosition.column ? 0 : 1;
}

const voidMap = new Set([ "area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr" ]);

/** @returns {any[]} */ function getVoidTags() {
    return [ ...voidMap ];
}

const NON_WHITESPACE = /^\S/u;

/**
 * Examples when true:
 *  - link
 *  - liNK
 *
 * Examples when false:
 *  - Link (component)
 */ function isVoidTag(tag) {
    return voidMap.has(tag.toLowerCase()) && tag[0]?.toLowerCase() === tag[0];
}

class Printer {
    constructor(options) {
        this.buffer = "", this.options = options;
    }
    /*
    This is used by _all_ methods on this Printer class that add to `this.buffer`,
    it allows consumers of the printer to use alternate string representations for
    a given node.

    The primary use case for this are things like source -> source codemod utilities.
    For example, ember-template-recast attempts to always preserve the original string
    formatting in each AST node if no modifications are made to it.
  */    handledByOverride(node, ensureLeadingWhitespace = !1) {
        if (void 0 !== this.options.override) {
            let result = this.options.override(node, this.options);
            if ("string" == typeof result) return ensureLeadingWhitespace && NON_WHITESPACE.test(result) && (result = ` ${result}`), 
            this.buffer += result, !0;
        }
        return !1;
    }
    Node(node) {
        switch (node.type) {
          case "MustacheStatement":
          case "BlockStatement":
          case "MustacheCommentStatement":
          case "CommentStatement":
          case "TextNode":
          case "ElementNode":
          case "AttrNode":
          case "Block":
          case "Template":
            return this.TopLevelStatement(node);

          case "StringLiteral":
          case "BooleanLiteral":
          case "NumberLiteral":
          case "UndefinedLiteral":
          case "NullLiteral":
          case "PathExpression":
          case "SubExpression":
            return this.Expression(node);

          case "ConcatStatement":
            // should have an AttrNode parent
            return this.ConcatStatement(node);

          case "Hash":
            return this.Hash(node);

          case "HashPair":
            return this.HashPair(node);

          case "ElementModifierStatement":
            return this.ElementModifierStatement(node);
        }
    }
    Expression(expression) {
        switch (expression.type) {
          case "StringLiteral":
          case "BooleanLiteral":
          case "NumberLiteral":
          case "UndefinedLiteral":
          case "NullLiteral":
            return this.Literal(expression);

          case "PathExpression":
            return this.PathExpression(expression);

          case "SubExpression":
            return this.SubExpression(expression);
        }
    }
    Literal(literal) {
        switch (literal.type) {
          case "StringLiteral":
            return this.StringLiteral(literal);

          case "BooleanLiteral":
            return this.BooleanLiteral(literal);

          case "NumberLiteral":
            return this.NumberLiteral(literal);

          case "UndefinedLiteral":
            return this.UndefinedLiteral(literal);

          case "NullLiteral":
            return this.NullLiteral(literal);
        }
    }
    TopLevelStatement(statement) {
        switch (statement.type) {
          case "MustacheStatement":
            return this.MustacheStatement(statement);

          case "BlockStatement":
            return this.BlockStatement(statement);

          case "MustacheCommentStatement":
            return this.MustacheCommentStatement(statement);

          case "CommentStatement":
            return this.CommentStatement(statement);

          case "TextNode":
            return this.TextNode(statement);

          case "ElementNode":
            return this.ElementNode(statement);

          case "Block":
            return this.Block(statement);

          case "Template":
            return this.Template(statement);

          case "AttrNode":
            // should have element
            return this.AttrNode(statement);
        }
    }
    Template(template) {
        this.TopLevelStatements(template.body);
    }
    Block(block) {
        /*
      When processing a template like:

      ```hbs
      {{#if whatever}}
        whatever
      {{else if somethingElse}}
        something else
      {{else}}
        fallback
      {{/if}}
      ```

      The AST still _effectively_ looks like:

      ```hbs
      {{#if whatever}}
        whatever
      {{else}}{{#if somethingElse}}
        something else
      {{else}}
        fallback
      {{/if}}{{/if}}
      ```

      The only way we can tell if that is the case is by checking for
      `block.chained`, but unfortunately when the actual statements are
      processed the `block.body[0]` node (which will always be a
      `BlockStatement`) has no clue that its ancestor `Block` node was
      chained.

      This "forwards" the `chained` setting so that we can check
      it later when processing the `BlockStatement`.
    */
        block.chained && (block.body[0].chained = !0), this.handledByOverride(block) || this.TopLevelStatements(block.body);
    }
    TopLevelStatements(statements) {
        statements.forEach((statement => this.TopLevelStatement(statement)));
    }
    ElementNode(el) {
        this.handledByOverride(el) || (this.OpenElementNode(el), this.TopLevelStatements(el.children), 
        this.CloseElementNode(el));
    }
    OpenElementNode(el) {
        this.buffer += `<${el.tag}`;
        const parts = [ ...el.attributes, ...el.modifiers, ...el.comments ].sort(sortByLoc);
        for (const part of parts) switch (this.buffer += " ", part.type) {
          case "AttrNode":
            this.AttrNode(part);
            break;

          case "ElementModifierStatement":
            this.ElementModifierStatement(part);
            break;

          case "MustacheCommentStatement":
            this.MustacheCommentStatement(part);
        }
        el.blockParams.length && this.BlockParams(el.blockParams), el.selfClosing && (this.buffer += " /"), 
        this.buffer += ">";
    }
    CloseElementNode(el) {
        el.selfClosing || isVoidTag(el.tag) || (this.buffer += `</${el.tag}>`);
    }
    AttrNode(attr) {
        if (this.handledByOverride(attr)) return;
        let {name: name, value: value} = attr;
        this.buffer += name, !name.startsWith("@") && "TextNode" == value.type && 0 === value.chars.length || (this.buffer += "=", 
        this.AttrNodeValue(value));
    }
    AttrNodeValue(value) {
        if ("TextNode" === value.type) {
            let quote = '"';
            "raw" === this.options.entityEncoding && value.chars.includes('"') && !value.chars.includes("'") && (quote = "'"), 
            this.buffer += quote, this.TextNode(value, quote), this.buffer += quote;
        } else this.Node(value);
    }
    TextNode(text, isInAttr) {
        this.handledByOverride(text) || ("raw" === this.options.entityEncoding ? isInAttr && text.chars.includes(isInAttr) ? this.buffer += escapeAttrValue(text.chars) : this.buffer += text.chars : this.buffer += isInAttr ? escapeAttrValue(text.chars) : function(text) {
            return TEXT_REGEX_TEST.test(text) ? text.replace(TEXT_REGEX_REPLACE, textReplacer) : text;
        }(text.chars));
    }
    MustacheStatement(mustache) {
        this.handledByOverride(mustache) || (this.buffer += mustache.trusting ? "{{{" : "{{", 
        mustache.strip.open && (this.buffer += "~"), this.Expression(mustache.path), this.Params(mustache.params), 
        this.Hash(mustache.hash), mustache.strip.close && (this.buffer += "~"), this.buffer += mustache.trusting ? "}}}" : "}}");
    }
    BlockStatement(block) {
        this.handledByOverride(block) || (block.chained ? (this.buffer += block.inverseStrip.open ? "{{~" : "{{", 
        this.buffer += "else ") : this.buffer += block.openStrip.open ? "{{~#" : "{{#", 
        this.Expression(block.path), this.Params(block.params), this.Hash(block.hash), block.program.blockParams.length && this.BlockParams(block.program.blockParams), 
        block.chained ? this.buffer += block.inverseStrip.close ? "~}}" : "}}" : this.buffer += block.openStrip.close ? "~}}" : "}}", 
        this.Block(block.program), block.inverse && (block.inverse.chained || (this.buffer += block.inverseStrip.open ? "{{~" : "{{", 
        this.buffer += "else", this.buffer += block.inverseStrip.close ? "~}}" : "}}"), 
        this.Block(block.inverse)), block.chained || (this.buffer += block.closeStrip.open ? "{{~/" : "{{/", 
        this.Expression(block.path), this.buffer += block.closeStrip.close ? "~}}" : "}}"));
    }
    BlockParams(blockParams) {
        this.buffer += ` as |${blockParams.join(" ")}|`;
    }
    ConcatStatement(concat) {
        this.handledByOverride(concat) || (this.buffer += '"', concat.parts.forEach((part => {
            "TextNode" === part.type ? this.TextNode(part, '"') : this.Node(part);
        })), this.buffer += '"');
    }
    MustacheCommentStatement(comment) {
        this.handledByOverride(comment) || (this.buffer += `{{!--${comment.value}--}}`);
    }
    ElementModifierStatement(mod) {
        this.handledByOverride(mod) || (this.buffer += "{{", this.Expression(mod.path), 
        this.Params(mod.params), this.Hash(mod.hash), this.buffer += "}}");
    }
    CommentStatement(comment) {
        this.handledByOverride(comment) || (this.buffer += `\x3c!--${comment.value}--\x3e`);
    }
    PathExpression(path) {
        this.handledByOverride(path) || (this.buffer += path.original);
    }
    SubExpression(sexp) {
        this.handledByOverride(sexp) || (this.buffer += "(", this.Expression(sexp.path), 
        this.Params(sexp.params), this.Hash(sexp.hash), this.buffer += ")");
    }
    Params(params) {
        // TODO: implement a top level Params AST node (just like the Hash object)
        // so that this can also be overridden
        params.length && params.forEach((param => {
            this.buffer += " ", this.Expression(param);
        }));
    }
    Hash(hash) {
        this.handledByOverride(hash, !0) || hash.pairs.forEach((pair => {
            this.buffer += " ", this.HashPair(pair);
        }));
    }
    HashPair(pair) {
        this.handledByOverride(pair) || (this.buffer += pair.key, this.buffer += "=", this.Node(pair.value));
    }
    StringLiteral(str) {
        this.handledByOverride(str) || (this.buffer += JSON.stringify(str.value));
    }
    BooleanLiteral(bool) {
        this.handledByOverride(bool) || (this.buffer += String(bool.value));
    }
    NumberLiteral(number) {
        this.handledByOverride(number) || (this.buffer += String(number.value));
    }
    UndefinedLiteral(node) {
        this.handledByOverride(node) || (this.buffer += "undefined");
    }
    NullLiteral(node) {
        this.handledByOverride(node) || (this.buffer += "null");
    }
    print(node) {
        let {options: options} = this;
        if (options.override) {
            let result = options.override(node, options);
            if (void 0 !== result) return result;
        }
        return this.buffer = "", this.Node(node), this.buffer;
    }
}

function build(ast, options = {
    entityEncoding: "transformed"
}) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- JS users
    return ast ? new Printer(options).print(ast) : "";
}

function isKeyword(word, type) {
    return word in KEYWORDS_TYPES && (void 0 === type || KEYWORDS_TYPES[word].includes(type));
}

/**
 * This includes the full list of keywords currently in use in the template
 * language, and where their valid usages are.
 */ const KEYWORDS_TYPES = {
    action: [ "Call", "Modifier" ],
    component: [ "Call", "Append", "Block" ],
    debugger: [ "Append" ],
    "each-in": [ "Block" ],
    each: [ "Block" ],
    "has-block-params": [ "Call", "Append" ],
    "has-block": [ "Call", "Append" ],
    helper: [ "Call", "Append" ],
    if: [ "Call", "Append", "Block" ],
    "in-element": [ "Block" ],
    let: [ "Block" ],
    log: [ "Call", "Append" ],
    modifier: [ "Call", "Modifier" ],
    mount: [ "Append" ],
    mut: [ "Call", "Append" ],
    outlet: [ "Append" ],
    readonly: [ "Call", "Append" ],
    unbound: [ "Call", "Append" ],
    unless: [ "Call", "Append", "Block" ],
    yield: [ "Append" ]
};

// import Logger from './logger';
/** @returns {boolean} */ function isPresentArray(/** @type {any[]} */ list) {
    return !!list && list.length > 0;
}

function getLast(/** @type {any[]} */ list) {
    return 0 === list.length ? void 0 : list[list.length - 1];
}

function getFirst(/** @type {any[]} */ list) {
    return 0 === list.length ? void 0 : list[0];
}

/**
@typedef {{ line: number, column: number }} SourcePosition
@typedef {{ start: HbsPosition, end: HbsPosition }} HbsPositions
@typedef {{ start: CharPosition, end: CharPosition }} CharPositions
*/

const UNKNOWN_POSITION = Object.freeze({
    line: 1,
    column: 0
}), SYNTHETIC_LOCATION = Object.freeze({
    source: "(synthetic)",
    start: UNKNOWN_POSITION,
    end: UNKNOWN_POSITION
}), NON_EXISTENT_LOCATION = Object.freeze({
    source: "(nonexistent)",
    start: UNKNOWN_POSITION,
    end: UNKNOWN_POSITION
}), BROKEN_LOCATION = Object.freeze({
    source: "(broken)",
    start: UNKNOWN_POSITION,
    end: UNKNOWN_POSITION
});

class WhenList {
    constructor(/** @type {any[]} */ whens) {
        /** @type {any[]} */ this._whens = whens;
    }
    first(/** @type {string} */ kind) {
        for (const when of this._whens) {
            const value = when.match(kind);
            if (isPresentArray(value)) return value[0];
        }
        return null;
    }
}

class When {
    /** @returns {When} */ get(/** @type {string} */ pattern, or) {
        let value = this._map.get(pattern);
        return value || (value = or(), this._map.set(pattern, value), value);
    }
    add(/** @type {string} */ pattern, out) {
        this._map.set(pattern, out);
    }
    /** @returns {any[]} */ match(/** @type {string} */ kind) {
        const pattern = /** @returns {string} */ function(/** @type {string} */ kind) {
            switch (kind) {
              case "Broken":
              case "InternalsSynthetic":
              case "NonExistent":
                return "IS_INVISIBLE";

              default:
                return kind;
            }
        }(kind), out = [], exact = this._map.get(pattern), fallback = this._map.get("MATCH_ANY");
        return exact && out.push(exact), fallback && out.push(fallback), out;
    }
    constructor() {
        this._map = new Map;
    }
}

function match(callback) {
    return callback(new Matcher).validate();
}

class Matcher {
    /**
   * You didn't exhaustively match all possibilities.
   */
    validate() {
        return /** @returns {SourceSpan} */ (left, right) => this.matchFor(left.kind, right.kind)(left, right);
    }
    matchFor(/** @type {string} */ left, /** @type {string} */ right) {
        const nesteds = this._whens.match(left);
        return isPresentArray(nesteds), new WhenList(nesteds).first(right);
    }
    /** @returns {Matcher} */ when(/** @type {string} */ left, /** @type {string} */ right, // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback) {
        return this._whens.get(left, (/** @returns {When} */ () => new When)).add(right, callback), this;
    }
    constructor() {
        /** @type {When} */ this._whens = new When;
    }
}

class SourceSlice {
    static synthetic(chars) {
        let offsets = SourceSpan.synthetic(chars);
        return new SourceSlice({
            loc: offsets,
            chars: chars
        });
    }
    static load(source, slice) {
        return new SourceSlice({
            loc: SourceSpan.load(source, slice[1]),
            chars: slice[0]
        });
    }
    constructor(options) {
        this.loc = options.loc, this.chars = options.chars;
    }
    getString() {
        return this.chars;
    }
    serialize() {
        return [ this.chars, this.loc.serialize() ];
    }
}

/**
 * A `SourceSpan` object represents a span of characters inside of a template source.
 *
 * There are three kinds of `SourceSpan` objects:
 *
 * - `ConcreteSourceSpan`, which contains byte offsets
 * - `LazySourceSpan`, which contains `SourceLocation`s from the Handlebars AST, which can be
 *   converted to byte offsets on demand.
 * - `InvisibleSourceSpan`, which represent source strings that aren't present in the source,
 *   because:
 *     - they were created synthetically
 *     - their location is nonsensical (the span is broken)
 *     - they represent nothing in the source (this currently happens only when a bug in the
 *       upstream Handlebars parser fails to assign a location to empty blocks)
 *
 * At a high level, all `SourceSpan` objects provide:
 *
 * - byte offsets
 * - source in column and line format
 *
 * And you can do these operations on `SourceSpan`s:
 *
 * - collapse it to a `SourceSpan` representing its starting or ending position
 * - slice out some characters, optionally skipping some characters at the beginning or end
 * - create a new `SourceSpan` with a different starting or ending offset
 *
 * All SourceSpan objects implement `SourceLocation`, for compatibility. All SourceSpan
 * objects have a `toJSON` that emits `SourceLocation`, also for compatibility.
 *
 * For compatibility, subclasses of `AbstractSourceSpan` must implement `locDidUpdate`, which
 * happens when an AST plugin attempts to modify the `start` or `end` of a span directly.
 *
 * The goal is to avoid creating any problems for use-cases like AST Explorer.
 */ class SourceSpan {
    static get NON_EXISTENT() {
        return new InvisibleSpan("NonExistent", NON_EXISTENT_LOCATION).wrap();
    }
    static load(source, serialized) {
        return "number" == typeof serialized ? SourceSpan.forCharPositions(source, serialized, serialized) : "string" == typeof serialized ? SourceSpan.synthetic(serialized) : Array.isArray(serialized) ? SourceSpan.forCharPositions(source, serialized[0], serialized[1]) : "NonExistent" === serialized ? SourceSpan.NON_EXISTENT : "Broken" === serialized ? SourceSpan.broken(BROKEN_LOCATION) : void assertNever(serialized);
    }
    /** @returns {SourceSpan} */ static forHbsLoc(/** @type {Source} */ source, loc) {
        const start = new HbsPosition(source, loc.start), end = new HbsPosition(source, loc.end);
        return new HbsSpan(source, {
            start: start,
            end: end
        }, loc).wrap();
    }
    /** @returns {SourceSpan} */ static forCharPositions(/** @type {Source} */ source, /** @type {number} */ startPos, /** @type {number} */ endPos) {
        const start = new CharPosition(source, startPos), end = new CharPosition(source, endPos);
        return new CharPositionSpan(source, {
            start: start,
            end: end
        }).wrap();
    }
    static synthetic(chars) {
        return new InvisibleSpan("InternalsSynthetic", NON_EXISTENT_LOCATION, chars).wrap();
    }
    /** @returns {SourceSpan} */ static broken(pos = BROKEN_LOCATION) {
        return new InvisibleSpan("Broken", pos).wrap();
    }
    constructor(data) {
        var kind;
        /**
 * This file implements the DSL used by span and offset in places where they need to exhaustively
 * consider all combinations of states (Handlebars offsets, character offsets and invisible/broken
 * offsets).
 *
 * It's probably overkill, but it makes the code that uses it clear. It could be refactored or
 * removed.
 */        this.data = data, this.isInvisible = "CharPosition" !== (kind = data.kind) && "HbsPosition" !== kind;
    }
    /** @returns {SourceOffset} */ getStart() {
        return this.data.getStart().wrap();
    }
    /** @returns {SourceOffset} */ getEnd() {
        return this.data.getEnd().wrap();
    }
    get loc() {
        const span = this.data.toHbsSpan();
        return null === span ? BROKEN_LOCATION : span.toHbsLoc();
    }
    /** @returns {string} */ get module() {
        return this.data.getModule();
    }
    /**
   * Get the starting `SourcePosition` for this `SourceSpan`, lazily computing it if needed.
   */    get startPosition() {
        return this.loc.start;
    }
    /**
   * Get the ending `SourcePosition` for this `SourceSpan`, lazily computing it if needed.
   */    get endPosition() {
        return this.loc.end;
    }
    /**
   * Support converting ASTv1 nodes into a serialized format using JSON.stringify.
   */    toJSON() {
        return this.loc;
    }
    /**
   * Create a new span with the current span's end and a new beginning.
   */    withStart(other) {
        return span(other.data, this.data.getEnd());
    }
    /**
   * Create a new span with the current span's beginning and a new ending.
   * @returns {SourceSpan}
   */    withEnd(/** @type {SourceOffset} */ other) {
        return span(this.data.getStart(), other.data);
    }
    /** @returns {string} */ asString() {
        return this.data.asString();
    }
    /**
   * Convert this `SourceSpan` into a `SourceSlice`.
   */    toSlice(expected) {
        const chars = this.data.asString();
        return JSON.stringify(chars), JSON.stringify(expected), new SourceSlice({
            loc: this,
            chars: expected || chars
        });
    }
    /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use startPosition instead
   */    get start() {
        return this.loc.start;
    }
    /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use withStart instead
   */    set start(position) {
        this.data.locDidUpdate({
            start: position
        });
    }
    /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use endPosition instead
   */    get end() {
        return this.loc.end;
    }
    /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use withEnd instead
   */    set end(position) {
        this.data.locDidUpdate({
            end: position
        });
    }
    /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use module instead
   */    get source() {
        return this.module;
    }
    /** @returns {SourceSpan} */ collapse(/** @type {string} */ where) {
        switch (where) {
          case "start":
            return this.getStart().collapsed();

          case "end":
            return this.getEnd().collapsed();
        }
    }
    /** @returns {SourceSpan} */ extend(/** @type {SourceSpan} */ other) {
        return span(this.data.getStart(), other.data.getEnd());
    }
    serialize() {
        return this.data.serialize();
    }
    slice({skipStart: skipStart = 0, skipEnd: skipEnd = 0}) {
        return span(this.getStart().move(skipStart).data, this.getEnd().move(-skipEnd).data);
    }
    /** @returns {SourceSpan} */ sliceStartChars({skipStart: skipStart = 0, chars: chars}) {
        return span(this.getStart().move(skipStart).data, this.getStart().move(skipStart + chars).data);
    }
    sliceEndChars({skipEnd: skipEnd = 0, chars: chars}) {
        return span(this.getEnd().move(skipEnd - chars).data, this.getStart().move(-skipEnd).data);
    }
}

/**
 * @property {Source} source
 * @property {CharPositions} charPositions
 */
class CharPositionSpan {
    #locPosSpan;
    constructor(/** @type {Source} */ source, /** @type {CharPositions} */ charPositions) {
        this.source = source, this.charPositions = charPositions, this.kind = "CharPosition", 
        this.#locPosSpan = null;
    }
    /** @returns {SourceSpan} */ wrap() {
        return new SourceSpan(this);
    }
    /** @returns {string} */ asString() {
        return this.source.slice(this.charPositions.start.charPos, this.charPositions.end.charPos);
    }
    getModule() {
        return this.source.module;
    }
    /** @returns {CharPosition} */ getStart() {
        return this.charPositions.start;
    }
    /** @returns {CharPosition} */ getEnd() {
        return this.charPositions.end;
    }
    locDidUpdate() {}
    /** @returns {HbsSpan | null} */ toHbsSpan() {
        let locPosSpan = this.#locPosSpan;
        if (null === locPosSpan) {
            const start = this.charPositions.start.toHbsPos(), end = this.charPositions.end.toHbsPos();
            locPosSpan = this.#locPosSpan = null === start || null === end ? BROKEN : new HbsSpan(this.source, {
                start: start,
                end: end
            });
        }
        return locPosSpan === BROKEN ? null : locPosSpan;
    }
    serialize() {
        const {start: {charPos: start}, end: {charPos: end}} = this.charPositions;
        return start === end ? start : [ start, end ];
    }
    toCharPosSpan() {
        return this;
    }
}

/**
 * @property {Source} source
 * @property {HbsPositions} hbsPositions
 */
class HbsSpan {
    #charPosSpan;
    // the source location from Handlebars + AST Plugins -- could be wrong
    #providedHbsLoc;
    constructor(/** @type {Source} */ source, /** @type {HbsPositions} */ hbsPositions, providedHbsLoc = null) {
        this.source = source, this.hbsPositions = hbsPositions, this.kind = "HbsPosition", 
        this.#charPosSpan = null, this.#providedHbsLoc = providedHbsLoc;
    }
    serialize() {
        const charPos = this.toCharPosSpan();
        return null === charPos ? "Broken" : charPos.wrap().serialize();
    }
    /** @returns {SourceSpan} */ wrap() {
        return new SourceSpan(this);
    }
    updateProvided(pos, edge) {
        this.#providedHbsLoc && (this.#providedHbsLoc[edge] = pos), 
        // invalidate computed character offsets
        this.#charPosSpan = null, this.#providedHbsLoc = {
            start: pos,
            end: pos
        };
    }
    locDidUpdate({start: start, end: end}) {
        void 0 !== start && (this.updateProvided(start, "start"), this.hbsPositions.start = new HbsPosition(this.source, start, null)), 
        void 0 !== end && (this.updateProvided(end, "end"), this.hbsPositions.end = new HbsPosition(this.source, end, null));
    }
    /** @returns {string} */ asString() {
        const span = this.toCharPosSpan();
        return null === span ? "" : span.asString();
    }
    /** @returns {string} */ getModule() {
        return this.source.module;
    }
    /** @returns {HbsPosition} */ getStart() {
        return this.hbsPositions.start;
    }
    /** @returns {HbsPosition} */ getEnd() {
        return this.hbsPositions.end;
    }
    toHbsLoc() {
        return {
            start: this.hbsPositions.start.hbsPos,
            end: this.hbsPositions.end.hbsPos
        };
    }
    /** @returns {HbsSpan} */ toHbsSpan() {
        return this;
    }
    /** @returns {CharPositionSpan | null} */ toCharPosSpan() {
        let charPosSpan = this.#charPosSpan;
        if (null === charPosSpan) {
            const start = this.hbsPositions.start.toCharPos(), end = this.hbsPositions.end.toCharPos();
            if (!start || !end) return charPosSpan = this.#charPosSpan = BROKEN, null;
            charPosSpan = this.#charPosSpan = new CharPositionSpan(this.source, {
                start: start,
                end: end
            });
        }
        return charPosSpan === BROKEN ? null : charPosSpan;
    }
}

class InvisibleSpan {
    constructor(/** @type {string} */ kind, // whatever was provided, possibly broken
    loc, // if the span represents a synthetic string
    string = null) {
        this.kind = kind, this.loc = loc, this.string = string;
    }
    serialize() {
        switch (this.kind) {
          case "Broken":
          case "NonExistent":
            return this.kind;

          case "InternalsSynthetic":
            return this.string || "";
        }
    }
    /** @returns {SourceSpan} */ wrap() {
        return new SourceSpan(this);
    }
    asString() {
        return this.string || "";
    }
    locDidUpdate({start: start, end: end}) {
        void 0 !== start && (this.loc.start = start), void 0 !== end && (this.loc.end = end);
    }
    getModule() {
        // TODO: Make this reflect the actual module this span originated from
        return "an unknown module";
    }
    getStart() {
        return new InvisiblePosition(this.kind, this.loc.start);
    }
    getEnd() {
        return new InvisiblePosition(this.kind, this.loc.end);
    }
    toCharPosSpan() {
        return this;
    }
    toHbsSpan() {
        return null;
    }
    toHbsLoc() {
        return BROKEN_LOCATION;
    }
}

const span = match((/** @returns {Matcher} */ (/** @type {Matcher} */ m) => m.when("HbsPosition", "HbsPosition", (/** @returns {SourceSpan} */ (/** @type {HbsPosition} */ left, /** @type {HbsPosition} */ right) => new HbsSpan(left.source, {
    start: left,
    end: right
}).wrap())).when("CharPosition", "CharPosition", (/** @returns {SourceSpan} */ (/** @type {CharPosition} */ left, /** @type {CharPosition} */ right) => new CharPositionSpan(left.source, {
    start: left,
    end: right
}).wrap())).when("CharPosition", "HbsPosition", (/** @returns {SourceSpan} */ (/** @type {CharPosition} */ left, /** @type {HbsPosition} */ right) => {
    const rightCharPos = right.toCharPos();
    return null === rightCharPos ? new InvisibleSpan("Broken", BROKEN_LOCATION).wrap() : span(left, rightCharPos);
})).when("HbsPosition", "CharPosition", ((left, right) => {
    const leftCharPos = left.toCharPos();
    return null === leftCharPos ? new InvisibleSpan("Broken", BROKEN_LOCATION).wrap() : span(leftCharPos, right);
})).when("IS_INVISIBLE", "MATCH_ANY", (left => new InvisibleSpan(left.kind, BROKEN_LOCATION).wrap())).when("MATCH_ANY", "IS_INVISIBLE", ((_, right) => new InvisibleSpan(right.kind, BROKEN_LOCATION).wrap())))), BROKEN = "BROKEN";

/**
 * Used to indicate that an attempt to convert a `SourcePosition` to a character offset failed. It
 * is separate from `null` so that `null` can be used to indicate that the computation wasn't yet
 * attempted (and therefore to cache the failure)
 */
/**
 * A `SourceOffset` represents a single position in the source.
 *
 * There are three kinds of backing data for `SourceOffset` objects:
 *
 * - `CharPosition`, which contains a character offset into the raw source string
 * - `HbsPosition`, which contains a `SourcePosition` from the Handlebars AST, which can be
 *   converted to a `CharPosition` on demand.
 * - `InvisiblePosition`, which represents a position not in source (@see {InvisiblePosition})
 */
class SourceOffset {
    /**
   * Create a `SourceOffset` from a Handlebars `SourcePosition`. It's stored as-is, and converted
   * into a character offset on demand, which avoids unnecessarily computing the offset of every
   * `SourceLocation`, but also means that broken `SourcePosition`s are not always detected.
   * @returns {SourceOffset}
   */
    static forHbsPos(/** @type {Source} */ source, pos) {
        return new HbsPosition(source, pos, null).wrap();
    }
    /**
   * Create a `SourceOffset` that corresponds to a broken `SourcePosition`. This means that the
   * calling code determined (or knows) that the `SourceLocation` doesn't correspond correctly to
   * any part of the source.
   */    static broken(pos = UNKNOWN_POSITION) {
        return new InvisiblePosition("Broken", pos).wrap();
    }
    constructor(data) {
        this.data = data;
    }
    /**
   * Get the character offset for this `SourceOffset`, if possible.
   * @returns {number | null}
   */    get offset() {
        const charPos = this.data.toCharPos();
        return null === charPos ? null : charPos.offset;
    }
    /**
   * Compare this offset with another one.
   *
   * If both offsets are `HbsPosition`s, they're equivalent as long as their lines and columns are
   * the same. This avoids computing offsets unnecessarily.
   *
   * Otherwise, two `SourceOffset`s are equivalent if their successfully computed character offsets
   * are the same.
   */    eql(right) {
        return eql(this.data, right.data);
    }
    /**
   * Create a span that starts from this source offset and ends with another source offset. Avoid
   * computing character offsets if both `SourceOffset`s are still lazy.
   * @returns {SourceSpan}
   */    until(/** @type {SourceOffset} */ other) {
        return span(this.data, other.data);
    }
    /**
   * Create a `SourceOffset` by moving the character position represented by this source offset
   * forward or backward (if `by` is negative), if possible.
   *
   * If this `SourceOffset` can't compute a valid character offset, `move` returns a broken offset.
   *
   * If the resulting character offset is less than 0 or greater than the size of the source, `move`
   * returns a broken offset.
   * @returns {SourceOffset}
   */    move(/** @type {number} */ by) {
        const charPos = this.data.toCharPos();
        if (null === charPos) return SourceOffset.broken();
        {
            const result = charPos.offset + by;
            return charPos.source.validate(result) ? new CharPosition(charPos.source, result).wrap() : SourceOffset.broken();
        }
    }
    /**
   * Create a new `SourceSpan` that represents a collapsed range at this source offset. Avoid
   * computing the character offset if it has not already been computed.
   * @returns {SourceSpan}
   */    collapsed() {
        return span(this.data, this.data);
    }
    /**
   * Convert this `SourceOffset` into a Handlebars {@see SourcePosition} for compatibility with
   * existing plugins.
   */    toJSON() {
        return this.data.toJSON();
    }
}

/**
 * @property {Source} source
 */
class CharPosition {
    constructor(/** @type {Source} */ source, /** @type {number} */ charPos) {
        this.source = source, this.charPos = charPos, this.kind = "CharPosition", this._locPos = null;
    }
    /**
   * This is already a `CharPosition`.
   *
   * {@see HbsPosition} for the alternative.
   * @returns {CharPosition}
   */    toCharPos() {
        return this;
    }
    /**
   * Produce a Handlebars {@see SourcePosition} for this `CharPosition`. If this `CharPosition` was
   * computed using {@see SourceOffset#move}, this will compute the `SourcePosition` for the offset.
   */    toJSON() {
        const hbs = this.toHbsPos();
        return null === hbs ? UNKNOWN_POSITION : hbs.toJSON();
    }
    /** @returns {SourceOffset} */ wrap() {
        return new SourceOffset(this);
    }
    /**
   * A `CharPosition` always has an offset it can produce without any additional computation.
   * @returns {number}
   */    get offset() {
        return this.charPos;
    }
    /**
   * Convert the current character offset to an `HbsPosition`, if it was not already computed. Once
   * a `CharPosition` has computed its `HbsPosition`, it will not need to do compute it again, and
   * the same `CharPosition` is retained when used as one of the ends of a `SourceSpan`, so
   * computing the `HbsPosition` should be a one-time operation.
   * @returns {HbsPosition | null}
   */    toHbsPos() {
        let locPos = this._locPos;
        if (null === locPos) {
            const hbsPos = this.source.hbsPosFor(this.charPos);
            this._locPos = locPos = null === hbsPos ? BROKEN : new HbsPosition(this.source, hbsPos, this.charPos);
        }
        return locPos === BROKEN ? null : locPos;
    }
}

/**
 * @property {Source} source
 * @property {SourcePosition} hbsPos
 */
class HbsPosition {
    constructor(/** @type {Source} */ source, /** @type {SourcePosition} */ hbsPos, charPos = null) {
        this.source = source, this.hbsPos = hbsPos, this.kind = "HbsPosition", this._charPos = null === charPos ? null : new CharPosition(source, charPos);
    }
    /**
   * Lazily compute the character offset from the {@see SourcePosition}. Once an `HbsPosition` has
   * computed its `CharPosition`, it will not need to do compute it again, and the same
   * `HbsPosition` is retained when used as one of the ends of a `SourceSpan`, so computing the
   * `CharPosition` should be a one-time operation.
   * @returns {CharPosition | null}
   */    toCharPos() {
        let charPos = this._charPos;
        if (null === charPos) {
            const charPosNumber = this.source.charPosFor(this.hbsPos);
            this._charPos = charPos = null === charPosNumber ? BROKEN : new CharPosition(this.source, charPosNumber);
        }
        return charPos === BROKEN ? null : charPos;
    }
    /**
   * Return the {@see SourcePosition} that this `HbsPosition` was instantiated with. This operation
   * does not need to compute anything.
   */    toJSON() {
        return this.hbsPos;
    }
    /** @returns {SourceOffset} */ wrap() {
        return new SourceOffset(this);
    }
    /**
   * This is already an `HbsPosition`.
   *
   * {@see CharPosition} for the alternative.
   */    toHbsPos() {
        return this;
    }
}

class InvisiblePosition {
    constructor(kind, // whatever was provided, possibly broken
    pos) {
        this.kind = kind, this.pos = pos;
    }
    /**
   * A broken position cannot be turned into a {@see CharacterPosition}.
   */    toCharPos() {
        return null;
    }
    /**
   * The serialization of an `InvisiblePosition is whatever Handlebars {@see SourcePosition} was
   * originally identified as broken, non-existent or synthetic.
   *
   * If an `InvisiblePosition` never had an source offset at all, this method returns
   * {@see UNKNOWN_POSITION} for compatibility.
   */    toJSON() {
        return this.pos;
    }
    wrap() {
        return new SourceOffset(this);
    }
    get offset() {
        return null;
    }
}

/**
 * Compare two {@see AnyPosition} and determine whether they are equal.
 *
 * @see {SourceOffset#eql}
 */ const eql = match((/** @returns {Matcher} */ (/** @type {Matcher} */ m) => m.when("HbsPosition", "HbsPosition", (({hbsPos: left}, {hbsPos: right}) => left.column === right.column && left.line === right.line)).when("CharPosition", "CharPosition", (({charPos: left}, {charPos: right}) => left === right)).when("CharPosition", "HbsPosition", (({offset: left}, right) => left === right.toCharPos()?.offset)).when("HbsPosition", "CharPosition", ((left, {offset: right}) => left.toCharPos()?.offset === right)).when("MATCH_ANY", "MATCH_ANY", (() => !1))));

class Source {
    static from(source, options = {}) {
        return new Source(source, options.meta?.moduleName);
    }
    constructor(/** @type {string} */ source, module = "an unknown module") {
        this.source = source, this.module = module;
    }
    /**
   * Validate that the character offset represents a position in the source string.
   * @returns {boolean}
   */    validate(offset) {
        return offset >= 0 && offset <= this.source.length;
    }
    /** @returns {string} */ slice(start, end) {
        return this.source.slice(start, end);
    }
    /** @returns {SourceOffset} */ offsetFor(/** @type {number} */ line, /** @type {number} */ column) {
        return SourceOffset.forHbsPos(this, {
            line: line,
            column: column
        });
    }
    /** @returns {SourceSpan} */ spanFor({start: start, end: end}) {
        return SourceSpan.forHbsLoc(this, {
            start: {
                line: start.line,
                column: start.column
            },
            end: {
                line: end.line,
                column: end.column
            }
        });
    }
    /** @returns {SourcePosition | null} */ hbsPosFor(/** @type {number} */ offset) {
        let seenLines = 0, seenChars = 0;
        if (offset > this.source.length) return null;
        for (;;) {
            let nextLine = this.source.indexOf("\n", seenChars);
            if (offset <= nextLine || -1 === nextLine) return {
                line: seenLines + 1,
                column: offset - seenChars
            };
            seenLines += 1, seenChars = nextLine + 1;
        }
    }
    /** @returns {number} */ charPosFor(/** @type {SourcePosition} */ position) {
        let {line: line, column: column} = position, sourceLength = this.source.length, seenLines = 0, seenChars = 0;
        for (;seenChars < sourceLength; ) {
            let nextLine = this.source.indexOf("\n", seenChars);
            if (-1 === nextLine && (nextLine = this.source.length), seenLines === line - 1) {
                if (seenChars + column > nextLine) return nextLine;
                if (DEBUG) {
                    let roundTrip = this.hbsPosFor(seenChars + column);
                    roundTrip.line, roundTrip.column;
                }
                return seenChars + column;
            }
            if (-1 === nextLine) return 0;
            seenLines += 1, seenChars = nextLine + 1;
        }
        return sourceLength;
    }
}

class SpanList {
    static range(span, fallback = SourceSpan.NON_EXISTENT) {
        return new SpanList(span.map(loc)).getRangeOffset(fallback);
    }
    constructor(span = []) {
        this._span = span;
    }
    add(offset) {
        this._span.push(offset);
    }
    getRangeOffset(fallback) {
        if (isPresentArray(this._span)) {
            let first = getFirst(this._span), last = getLast(this._span);
            return first.extend(last);
        }
        return fallback;
    }
}

function loc(span) {
    if (Array.isArray(span)) {
        let first = getFirst(span), last = getLast(span);
        return loc(first).extend(loc(last));
    }
    return span instanceof SourceSpan ? span : span.loc;
}

function hasSpan(span) {
    return !Array.isArray(span) || 0 !== span.length;
}

function maybeLoc(location, fallback) {
    return hasSpan(location) ? loc(location) : fallback;
}

var api$1 =  Object.freeze({
    __proto__: null,
    NON_EXISTENT_LOCATION: NON_EXISTENT_LOCATION,
    SYNTHETIC_LOCATION: SYNTHETIC_LOCATION,
    Source: Source,
    SourceOffset: SourceOffset,
    SourceSlice: SourceSlice,
    SourceSpan: SourceSpan,
    SpanList: SpanList,
    UNKNOWN_POSITION: UNKNOWN_POSITION,
    hasSpan: hasSpan,
    loc: loc,
    maybeLoc: maybeLoc
});

function generateSyntaxError(/** @type {string} */ message, /** @type {SourceSpan} */ location) {
    let {module: module, loc: loc} = location, {line: line, column: column} = loc.start, code = location.asString(), quotedCode = code ? `\n\n|\n|  ${code.split("\n").join("\n|  ")}\n|\n\n` : "", error = new Error(`${message}: ${quotedCode}(error occurred in '${module}' @ line ${line} : column ${column})`);
    return error.name = "SyntaxError", error.location = location, error.code = code, 
    error;
}

// ensure stays in sync with typing
// ParentNode and ChildKey types are derived from VisitorKeysMap
const visitorKeys = {
    Template: [ "body" ],
    Block: [ "body" ],
    MustacheStatement: [ "path", "params", "hash" ],
    BlockStatement: [ "path", "params", "hash", "program", "inverse" ],
    ElementModifierStatement: [ "path", "params", "hash" ],
    CommentStatement: [],
    MustacheCommentStatement: [],
    ElementNode: [ "attributes", "modifiers", "children", "comments" ],
    AttrNode: [ "value" ],
    TextNode: [],
    ConcatStatement: [ "parts" ],
    SubExpression: [ "path", "params", "hash" ],
    PathExpression: [],
    StringLiteral: [],
    BooleanLiteral: [],
    NumberLiteral: [],
    NullLiteral: [],
    UndefinedLiteral: [],
    Hash: [ "pairs" ],
    HashPair: [ "value" ]
}, TraversalError = function() {
    function TraversalError(message, node, parent, key) {
        let error = Error.call(this, message);
        this.key = key, this.message = message, this.node = node, this.parent = parent, 
        error.stack && (this.stack = error.stack);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return TraversalError.prototype = Object.create(Error.prototype), 
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    TraversalError.prototype.constructor = TraversalError, TraversalError;
}();

function cannotRemoveNode(node, parent, key) {
    return new TraversalError("Cannot remove a node unless it is part of an array", node, parent, key);
}

function cannotReplaceNode(node, parent, key) {
    return new TraversalError("Cannot replace a node with multiple nodes unless it is part of an array", node, parent, key);
}

function cannotReplaceOrRemoveInKeyHandlerYet(node, key) {
    return new TraversalError("Replacing and removing in key handlers is not yet supported.", node, null, key);
}

class WalkerPath {
    constructor(node, parent = null, parentKey = null) {
        this.node = node, this.parent = parent, this.parentKey = parentKey;
    }
    get parentNode() {
        return this.parent ? this.parent.node : null;
    }
    parents() {
        return {
            [Symbol.iterator]: () => new PathParentsIterator(this)
        };
    }
}

class PathParentsIterator {
    constructor(path) {
        this.path = path;
    }
    next() {
        return this.path.parent ? (this.path = this.path.parent, {
            done: !1,
            value: this.path
        }) : {
            done: !0,
            value: null
        };
    }
}

function getEnterFunction(handler) {
    return "function" == typeof handler ? handler : handler.enter;
}

function getExitFunction(handler) {
    return "function" == typeof handler ? void 0 : handler.exit;
}

function visitNode(visitor, /** @type {WalkerPath | undefined} */ path) {
    let enter, exit, result, {node: node, parent: parent, parentKey: parentKey} = path, handler = function(visitor, /** @type {string} */ nodeType) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        if (visitor.Program && ("Template" === nodeType && !visitor.Template || "Block" === nodeType && !visitor.Block)) 
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return visitor.Program;
        let handler = visitor[nodeType];
        return void 0 !== handler ? handler : visitor.All;
    }(visitor, node.type);
    if (void 0 !== handler && (enter = getEnterFunction(handler), exit = getExitFunction(handler)), 
    void 0 !== enter && (result = enter(node, path)), null != result) {
        if (JSON.stringify(node) !== JSON.stringify(result)) return Array.isArray(result) ? (visitArray(visitor, result, parent, parentKey), 
        result) : visitNode(visitor, new WalkerPath(result, parent, parentKey)) || result;
        result = void 0;
    }
    if (void 0 === result) {
        let keys = visitorKeys[node.type];
        for (let i = 0; i < keys.length; i++) 
        // we know if it has child keys we can widen to a ParentNode
        visitKey(visitor, handler, path, keys[i]);
        void 0 !== exit && (result = exit(node, path));
    }
    return result;
}

function set(node, key, value) {
    node[key] = value;
}

function visitKey(visitor, handler, /** @type {WalkerPath} */ path, /** @type {string} */ key) {
    let keyEnter, keyExit, {node: node} = path, value = function(node, /** @type {string} */ key) {
        return node[key];
    }(node, key);
    if (value) {
        if (void 0 !== handler) {
            let keyHandler = function(handler, /** @type {string} */ key) {
                let keyVisitor = "function" != typeof handler ? handler.keys : void 0;
                if (void 0 === keyVisitor) return;
                let keyHandler = keyVisitor[key];
                return void 0 !== keyHandler ? keyHandler : keyVisitor.All;
            }(handler, key);
            void 0 !== keyHandler && (keyEnter = getEnterFunction(keyHandler), keyExit = getExitFunction(keyHandler));
        }
        if (void 0 !== keyEnter && void 0 !== keyEnter(node, key)) throw cannotReplaceOrRemoveInKeyHandlerYet(node, key);
        if (Array.isArray(value)) visitArray(visitor, value, path, key); else {
            let result = visitNode(visitor, new WalkerPath(value, path, key));
            void 0 !== result && 
            // TODO: dynamically check the results by having a table of
            // expected node types in value space, not just type space
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
            function(node, key, value, result) {
                if (null === result) throw cannotRemoveNode(value, node, key);
                if (Array.isArray(result)) {
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (1 !== result.length) throw 0 === result.length ? cannotRemoveNode(value, node, key) : cannotReplaceNode(value, node, key);
                    set(node, key, result[0]);
                } else set(node, key, result);
            }(node, key, value, result);
        }
        if (void 0 !== keyExit && void 0 !== keyExit(node, key)) throw cannotReplaceOrRemoveInKeyHandlerYet(node, key);
    }
}

function visitArray(visitor, /** @type {any[]} */ array, /** @type {WalkerPath} */ parent, /** @type {string} */ parentKey) {
    for (let i = 0; i < array.length; i++) {
        let node = array[i], result = visitNode(visitor, new WalkerPath(node, parent, parentKey));
        void 0 !== result && (i += spliceArray(array, i, result) - 1);
    }
}

function spliceArray(array, index, result) {
    return null === result ? (array.splice(index, 1), 0) : Array.isArray(result) ? (array.splice(index, 1, ...result), 
    result.length) : (array.splice(index, 1, result), 1);
}

function traverse(node, visitor) {
    visitNode(visitor, new WalkerPath(node));
}

class Walker {
    constructor(order) {
        this.order = order, this.stack = [];
    }
    visit(node, visitor) {
        node && (this.stack.push(node), "post" === this.order ? (this.children(node, visitor), 
        visitor(node, this)) : (visitor(node, this), this.children(node, visitor)), this.stack.pop());
    }
    children(node, callback) {
        switch (node.type) {
          case "Block":
          case "Template":
            return void walkBody(this, node.body, callback);

          case "ElementNode":
            return void walkBody(this, node.children, callback);

          case "BlockStatement":
            return this.visit(node.program, callback), void this.visit(node.inverse || null, callback);

          default:
            return;
        }
    }
}

function walkBody(walker, body, callback) {
    for (const child of body) walker.visit(child, callback);
}

function appendChild(parent, node) {
    (/** @returns {any[]} */ function(node) {
        switch (node.type) {
          case "Block":
          case "Template":
            return node.body;

          case "ElementNode":
            return node.children;
        }
    })(parent).push(node);
}

/** @returns {boolean} */ function isHBSLiteral(path) {
    return "StringLiteral" === path.type || "BooleanLiteral" === path.type || "NumberLiteral" === path.type || "NullLiteral" === path.type || "UndefinedLiteral" === path.type;
}

let _SOURCE;

function SOURCE() {
    return _SOURCE || (_SOURCE = new Source("", "(synthetic)")), _SOURCE;
}

function buildVar(name, loc) {
    return b.var({
        name: name,
        loc: buildLoc(loc || null)
    });
}

function buildPath(path, loc) {
    let span = buildLoc(loc || null);
    if ("string" != typeof path) {
        if ("type" in path) return path;
        {
            path.head.indexOf(".");
            let {head: head, tail: tail} = path;
            return b.path({
                head: b.head({
                    original: head,
                    loc: span.sliceStartChars({
                        chars: head.length
                    })
                }),
                tail: tail,
                loc: buildLoc(loc || null)
            });
        }
    }
    let {head: head, tail: tail} = function(original, loc) {
        let [head, ...tail] = original.split("."), headNode = b.head({
            original: head,
            loc: buildLoc(loc || null)
        });
        return b.path({
            head: headNode,
            tail: tail,
            loc: buildLoc(loc || null)
        });
    }(path, span);
    return b.path({
        head: head,
        tail: tail,
        loc: span
    });
}

function buildLiteral(type, value, loc) {
    return b.literal({
        type: type,
        value: value,
        loc: buildLoc(loc || null)
    });
}

// Miscellaneous
function buildHash(pairs = [], loc) {
    return b.hash({
        pairs: pairs,
        loc: buildLoc(loc || null)
    });
}

function buildBlockParams(params) {
    return params.map((p => "string" == typeof p ? b.var({
        name: p,
        loc: SourceSpan.synthetic(p)
    }) : p));
}

function buildBlockItself(body = [], params = [], chained = !1, loc) {
    return b.blockItself({
        body: body,
        params: buildBlockParams(params),
        chained: chained,
        loc: buildLoc(loc || null)
    });
}

function buildTemplate(body = [], blockParams = [], loc) {
    return b.template({
        body: body,
        blockParams: blockParams,
        loc: buildLoc(loc || null)
    });
}

function buildLoc(...args) {
    if (1 === args.length) {
        let loc = args[0];
        return loc && "object" == typeof loc ? SourceSpan.forHbsLoc(SOURCE(), loc) : SourceSpan.forHbsLoc(SOURCE(), SYNTHETIC_LOCATION);
    }
    {
        let [startLine, startColumn, endLine, endColumn, _source] = args, source = _source ? new Source("", _source) : SOURCE();
        return SourceSpan.forHbsLoc(source, {
            start: {
                line: startLine,
                column: startColumn
            },
            end: {
                line: endLine || startLine,
                column: endColumn || startColumn
            }
        });
    }
}

var publicBuilder = {
    mustache: function(path, params = [], hash = buildHash([]), trusting = !1, loc, strip) {
        return b.mustache({
            path: buildPath(path),
            params: params,
            hash: hash,
            trusting: trusting,
            strip: strip,
            loc: buildLoc(loc || null)
        });
    },
    block: function(path, params, hash, _defaultBlock, _elseBlock = null, loc, openStrip, inverseStrip, closeStrip) {
        let defaultBlock, elseBlock = null;
        return defaultBlock = "Template" === _defaultBlock.type ? b.blockItself({
            params: buildBlockParams(_defaultBlock.blockParams),
            body: _defaultBlock.body,
            loc: _defaultBlock.loc
        }) : _defaultBlock, "Template" === _elseBlock?.type ? (_elseBlock.blockParams.length, 
        elseBlock = b.blockItself({
            params: [],
            body: _elseBlock.body,
            loc: _elseBlock.loc
        })) : elseBlock = _elseBlock, b.block({
            path: buildPath(path),
            params: params || [],
            hash: hash || buildHash([]),
            defaultBlock: defaultBlock,
            elseBlock: elseBlock,
            loc: buildLoc(loc || null),
            openStrip: openStrip,
            inverseStrip: inverseStrip,
            closeStrip: closeStrip
        });
    },
    comment: function(value, loc) {
        return b.comment({
            value: value,
            loc: buildLoc(loc || null)
        });
    },
    mustacheComment: function(value, loc) {
        return b.mustacheComment({
            value: value,
            loc: buildLoc(loc || null)
        });
    },
    element: function(tag, options = {}) {
        let path, selfClosing, {attrs: attrs, blockParams: blockParams, modifiers: modifiers, comments: comments, children: children, openTag: openTag, closeTag: _closeTag, loc: loc} = options;
        // this is used for backwards compat, prior to `selfClosing` being part of the ElementNode AST
                "string" == typeof tag ? tag.endsWith("/") ? (path = buildPath(tag.slice(0, -1)), 
        selfClosing = !0) : path = buildPath(tag) : "type" in tag ? (tag.type, tag.type, 
        path = tag) : "path" in tag ? (tag.path.type, tag.path.type, path = tag.path, selfClosing = tag.selfClosing) : (path = buildPath(tag.name), 
        selfClosing = tag.selfClosing);
        let params = blockParams?.map((param => "string" == typeof param ? buildVar(param) : param)), closeTag = null;
        return _closeTag ? closeTag = buildLoc(_closeTag) : void 0 === _closeTag && (closeTag = selfClosing || isVoidTag(path.original) ? null : buildLoc(null)), 
        b.element({
            path: path,
            selfClosing: selfClosing || !1,
            attributes: attrs || [],
            params: params || [],
            modifiers: modifiers || [],
            comments: comments || [],
            children: children || [],
            openTag: buildLoc(openTag || null),
            closeTag: closeTag,
            loc: buildLoc(loc || null)
        });
    },
    elementModifier: function(path, params, hash, loc) {
        return b.elementModifier({
            path: buildPath(path),
            params: params || [],
            hash: hash || buildHash([]),
            loc: buildLoc(loc || null)
        });
    },
    attr: function(name, value, loc) {
        return b.attr({
            name: name,
            value: value,
            loc: buildLoc(loc || null)
        });
    },
    text: function(chars = "", loc) {
        return b.text({
            chars: chars,
            loc: buildLoc(loc || null)
        });
    }
    // Expressions
    ,
    sexpr: function(path, params = [], hash = buildHash([]), loc) {
        return b.sexpr({
            path: buildPath(path),
            params: params,
            hash: hash,
            loc: buildLoc(loc || null)
        });
    },
    concat: function(parts, loc) {
        if (!isPresentArray(parts)) throw new Error("b.concat requires at least one part");
        return b.concat({
            parts: parts,
            loc: buildLoc(loc || null)
        });
    },
    hash: buildHash,
    pair: function(key, value, loc) {
        return b.pair({
            key: key,
            value: value,
            loc: buildLoc(loc || null)
        });
    },
    literal: buildLiteral,
    program: function(body, blockParams, loc) {
        return blockParams && blockParams.length ? buildBlockItself(body, blockParams, !1, loc) : buildTemplate(body, [], loc);
    },
    blockItself: buildBlockItself,
    template: buildTemplate,
    loc: buildLoc,
    pos: function(line, column) {
        return b.pos({
            line: line,
            column: column
        });
    },
    path: buildPath,
    fullPath: function(head, tail = [], loc) {
        return b.path({
            head: head,
            tail: tail,
            loc: buildLoc(loc || null)
        });
    },
    head: function(original, loc) {
        return b.head({
            original: original,
            loc: buildLoc(loc || null)
        });
    },
    at: function(name, loc) {
        return b.atName({
            name: name,
            loc: buildLoc(loc || null)
        });
    },
    var: buildVar,
    this: function(loc) {
        return b.this({
            loc: buildLoc(loc || null)
        });
    },
    string: literal("StringLiteral"),
    boolean: literal("BooleanLiteral"),
    number: literal("NumberLiteral"),
    undefined: () => buildLiteral("UndefinedLiteral", void 0),
    null: () => buildLiteral("NullLiteral", null)
};

function literal(/** @type {string} */ type) {
    return function(value, loc) {
        return buildLiteral(type, value, loc);
    };
}

const DEFAULT_STRIP = {
    close: !1,
    open: !1
}, b = new 
/**
 * The Parser Builder differentiates from the public builder API by:
 *
 * 1. Offering fewer different ways to instantiate nodes
 * 2. Mandating source locations
 */
class {
    pos({line: line, column: column}) {
        return {
            line: line,
            column: column
        };
    }
    blockItself({body: body, params: params1, chained: chained = !1, loc: loc}) {
        return {
            type: "Block",
            body: body,
            params: params1,
            /** @returns {any[]} */ get blockParams() {
                return this.params.map((/** @returns {string} */ p => p.name));
            },
            set blockParams(params) {
                this.params = params.map((name1 => b.var({
                    name: name1,
                    loc: SourceSpan.synthetic(name1)
                })));
            },
            chained: chained,
            loc: loc
        };
    }
    template({body: body, blockParams: blockParams, loc: loc}) {
        return {
            type: "Template",
            body: body,
            blockParams: blockParams,
            loc: loc
        };
    }
    mustache({path: path, params: params1, hash: hash, trusting: trusting, loc: loc, strip: strip = DEFAULT_STRIP}) {
        return function({path: path, params: params, hash: hash, trusting: trusting, strip: strip, loc: loc}) {
            const node = {
                type: "MustacheStatement",
                path: path,
                params: params,
                hash: hash,
                trusting: trusting,
                strip: strip,
                loc: loc
            };
            return Object.defineProperty(node, "escaped", {
                enumerable: !1,
                get() {
                    return !this.trusting;
                },
                set(value1) {
                    this.trusting = !value1;
                }
            }), node;
        }({
            path: path,
            params: params1,
            hash: hash,
            trusting: trusting,
            strip: strip,
            loc: loc
        });
    }
    block({path: path, params: params1, hash: hash, defaultBlock: defaultBlock, elseBlock: elseBlock = null, loc: loc, openStrip: openStrip = DEFAULT_STRIP, inverseStrip: inverseStrip = DEFAULT_STRIP, closeStrip: closeStrip = DEFAULT_STRIP}) {
        return {
            type: "BlockStatement",
            path: path,
            params: params1,
            hash: hash,
            program: defaultBlock,
            inverse: elseBlock,
            loc: loc,
            openStrip: openStrip,
            inverseStrip: inverseStrip,
            closeStrip: closeStrip
        };
    }
    comment({value: value1, loc: loc}) {
        return {
            type: "CommentStatement",
            value: value1,
            loc: loc
        };
    }
    mustacheComment({value: value1, loc: loc}) {
        return {
            type: "MustacheCommentStatement",
            value: value1,
            loc: loc
        };
    }
    concat({parts: parts, loc: loc}) {
        return {
            type: "ConcatStatement",
            parts: parts,
            loc: loc
        };
    }
    element({path: path, selfClosing: selfClosing1, attributes: attributes, modifiers: modifiers, params: params1, comments: comments, children: children, openTag: openTag, closeTag: closeTag, loc: loc}) {
        let _selfClosing = selfClosing1;
        return {
            type: "ElementNode",
            path: path,
            attributes: attributes,
            modifiers: modifiers,
            params: params1,
            comments: comments,
            children: children,
            openTag: openTag,
            closeTag: closeTag,
            loc: loc,
            /** @returns {string} */ get tag() {
                return this.path.original;
            },
            set tag(name) {
                this.path.original = name;
            },
            /** @returns {any[]} */ get blockParams() {
                return this.params.map((/** @returns {string} */ p => p.name));
            },
            set blockParams(params) {
                this.params = params.map((name1 => b.var({
                    name: name1,
                    loc: SourceSpan.synthetic(name1)
                })));
            },
            /** @returns {boolean} */ get selfClosing() {
                return _selfClosing;
            },
            set selfClosing(selfClosing) {
                _selfClosing = selfClosing, this.closeTag = selfClosing ? null : SourceSpan.synthetic(`</${this.tag}>`);
            }
        };
    }
    elementModifier({path: path, params: params1, hash: hash, loc: loc}) {
        return {
            type: "ElementModifierStatement",
            path: path,
            params: params1,
            hash: hash,
            loc: loc
        };
    }
    attr({name: name1, value: value1, loc: loc}) {
        return {
            type: "AttrNode",
            name: name1,
            value: value1,
            loc: loc
        };
    }
    text({chars: chars, loc: loc}) {
        return {
            type: "TextNode",
            chars: chars,
            loc: loc
        };
    }
    sexpr({path: path, params: params1, hash: hash, loc: loc}) {
        return {
            type: "SubExpression",
            path: path,
            params: params1,
            hash: hash,
            loc: loc
        };
    }
    path({head: head, tail: tail, loc: loc}) {
        return function({head: head, tail: tail, loc: loc}) {
            const node = {
                type: "PathExpression",
                head: head,
                tail: tail,
                /** @returns {string} */ get original() {
                    return [ this.head.original, ...this.tail ].join(".");
                },
                set original(value) {
                    let [head, ...tail] = value.split(".");
                    this.head = publicBuilder.head(head, this.head.loc), this.tail = tail;
                },
                loc: loc
            };
            return Object.defineProperty(node, "parts", {
                enumerable: !1,
                get() {
                    let parts = this.original.split(".");
                    return "this" === parts[0] ? 
                    // parts does not include `this`
                    parts.shift() : parts[0].startsWith("@") && (
                    // parts does not include leading `@`
                    parts[0] = parts[0].slice(1)), Object.freeze(parts);
                },
                set(values) {
                    let parts = [ ...values ];
                    // you are not supposed to already have `this` or `@` in the parts, but since this is
                    // deprecated anyway, we will infer what you meant and allow it
                                        "this" === parts[0] || parts[0]?.startsWith("@") || ("ThisHead" === this.head.type ? parts.unshift("this") : "AtHead" === this.head.type && (parts[0] = `@${parts[0]}`)), 
                    this.original = parts.join(".");
                }
            }), Object.defineProperty(node, "this", {
                enumerable: !1,
                get() {
                    return "ThisHead" === this.head.type;
                }
            }), Object.defineProperty(node, "data", {
                enumerable: !1,
                get() {
                    return "AtHead" === this.head.type;
                }
            }), node;
        }({
            head: head,
            tail: tail,
            loc: loc
        });
    }
    head({original: original, loc: loc}) {
        return "this" === original ? this.this({
            loc: loc
        }) : "@" === original[0] ? this.atName({
            name: original,
            loc: loc
        }) : this.var({
            name: original,
            loc: loc
        });
    }
    this({loc: loc}) {
        return {
            type: "ThisHead",
            /** @returns {string} */ get original() {
                return "this";
            },
            loc: loc
        };
    }
    atName({name: name1, loc: loc}) {
        let _name = "";
        const node = {
            type: "AtHead",
            /** @returns {string} */ get name() {
                return _name;
            },
            set name(/** @type {string} */ value) {
                value[0], value.indexOf("."), _name = value;
            },
            /** @returns {string} */ get original() {
                return this.name;
            },
            set original(value) {
                this.name = value;
            },
            loc: loc
        };
        // trigger the assertions
                return node.name = name1, node;
    }
    var({name: name1, loc: loc}) {
        let _name = "";
        const node = {
            type: "VarHead",
            /** @returns {string} */ get name() {
                return _name;
            },
            set name(/** @type {string} */ value) {
                value[0], value.indexOf("."), _name = value;
            },
            /** @returns {string} */ get original() {
                return this.name;
            },
            set original(value) {
                this.name = value;
            },
            loc: loc
        };
        // trigger the assertions
                return node.name = name1, node;
    }
    hash({pairs: pairs, loc: loc}) {
        return {
            type: "Hash",
            pairs: pairs,
            loc: loc
        };
    }
    pair({key: key, value: value1, loc: loc}) {
        return {
            type: "HashPair",
            key: key,
            value: value1,
            loc: loc
        };
    }
    literal({type: type, value: value1, loc: loc}) {
        return function({type: type, value: value1, loc: loc}) {
            const node = {
                type: type,
                value: value1,
                loc: loc
            };
            return Object.defineProperty(node, "original", {
                enumerable: !1,
                get() {
                    return this.value;
                },
                set(value1) {
                    this.value = value1;
                }
            }), node;
        }({
            type: type,
            value: value1,
            loc: loc
        });
    }
};

/**
 * @property {EventedTokenizer} tokenizer
 * @property {string[]} lines
 * @property {Source} source
 */
class Parser {
    constructor(/** @type {Source} */ source, entityParser = new EntityParser(HTML5NamedCharRefs), mode = "precompile") {
        this.elementStack = [], this.currentAttribute = null, this.currentNode = null, this.source = source, 
        this.lines = source.source.split(/\r\n?|\n/u), this.tokenizer = new EventedTokenizer(this, entityParser, mode);
    }
    /** @returns {SourceOffset} */ offset() {
        let {line: line, column: column} = this.tokenizer;
        return this.source.offsetFor(line, column);
    }
    pos({line: line, column: column}) {
        return this.source.offsetFor(line, column);
    }
    finish(node) {
        return assign({}, node, {
            loc: node.start.until(this.offset())
        });
        // node.loc = node.loc.withEnd(end);
        }
    get currentAttr() {
        return this.currentAttribute;
    }
    get currentTag() {
        let node = this.currentNode;
        return node && ("StartTag" === node.type || node.type), node;
    }
    get currentStartTag() {
        let node = this.currentNode;
        return node && node.type, node;
    }
    get currentEndTag() {
        let node = this.currentNode;
        return node && node.type, node;
    }
    get currentComment() {
        let node = this.currentNode;
        return node && node.type, node;
    }
    get currentData() {
        let node = this.currentNode;
        return node && node.type, node;
    }
    acceptNode(node) {
        return this[node.type](node);
    }
    currentElement() {
        return getLast(this.elementStack);
    }
    sourceForNode(node, endNode) {
        let line, lastLine, lastColumn, firstLine = node.loc.start.line - 1, currentLine = firstLine - 1, firstColumn = node.loc.start.column, string = [];
        for (endNode ? (lastLine = endNode.loc.end.line - 1, lastColumn = endNode.loc.end.column) : (lastLine = node.loc.end.line - 1, 
        lastColumn = node.loc.end.column); currentLine < lastLine; ) currentLine++, line = this.lines[currentLine], 
        currentLine === firstLine ? firstLine === lastLine ? string.push(line.slice(firstColumn, lastColumn)) : string.push(line.slice(firstColumn)) : currentLine === lastLine ? string.push(line.slice(0, lastColumn)) : string.push(line);
        return string.join("\n");
    }
}

class HandlebarsNodeVisitors extends Parser {
    parse(program, /** @type {any[] | undefined} */ blockParams) {
        program.loc;
        let node = b.template({
            body: [],
            blockParams: blockParams,
            loc: this.source.spanFor(program.loc)
        }), template = this.parseProgram(node, program);
        // TODO: we really need to verify that the tokenizer is in an acceptable
        // state when we are "done" parsing. For example, right now, `<foo` parses
        // into `Template { body: [] }` which is obviously incorrect
        return this.pendingError?.eof(template.loc.getEnd()), template;
    }
    Program(program, /** @type {any[]} */ blockParams) {
        program.loc;
        let node = b.blockItself({
            body: [],
            params: blockParams,
            chained: program.chained,
            loc: this.source.spanFor(program.loc)
        });
        return this.parseProgram(node, program);
    }
    parseProgram(node, program) {
        if (0 === program.body.length) return node;
        let poppedNode;
        try {
            this.elementStack.push(node);
            for (let child of program.body) this.acceptNode(child);
        } finally {
            poppedNode = this.elementStack.pop();
        }
        // Ensure that that the element stack is balanced properly.
                if (node !== poppedNode) {
            if ("ElementNode" === poppedNode?.type) throw generateSyntaxError(`Unclosed element \`${poppedNode.tag}\``, poppedNode.loc);
            node.type;
        }
        return node;
    }
    BlockStatement(block) {
        if ("comment" === this.tokenizer.state) return block.loc, void this.appendToCommentData(this.sourceForNode(block));
        if ("data" !== this.tokenizer.state && "beforeData" !== this.tokenizer.state) throw generateSyntaxError("A block may only be used inside an HTML element or another block.", this.source.spanFor(block.loc));
        const {path: path, params: params, hash: hash} = acceptCallNodes(this, block), loc = this.source.spanFor(block.loc);
        // Backfill block params loc for the default block
        let repairedBlock, blockParams = [];
        if (block.program.blockParams?.length) {
            // Start from right after the hash
            let span = hash.loc.collapse("end");
            // Extend till the beginning of the block
                        span = block.program.loc ? span.withEnd(this.source.spanFor(block.program.loc).getStart()) : block.program.body[0] ? span.withEnd(this.source.spanFor(block.program.body[0].loc).getStart()) : span.withEnd(loc.getEnd()), 
            repairedBlock = repairBlock(this.source, block, span);
            // Now we have a span for something like this:
            //   {{#foo bar baz=bat as |wow wat|}}
            //                     ~~~~~~~~~~~~~~~
            // Or, if we are unlucky:
            // {{#foo bar baz=bat as |wow wat|}}{{/foo}}
            //                   ~~~~~~~~~~~~~~~~~~~~~~~
            // Either way, within this span, there should be exactly two pipes
            // fencing our block params, neatly whitespace separated and with
            // legal identifiers only
            const content = span.asString();
            let skipStart = content.indexOf("|") + 1;
            const limit = content.indexOf("|", skipStart);
            for (const name of block.program.blockParams) {
                let nameStart, loc;
                nameStart = skipStart >= limit ? -1 : content.indexOf(name, skipStart), -1 === nameStart || nameStart + name.length > limit ? (skipStart = limit, 
                loc = this.source.spanFor(NON_EXISTENT_LOCATION)) : (skipStart = nameStart, loc = span.sliceStartChars({
                    skipStart: skipStart,
                    chars: name.length
                }), skipStart += name.length), blockParams.push(b.var({
                    name: name,
                    loc: loc
                }));
            }
        } else repairedBlock = repairBlock(this.source, block, loc);
        const program = this.Program(repairedBlock.program, blockParams), inverse = repairedBlock.inverse ? this.Program(repairedBlock.inverse, []) : null, node = b.block({
            path: path,
            params: params,
            hash: hash,
            defaultBlock: program,
            elseBlock: inverse,
            loc: this.source.spanFor(block.loc),
            openStrip: block.openStrip,
            inverseStrip: block.inverseStrip,
            closeStrip: block.closeStrip
        });
        appendChild(this.currentElement(), node);
    }
    MustacheStatement(rawMustache) {
        this.pendingError?.mustache(this.source.spanFor(rawMustache.loc));
        const {tokenizer: tokenizer} = this;
        if ("comment" === tokenizer.state) return void this.appendToCommentData(this.sourceForNode(rawMustache));
        let mustache;
        const {escaped: escaped, loc: loc, strip: strip} = rawMustache;
        if ("original" in rawMustache.path && "...attributes" === rawMustache.path.original) throw generateSyntaxError("Illegal use of ...attributes", this.source.spanFor(rawMustache.loc));
        if (isHBSLiteral(rawMustache.path)) mustache = b.mustache({
            path: this.acceptNode(rawMustache.path),
            params: [],
            hash: b.hash({
                pairs: [],
                loc: this.source.spanFor(rawMustache.path.loc).collapse("end")
            }),
            trusting: !escaped,
            loc: this.source.spanFor(loc),
            strip: strip
        }); else {
            const {path: path, params: params, hash: hash} = acceptCallNodes(this, rawMustache);
            mustache = b.mustache({
                path: path,
                params: params,
                hash: hash,
                trusting: !escaped,
                loc: this.source.spanFor(loc),
                strip: strip
            });
        }
        switch (tokenizer.state) {
          // Tag helpers
            case "tagOpen":
          case "tagName":
            throw generateSyntaxError("Cannot use mustaches in an elements tagname", mustache.loc);

          case "beforeAttributeName":
            addElementModifier(this.currentStartTag, mustache);
            break;

          case "attributeName":
          case "afterAttributeName":
            this.beginAttributeValue(!1), this.finishAttributeValue(), addElementModifier(this.currentStartTag, mustache), 
            tokenizer.transitionTo("beforeAttributeName");
            break;

          case "afterAttributeValueQuoted":
            addElementModifier(this.currentStartTag, mustache), tokenizer.transitionTo("beforeAttributeName");
            break;

            // Attribute values
                      case "beforeAttributeValue":
            this.beginAttributeValue(!1), this.appendDynamicAttributeValuePart(mustache), tokenizer.transitionTo("attributeValueUnquoted");
            break;

          case "attributeValueDoubleQuoted":
          case "attributeValueSingleQuoted":
          case "attributeValueUnquoted":
            this.appendDynamicAttributeValuePart(mustache);
            break;

            // TODO: Only append child when the tokenizer state makes
            // sense to do so, otherwise throw an error.
                      default:
            appendChild(this.currentElement(), mustache);
        }
        return mustache;
    }
    appendDynamicAttributeValuePart(part) {
        this.finalizeTextPart();
        const attr = this.currentAttr;
        attr.isDynamic = !0, attr.parts.push(part);
    }
    finalizeTextPart() {
        const text = this.currentAttr.currentPart;
        null !== text && (this.currentAttr.parts.push(text), this.startTextPart());
    }
    startTextPart() {
        this.currentAttr.currentPart = null;
    }
    ContentStatement(content) {
        !function(tokenizer, content) {
            let line = content.loc.start.line, column = content.loc.start.column;
            const offsets = function(/** @type {string} */ original, /** @type {string} */ value) {
                if ("" === value) 
                // if it is empty, just return the count of newlines
                // in original
                return {
                    lines: original.split("\n").length - 1,
                    columns: 0
                };
                // otherwise, return the number of newlines prior to
                // `value`
                                const [difference] = original.split(value), lines = difference.split(/\n/u), lineCount = lines.length - 1;
                return {
                    lines: lineCount,
                    columns: lines[lineCount].length
                };
            }(content.original, content.value);
            line += offsets.lines, offsets.lines ? column = offsets.columns : column += offsets.columns, 
            tokenizer.line = line, tokenizer.column = column;
        }(this.tokenizer, content), this.tokenizer.tokenizePart(content.value), this.tokenizer.flushData();
    }
    CommentStatement(rawComment) {
        const {tokenizer: tokenizer} = this;
        if ("comment" === tokenizer.state) return this.appendToCommentData(this.sourceForNode(rawComment)), 
        null;
        const {value: value, loc: loc} = rawComment, comment = b.mustacheComment({
            value: value,
            loc: this.source.spanFor(loc)
        });
        switch (tokenizer.state) {
          case "beforeAttributeName":
          case "afterAttributeName":
            this.currentStartTag.comments.push(comment);
            break;

          case "beforeData":
          case "data":
            appendChild(this.currentElement(), comment);
            break;

          default:
            throw generateSyntaxError(`Using a Handlebars comment when in the \`${tokenizer.state}\` state is not supported`, this.source.spanFor(rawComment.loc));
        }
        return comment;
    }
    PartialStatement(partial) {
        throw generateSyntaxError("Handlebars partials are not supported", this.source.spanFor(partial.loc));
    }
    PartialBlockStatement(partialBlock) {
        throw generateSyntaxError("Handlebars partial blocks are not supported", this.source.spanFor(partialBlock.loc));
    }
    Decorator(decorator) {
        throw generateSyntaxError("Handlebars decorators are not supported", this.source.spanFor(decorator.loc));
    }
    DecoratorBlock(decoratorBlock) {
        throw generateSyntaxError("Handlebars decorator blocks are not supported", this.source.spanFor(decoratorBlock.loc));
    }
    SubExpression(sexpr) {
        const {path: path, params: params, hash: hash} = acceptCallNodes(this, sexpr);
        return b.sexpr({
            path: path,
            params: params,
            hash: hash,
            loc: this.source.spanFor(sexpr.loc)
        });
    }
    PathExpression(path) {
        const {original: original} = path;
        let parts;
        if (-1 !== original.indexOf("/")) {
            if ("./" === original.slice(0, 2)) throw generateSyntaxError('Using "./" is not supported in Glimmer and unnecessary', this.source.spanFor(path.loc));
            if ("../" === original.slice(0, 3)) throw generateSyntaxError('Changing context using "../" is not supported in Glimmer', this.source.spanFor(path.loc));
            if (-1 !== original.indexOf(".")) throw generateSyntaxError("Mixing '.' and '/' in paths is not supported in Glimmer; use only '.' to separate property paths", this.source.spanFor(path.loc));
            parts = [ path.parts.join("/") ];
        } else {
            if ("." === original) throw generateSyntaxError("'.' is not a supported path in Glimmer; check for a path with a trailing '.'", this.source.spanFor(path.loc));
            parts = path.parts;
        }
        let pathHead, thisHead = !1;
        // This is to fix a bug in the Handlebars AST where the path expressions in
        // `{{this.foo}}` (and similarly `{{foo-bar this.foo named=this.foo}}` etc)
        // are simply turned into `{{foo}}`. The fix is to push it back onto the
        // parts array and let the runtime see the difference. However, we cannot
        // simply use the string `this` as it means literally the property called
        // "this" in the current context (it can be expressed in the syntax as
        // `{{[this]}}`, where the square bracket are generally for this kind of
        // escaping – such as `{{foo.["bar.baz"]}}` would mean lookup a property
        // named literally "bar.baz" on `this.foo`). By convention, we use `null`
        // for this purpose.
                if (/^this(?:\..+)?$/u.test(original) && (thisHead = !0), thisHead) pathHead = b.this({
            loc: this.source.spanFor({
                start: path.loc.start,
                end: {
                    line: path.loc.start.line,
                    column: path.loc.start.column + 4
                }
            })
        }); else if (path.data) {
            const head = parts.shift();
            if (void 0 === head) throw generateSyntaxError("Attempted to parse a path expression, but it was not valid. Paths beginning with @ must start with a-z.", this.source.spanFor(path.loc));
            pathHead = b.atName({
                name: `@${head}`,
                loc: this.source.spanFor({
                    start: path.loc.start,
                    end: {
                        line: path.loc.start.line,
                        column: path.loc.start.column + head.length + 1
                    }
                })
            });
        } else {
            const head = parts.shift();
            if (void 0 === head) throw generateSyntaxError("Attempted to parse a path expression, but it was not valid. Paths must start with a-z or A-Z.", this.source.spanFor(path.loc));
            pathHead = b.var({
                name: head,
                loc: this.source.spanFor({
                    start: path.loc.start,
                    end: {
                        line: path.loc.start.line,
                        column: path.loc.start.column + head.length
                    }
                })
            });
        }
        return b.path({
            head: pathHead,
            tail: parts,
            loc: this.source.spanFor(path.loc)
        });
    }
    Hash(hash) {
        const pairs = hash.pairs.map((pair => b.pair({
            key: pair.key,
            value: this.acceptNode(pair.value),
            loc: this.source.spanFor(pair.loc)
        })));
        return b.hash({
            pairs: pairs,
            loc: this.source.spanFor(hash.loc)
        });
    }
    StringLiteral(string) {
        return b.literal({
            type: "StringLiteral",
            value: string.value,
            loc: this.source.spanFor(string.loc)
        });
    }
    BooleanLiteral(boolean) {
        return b.literal({
            type: "BooleanLiteral",
            value: boolean.value,
            loc: this.source.spanFor(boolean.loc)
        });
    }
    NumberLiteral(number) {
        return b.literal({
            type: "NumberLiteral",
            value: number.value,
            loc: this.source.spanFor(number.loc)
        });
    }
    UndefinedLiteral(undef) {
        return b.literal({
            type: "UndefinedLiteral",
            value: void 0,
            loc: this.source.spanFor(undef.loc)
        });
    }
    NullLiteral(nul) {
        return b.literal({
            type: "NullLiteral",
            value: null,
            loc: this.source.spanFor(nul.loc)
        });
    }
    constructor(...args) {
        super(...args), // Because we interleave the HTML and HBS parsing, sometimes the HTML
        // tokenizer can run out of tokens when we switch into {{...}} or reached
        // EOF. There are positions where neither of these are expected, and it would
        // like to generate an error, but there is no span to attach the error to.
        // This allows the HTML tokenization to stash an error message and the next
        // mustache visitor will attach the message to the appropriate span and throw
        // the error.
        this.pendingError = null;
    }
}

function acceptCallNodes(/** @type {HandlebarsNodeVisitors} */ compiler, node) {
    let path;
    switch (node.path.type) {
      case "PathExpression":
        path = compiler.PathExpression(node.path);
        break;

      case "SubExpression":
        path = compiler.SubExpression(node.path);
        break;

      case "StringLiteral":
      case "UndefinedLiteral":
      case "NullLiteral":
      case "NumberLiteral":
      case "BooleanLiteral":
        {
            let value;
            throw value = "BooleanLiteral" === node.path.type ? node.path.original.toString() : "StringLiteral" === node.path.type ? `"${node.path.original}"` : "NullLiteral" === node.path.type ? "null" : "NumberLiteral" === node.path.type ? node.path.value.toString() : "undefined", 
            generateSyntaxError(`${node.path.type} "${"StringLiteral" === node.path.type ? node.path.original : value}" cannot be called as a sub-expression, replace (${value}) with ${value}`, compiler.source.spanFor(node.path.loc));
        }
    }
    const params = node.params.map((e => compiler.acceptNode(e))), end = isPresentArray(params) ? getLast(params).loc : path.loc;
    // if there is no hash, position it as a collapsed node immediately after the last param (or the
    // path, if there are also no params)
        return {
        path: path,
        params: params,
        hash: node.hash ? compiler.Hash(node.hash) : b.hash({
            pairs: [],
            loc: compiler.source.spanFor(end).collapse("end")
        })
    };
}

function addElementModifier(element, mustache) {
    const {path: path, params: params, hash: hash, loc: loc} = mustache;
    if (isHBSLiteral(path)) {
        const modifier = `{{${function(literal) {
            return "UndefinedLiteral" === literal.type ? "undefined" : JSON.stringify(literal.value);
        }(path)}}}`;
        throw generateSyntaxError(`In <${element.name} ... ${modifier} ..., ${modifier} is not a valid modifier`, mustache.loc);
    }
    const modifier = b.elementModifier({
        path: path,
        params: params,
        hash: hash,
        loc: loc
    });
    element.modifiers.push(modifier);
}

function repairBlock(/** @type {Source} */ source, block, /** @type {SourceSpan} */ fallbackStart) {
    // Extend till the beginning of the block
    if (!block.program.loc) {
        const start = block.program.body.at(0), end = block.program.body.at(-1);
        if (start && end) block.program.loc = {
            ...start.loc,
            end: end.loc.end
        }; else {
            const loc = source.spanFor(block.loc);
            block.program.loc = fallbackStart.withEnd(loc.getEnd());
        }
    }
    let endProgram = source.spanFor(block.program.loc).getEnd();
    return block.inverse && !block.inverse.loc && (block.inverse.loc = endProgram.collapsed()), 
    block;
}

// vendored from simple-html-tokenizer because it's unexported
/** @returns {boolean} */ function isSpace(/** @type {string} */ char) {
    return /[\t\n\f ]/u.test(char);
}

class TokenizerEventHandlers extends HandlebarsNodeVisitors {
    reset() {
        this.currentNode = null;
    }
    // Comment
    beginComment() {
        this.currentNode = {
            type: "CommentStatement",
            value: "",
            start: this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn)
        };
    }
    appendToCommentData(/** @type {string} */ char) {
        this.currentComment.value += char;
    }
    finishComment() {
        appendChild(this.currentElement(), b.comment(this.finish(this.currentComment)));
    }
    // Data
    beginData() {
        this.currentNode = {
            type: "TextNode",
            chars: "",
            start: this.offset()
        };
    }
    appendToData(/** @type {string} */ char) {
        this.currentData.chars += char;
    }
    finishData() {
        appendChild(this.currentElement(), b.text(this.finish(this.currentData)));
    }
    // Tags - basic
    tagOpen() {
        this.tagOpenLine = this.tokenizer.line, this.tagOpenColumn = this.tokenizer.column;
    }
    beginStartTag() {
        this.currentNode = {
            type: "StartTag",
            name: "",
            nameStart: null,
            nameEnd: null,
            attributes: [],
            modifiers: [],
            comments: [],
            params: [],
            selfClosing: !1,
            start: this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn)
        };
    }
    beginEndTag() {
        this.currentNode = {
            type: "EndTag",
            name: "",
            start: this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn)
        };
    }
    finishTag() {
        let tag = this.finish(this.currentTag);
        if ("StartTag" === tag.type) {
            if (this.finishStartTag(), ":" === tag.name) throw generateSyntaxError("Invalid named block named detected, you may have created a named block without a name, or you may have began your name with a number. Named blocks must have names that are at least one character long, and begin with a lower case letter", this.source.spanFor({
                start: this.currentTag.start.toJSON(),
                end: this.offset().toJSON()
            }));
            (voidMap.has(tag.name) || tag.selfClosing) && this.finishEndTag(!0);
        } else tag.type, tag.type, this.finishEndTag(!1);
    }
    finishStartTag() {
        let {name: name, nameStart: nameStart, nameEnd: nameEnd} = this.currentStartTag, nameLoc = nameStart.until(nameEnd), [head, ...tail] = name.split("."), path = b.path({
            head: b.head({
                original: head,
                loc: nameLoc.sliceStartChars({
                    chars: head.length
                })
            }),
            tail: tail,
            loc: nameLoc
        }), {attributes: attributes, modifiers: modifiers, comments: comments, params: params, selfClosing: selfClosing, loc: loc} = this.finish(this.currentStartTag), element = b.element({
            path: path,
            selfClosing: selfClosing,
            attributes: attributes,
            modifiers: modifiers,
            comments: comments,
            params: params,
            children: [],
            openTag: loc,
            closeTag: selfClosing ? null : SourceSpan.broken(),
            loc: loc
        });
        this.elementStack.push(element);
    }
    finishEndTag(/** @type {boolean} */ isVoid) {
        let {start: closeTagStart} = this.currentTag, tag = this.finish(this.currentTag), element = this.elementStack.pop();
        this.validateEndTag(tag, element, isVoid);
        let parent = this.currentElement();
        isVoid ? element.closeTag = null : element.selfClosing ? element.closeTag : element.closeTag = closeTagStart.until(this.offset()), 
        element.loc = element.loc.withEnd(this.offset()), appendChild(parent, b.element(element));
    }
    markTagAsSelfClosing() {
        let tag = this.currentTag;
        if ("StartTag" !== tag.type) throw generateSyntaxError("Invalid end tag: closing tag must not be self-closing", this.source.spanFor({
            start: tag.start.toJSON(),
            end: this.offset().toJSON()
        }));
        tag.selfClosing = !0;
    }
    // Tags - name
    appendToTagName(/** @type {string} */ char) {
        let tag = this.currentTag;
        if (tag.name += char, "StartTag" === tag.type) {
            let offset = this.offset();
            null === tag.nameStart && (tag.nameEnd, 
            // Note that the tokenizer already consumed the token here
            tag.nameStart = offset.move(-1)), tag.nameEnd = offset;
        }
    }
    // Tags - attributes
    beginAttribute() {
        let offset = this.offset();
        this.currentAttribute = {
            name: "",
            parts: [],
            currentPart: null,
            isQuoted: !1,
            isDynamic: !1,
            start: offset,
            valueSpan: offset.collapsed()
        };
    }
    appendToAttributeName(/** @type {string} */ char) {
        this.currentAttr.name += char, 
        // The block params parsing code can actually handle peek=non-space just
        // fine, but this check was added as an optimization, as there is a little
        // bit of setup overhead for the parsing logic just to immediately bail
        "as" === this.currentAttr.name && this.parsePossibleBlockParams();
    }
    beginAttributeValue(/** @type {boolean} */ isQuoted) {
        this.currentAttr.isQuoted = isQuoted, this.startTextPart(), this.currentAttr.valueSpan = this.offset().collapsed();
    }
    appendToAttributeValue(/** @type {string} */ char) {
        let parts = this.currentAttr.parts, lastPart = parts[parts.length - 1], current = this.currentAttr.currentPart;
        if (current) current.chars += char, 
        // update end location for each added char
        current.loc = current.loc.withEnd(this.offset()); else {
            // initially assume the text node is a single char
            let loc = this.offset();
            // the tokenizer line/column have already been advanced, correct location info
                        loc = "\n" === char ? lastPart ? lastPart.loc.getEnd() : this.currentAttr.valueSpan.getStart() : loc.move(-1), 
            this.currentAttr.currentPart = b.text({
                chars: char,
                loc: loc.collapsed()
            });
        }
    }
    finishAttributeValue() {
        this.finalizeTextPart();
        let tag = this.currentTag, tokenizerPos = this.offset();
        if ("EndTag" === tag.type) throw generateSyntaxError("Invalid end tag: closing tag must not have attributes", this.source.spanFor({
            start: tag.start.toJSON(),
            end: tokenizerPos.toJSON()
        }));
        let {name: name, parts: parts, start: start, isQuoted: isQuoted, isDynamic: isDynamic, valueSpan: valueSpan} = this.currentAttr;
        // Just trying to be helpful with `<Hello |foo|>` rather than letting it through as an attribute
                if (name.startsWith("|") && 0 === parts.length && !isQuoted && !isDynamic) throw generateSyntaxError("Invalid block parameters syntax: block parameters must be preceded by the `as` keyword", start.until(start.move(name.length)));
        let value = this.assembleAttributeValue(parts, isQuoted, isDynamic, start.until(tokenizerPos));
        value.loc = valueSpan.withEnd(tokenizerPos);
        let attribute = b.attr({
            name: name,
            value: value,
            loc: start.until(tokenizerPos)
        });
        this.currentStartTag.attributes.push(attribute);
    }
    parsePossibleBlockParams() {
        // const enums that we can't use directly
        const ID_INVERSE_PATTERN = /[!"#%&'()*+./;<=>@[\\\]^`{|}~]/u;
        this.tokenizer.state;
        const element = this.currentStartTag, as = this.currentAttr;
        let state = {
            state: "PossibleAs"
        };
        const handlers = {
            PossibleAs: (/** @type {string} */ next) => {
                if (state.state, isSpace(next)) 
                // " as ..."
                state = {
                    state: "BeforeStartPipe"
                }, this.tokenizer.transitionTo("afterAttributeName"), this.tokenizer.consume(); else {
                    if ("|" === next) 
                    // " as|..."
                    // Following Handlebars and require a space between "as" and the pipe
                    throw generateSyntaxError('Invalid block parameters syntax: expecting at least one space character between "as" and "|"', as.start.until(this.offset().move(1)));
                    // " as{{...", " async...", " as=...", " as>...", " as/>..."
                    // Don't consume, let the normal tokenizer code handle the next steps
                    state = {
                        state: "Done"
                    };
                }
            },
            BeforeStartPipe: (/** @type {string} */ next) => {
                state.state, isSpace(next) ? this.tokenizer.consume() : "|" === next ? (state = {
                    state: "BeforeBlockParamName"
                }, this.tokenizer.transitionTo("beforeAttributeName"), this.tokenizer.consume()) : 
                // " as {{...", " as bs...", " as =...", " as ...", " as/>..."
                // Don't consume, let the normal tokenizer code handle the next steps
                state = {
                    state: "Done"
                };
            },
            BeforeBlockParamName: (/** @type {string} */ next) => {
                if (state.state, isSpace(next)) this.tokenizer.consume(); else if ("" === next) 
                // The HTML tokenizer ran out of characters, so we are either
                // encountering mustache or <EOF>
                state = {
                    state: "Done"
                }, this.pendingError = {
                    mustache(loc) {
                        throw generateSyntaxError("Invalid block parameters syntax: mustaches cannot be used inside parameters list", loc);
                    },
                    eof(loc) {
                        throw generateSyntaxError('Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list', as.start.until(loc));
                    }
                }; else if ("|" === next) {
                    if (0 === element.params.length) 
                    // Following Handlebars and treat empty block params a syntax error
                    throw generateSyntaxError("Invalid block parameters syntax: empty parameters list, expecting at least one identifier", as.start.until(this.offset().move(1)));
                    state = {
                        state: "AfterEndPipe"
                    }, this.tokenizer.consume();
                } else {
                    if (">" === next || "/" === next) throw generateSyntaxError('Invalid block parameters syntax: incomplete parameters list, expecting "|" but the tag was closed prematurely', as.start.until(this.offset().move(1)));
                    // slurp up anything else into the name, validate later
                    state = {
                        state: "BlockParamName",
                        name: next,
                        start: this.offset()
                    }, this.tokenizer.consume();
                }
            },
            BlockParamName: (/** @type {string} */ next) => {
                if (state.state, "" === next) 
                // The HTML tokenizer ran out of characters, so we are either
                // encountering mustache or <EOF>, HBS side will attach the error
                // to the next span
                state = {
                    state: "Done"
                }, this.pendingError = {
                    mustache(loc) {
                        throw generateSyntaxError("Invalid block parameters syntax: mustaches cannot be used inside parameters list", loc);
                    },
                    eof(loc) {
                        throw generateSyntaxError('Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list', as.start.until(loc));
                    }
                }; else if ("|" === next || isSpace(next)) {
                    let loc = state.start.until(this.offset());
                    if ("this" === state.name || ID_INVERSE_PATTERN.test(state.name)) throw generateSyntaxError(`Invalid block parameters syntax: invalid identifier name \`${state.name}\``, loc);
                    element.params.push(b.var({
                        name: state.name,
                        loc: loc
                    })), state = "|" === next ? {
                        state: "AfterEndPipe"
                    } : {
                        state: "BeforeBlockParamName"
                    }, this.tokenizer.consume();
                } else {
                    if (">" === next || "/" === next) throw generateSyntaxError('Invalid block parameters syntax: expecting "|" but the tag was closed prematurely', as.start.until(this.offset().move(1)));
                    // slurp up anything else into the name, validate later
                    state.name += next, this.tokenizer.consume();
                }
            },
            AfterEndPipe: (/** @type {string} */ next) => {
                state.state, isSpace(next) ? this.tokenizer.consume() : "" === next ? (
                // The HTML tokenizer ran out of characters, so we are either
                // encountering mustache or <EOF>, HBS side will attach the error
                // to the next span
                state = {
                    state: "Done"
                }, this.pendingError = {
                    mustache(loc) {
                        throw generateSyntaxError("Invalid block parameters syntax: modifiers cannot follow parameters list", loc);
                    },
                    eof(loc) {
                        throw generateSyntaxError('Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list', as.start.until(loc));
                    }
                }) : ">" === next || "/" === next ? 
                // Don't consume, let the normal tokenizer code handle the next steps
                state = {
                    state: "Done"
                } : (
                // Slurp up the next "token" for the error span
                state = {
                    state: "Error",
                    message: 'Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list',
                    start: this.offset()
                }, this.tokenizer.consume());
            },
            Error: next => {
                if (state.state, "" === next || "/" === next || ">" === next || isSpace(next)) throw generateSyntaxError(state.message, state.start.until(this.offset()));
                // Slurp up the next "token" for the error span
                this.tokenizer.consume();
            },
            Done: () => {}
        };
        let next;
        do {
            next = this.tokenizer.peek(), handlers[state.state](next);
        } while ("Done" !== state.state && "" !== next);
        state.state;
    }
    reportSyntaxError(message) {
        throw generateSyntaxError(message, this.offset().collapsed());
    }
    assembleConcatenatedValue(/** @type {any[]} */ parts) {
        let first = getFirst(parts), last = getLast(parts);
        return b.concat({
            parts: parts,
            loc: this.source.spanFor(first.loc).extend(this.source.spanFor(last.loc))
        });
    }
    validateEndTag(tag, element, /** @type {boolean} */ selfClosing) {
        if (voidMap.has(tag.name) && !selfClosing) 
        // EngTag is also called by StartTag for void and self-closing tags (i.e.
        // <input> or <br />, so we need to check for that here. Otherwise, we would
        // throw an error for those cases.
        throw generateSyntaxError(`<${tag.name}> elements do not need end tags. You should remove it`, tag.loc);
        if ("ElementNode" !== element.type) throw generateSyntaxError(`Closing tag </${tag.name}> without an open tag`, tag.loc);
        if (element.tag !== tag.name) throw generateSyntaxError(`Closing tag </${tag.name}> did not match last open tag <${element.tag}> (on line ${element.loc.startPosition.line})`, tag.loc);
    }
    assembleAttributeValue(/** @type {any[]} */ parts, /** @type {boolean} */ isQuoted, /** @type {boolean} */ isDynamic, /** @type {SourceSpan} */ span) {
        if (isDynamic) {
            if (isQuoted) return this.assembleConcatenatedValue(parts);
            {
                const [head, a] = parts;
                if (void 0 === a || "TextNode" === a.type && "/" === a.chars) return head;
                throw generateSyntaxError("An unquoted attribute value must be a string or a mustache, preceded by whitespace or a '=' character, and followed by whitespace, a '>' character, or '/>'", span);
            }
        }
        return isPresentArray(parts) ? parts[0] : b.text({
            chars: "",
            loc: span
        });
    }
    constructor(...args) {
        super(...args), this.tagOpenLine = 0, this.tagOpenColumn = 0;
    }
}

const syntax = {
    parse: preprocess,
    builders: publicBuilder,
    print: build,
    traverse: traverse,
    Walker: Walker
};

class CodemodEntityParser extends EntityParser {
    // match upstream types, but never match an entity
    constructor() {
        super({});
    }
    parse() {}
}

function preprocess(/** @type {string | undefined} */ input, options = {}) {
    let source, ast, entityParser, mode = options.mode || "precompile";
    "string" == typeof input ? (source = new Source(input, options.meta?.moduleName), 
    ast = "codemod" === mode ? parseWithoutProcessing(input, options.parseOptions) : parse(input, options.parseOptions)) : input instanceof Source ? (source = input, 
    ast = "codemod" === mode ? parseWithoutProcessing(input.source, options.parseOptions) : parse(input.source, options.parseOptions)) : (source = new Source("", options.meta?.moduleName), 
    ast = input), "codemod" === mode && (entityParser = new CodemodEntityParser);
    let offsets = SourceSpan.forCharPositions(source, 0, source.source.length);
    ast.loc = {
        source: "(program)",
        start: offsets.startPosition,
        end: offsets.endPosition
    };
    let template = new TokenizerEventHandlers(source, entityParser, mode).parse(ast, options.locals ?? []);
    if (options.plugins?.ast) for (const transform of options.plugins.ast) traverse(template, transform(assign({}, options, {
        syntax: syntax
    }, {
        plugins: void 0
    })).visitor);
    return template;
}

/**
 * Gets the correct Token from the Node based on it's type
 */
/**
 * Adds tokens to the tokensSet based on their node.type
 */
function addTokens(tokensSet, node, scopedTokens, options) {
    const maybePathName = function(node, scopedTokens, options) {
        if ("PathExpression" === node.type) {
            if ("AtHead" === node.head.type || "ThisHead" === node.head.type) return;
            const possbleToken = node.head.name;
            if (-1 === scopedTokens.indexOf(possbleToken)) return possbleToken;
        } else if ("ElementNode" === node.type) {
            const {tag: tag} = node, char = tag.charAt(0);
            if (":" === char || "@" === char) return;
            if (!options.includeHtmlElements && -1 === tag.indexOf(".") && tag.toLowerCase() === tag) return;
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- @fixme
                        if ("this." === tag.substr(0, 5)) return;
            // the tag may be from a yielded object
            // example:
            //   <x.button>
            // An ElementNode does not parse the "tag" in to a PathExpression
            // so we have to split on `.`, just like how `this` presence is checked.
                        if (tag.includes(".")) {
                let [potentialLocal] = tag.split(".");
                if (scopedTokens.includes(potentialLocal)) return;
            }
            if (scopedTokens.includes(tag)) return;
            return tag;
        }
    }(node, scopedTokens, options);
    if (void 0 !== maybePathName && "@" !== maybePathName[0]) {
        const maybeFirstPathSegment = maybePathName.split(".")[0];
        maybeFirstPathSegment && !scopedTokens.includes(maybeFirstPathSegment) && tokensSet.add(maybeFirstPathSegment);
    }
}

/**
 * Parses and traverses a given handlebars html template to extract all template locals
 * referenced that could possible come from the parent scope. Can exclude known keywords
 * optionally.
 */ function getTemplateLocals(html, options = {
    includeHtmlElements: !1,
    includeKeywords: !1
}) {
    const ast = preprocess(html), tokensSet = new Set, scopedTokens = [];
    traverse(ast, {
        Block: {
            enter({blockParams: blockParams}) {
                blockParams.forEach((param => {
                    scopedTokens.push(param);
                }));
            },
            exit({blockParams: blockParams}) {
                blockParams.forEach((() => {
                    scopedTokens.pop();
                }));
            }
        },
        ElementNode: {
            enter(node) {
                node.blockParams.forEach((param => {
                    scopedTokens.push(param);
                })), addTokens(tokensSet, node, scopedTokens, options);
            },
            exit({blockParams: blockParams}) {
                blockParams.forEach((() => {
                    scopedTokens.pop();
                }));
            }
        },
        PathExpression(node) {
            addTokens(tokensSet, node, scopedTokens, options);
        }
    });
    let tokens = [];
    return tokensSet.forEach((s => tokens.push(s))), options.includeKeywords || (tokens = tokens.filter((token => !isKeyword(token)))), 
    tokens;
}

function node(/** @type {string | undefined} */ name) {
    if (void 0 !== name) {
        const type = name;
        return {
            fields: () => class {
                constructor(fields) {
                    this.type = type, assign(this, fields);
                }
            }
        };
    }
    return {
        fields: () => class {
            constructor(fields) {
                assign(this, fields);
            }
        }
    };
}

/**
 * Corresponds to syntaxes with positional and named arguments:
 *
 * - SubExpression
 * - Invoking Append
 * - Invoking attributes
 * - InvokeBlock
 *
 * If `Args` is empty, the `SourceOffsets` for this node should be the collapsed position
 * immediately after the parent call node's `callee`.
 */ class Args extends(node().fields()){
    static empty(loc) {
        return new Args({
            loc: loc,
            positional: PositionalArguments.empty(loc),
            named: NamedArguments.empty(loc)
        });
    }
    static named(named) {
        return new Args({
            loc: named.loc,
            positional: PositionalArguments.empty(named.loc.collapse("end")),
            named: named
        });
    }
    nth(offset) {
        return this.positional.nth(offset);
    }
    get(name) {
        return this.named.get(name);
    }
    isEmpty() {
        return this.positional.isEmpty() && this.named.isEmpty();
    }
}

/**
 * Corresponds to positional arguments.
 *
 * If `PositionalArguments` is empty, the `SourceOffsets` for this node should be the collapsed
 * position immediately after the parent call node's `callee`.
 */ class PositionalArguments extends(node().fields()){
    static empty(loc) {
        return new PositionalArguments({
            loc: loc,
            exprs: []
        });
    }
    get size() {
        return this.exprs.length;
    }
    nth(offset) {
        return this.exprs[offset] || null;
    }
    isEmpty() {
        return 0 === this.exprs.length;
    }
}

/**
 * Corresponds to named arguments.
 *
 * If `PositionalArguments` and `NamedArguments` are empty, the `SourceOffsets` for this node should
 * be the same as the `Args` node that contains this node.
 *
 * If `PositionalArguments` is not empty but `NamedArguments` is empty, the `SourceOffsets` for this
 * node should be the collapsed position immediately after the last positional argument.
 */ class NamedArguments extends(node().fields()){
    static empty(loc) {
        return new NamedArguments({
            loc: loc,
            entries: []
        });
    }
    get size() {
        return this.entries.length;
    }
    get(name) {
        let entry = this.entries.filter((e => e.name.chars === name))[0];
        return entry ? entry.value : null;
    }
    isEmpty() {
        return 0 === this.entries.length;
    }
}

/**
 * Corresponds to a single named argument.
 *
 * ```hbs
 * x=<expr>
 * ```
 */ class NamedArgument {
    constructor(options) {
        this.loc = options.name.loc.extend(options.value.loc), this.name = options.name, 
        this.value = options.value;
    }
}

/**
 * `HtmlAttr` nodes are valid HTML attributes, with or without a value.
 *
 * Exceptions:
 *
 * - `...attributes` is `SplatAttr`
 * - `@x=<value>` is `ComponentArg`
 */ class HtmlAttr extends(node("HtmlAttr").fields()){}

class SplatAttr extends(node("SplatAttr").fields()){}

/**
 * Corresponds to an argument passed by a component (`@x=<value>`)
 */ class ComponentArg extends(node().fields()){
    /**
   * Convert the component argument into a named argument node
   */
    toNamedArgument() {
        return new NamedArgument({
            name: this.name,
            value: this.value
        });
    }
}

/**
 * An `ElementModifier` is just a normal call node in modifier position.
 */ class ElementModifier extends(node("ElementModifier").fields()){}

class GlimmerComment extends(node("GlimmerComment").fields()){}

class HtmlText extends(node("HtmlText").fields()){}

class HtmlComment extends(node("HtmlComment").fields()){}

class AppendContent extends(node("AppendContent").fields()){
    get callee() {
        return "Call" === this.value.type ? this.value.callee : this.value;
    }
    get args() {
        return "Call" === this.value.type ? this.value.args : Args.empty(this.value.loc.collapse("end"));
    }
}

class InvokeBlock extends(node("InvokeBlock").fields()){}

/**
 * Corresponds to a component invocation. When the content of a component invocation contains no
 * named blocks, `blocks` contains a single named block named `"default"`. When a component
 * invocation is self-closing, `blocks` is empty.
 */ class InvokeComponent extends(node("InvokeComponent").fields()){
    get args() {
        let entries = this.componentArgs.map((a => a.toNamedArgument()));
        return Args.named(new NamedArguments({
            loc: SpanList.range(entries, this.callee.loc.collapse("end")),
            entries: entries
        }));
    }
}

/**
 * Corresponds to a simple HTML element. The AST allows component arguments and modifiers to support
 * future extensions.
 */ class SimpleElement extends(node("SimpleElement").fields()){
    get args() {
        let entries = this.componentArgs.map((a => a.toNamedArgument()));
        return Args.named(new NamedArguments({
            loc: SpanList.range(entries, this.tag.loc.collapse("end")),
            entries: entries
        }));
    }
}

/**
 * Corresponds to a Handlebars literal.
 *
 * @see {LiteralValue}
 */ class LiteralExpression extends(node("Literal").fields()){
    toSlice() {
        return new SourceSlice({
            loc: this.loc,
            chars: this.value
        });
    }
}

/**
 * Returns true if an input {@see ExpressionNode} is a literal.
 */
/**
 * Corresponds to a path in expression position.
 *
 * ```hbs
 * this
 * this.x
 * @x
 * @x.y
 * x
 * x.y
 * ```
 */
class PathExpression extends(node("Path").fields()){}

/**
 * Corresponds to a known strict-mode keyword. It behaves similarly to a
 * PathExpression with a FreeVarReference, but implies StrictResolution and
 * is guaranteed to not have a tail, since `{{outlet.foo}}` would have been
 * illegal.
 */ class KeywordExpression extends(node("Keyword").fields()){}

/**
 * Corresponds to a parenthesized call expression.
 *
 * ```hbs
 * (x)
 * (x.y)
 * (x y)
 * (x.y z)
 * ```
 */ class CallExpression extends(node("Call").fields()){}

/**
 * Corresponds to an interpolation in attribute value position.
 *
 * ```hbs
 * <a href="{{url}}.html"
 * ```
 */ class InterpolateExpression extends(node("Interpolate").fields()){}

/**
 * Corresponds to an entire template.
 */ class Template extends(node().fields()){}

/**
 * Represents a block. In principle this could be merged with `NamedBlock`, because all cases
 * involving blocks have at least a notional name.
 */ class Block extends(node().fields()){}

/**
 * Corresponds to a collection of named blocks.
 */ class NamedBlocks extends(node().fields()){
    get(name) {
        return this.blocks.filter((block => block.name.chars === name))[0] || null;
    }
}

/**
 * Corresponds to a single named block. This is used for anonymous named blocks (`default` and
 * `else`).
 */ class NamedBlock extends(node().fields()){
    get args() {
        let entries = this.componentArgs.map((a => a.toNamedArgument()));
        return Args.named(new NamedArguments({
            loc: SpanList.range(entries, this.name.loc.collapse("end")),
            entries: entries
        }));
    }
}

/**
 * Corresponds to `this` at the head of an expression.
 */ class ThisReference extends(node("This").fields()){}

/**
 * Corresponds to `@<ident>` at the beginning of an expression.
 */ class ArgReference extends(node("Arg").fields()){}

/**
 * Corresponds to `<ident>` at the beginning of an expression, when `<ident>` is in the current
 * block's scope.
 */ class LocalVarReference extends(node("Local").fields()){}

/**
 * Corresponds to `<ident>` at the beginning of an expression, when `<ident>` is *not* in the
 * current block's scope.
 *
 * The `resolution: FreeVarResolution` field describes how to resolve the free variable.
 *
 * Note: In strict mode, it must always be a variable that is in a concrete JavaScript scope that
 * the template will be installed into.
 */ class FreeVarReference extends(node("Free").fields()){}

/// FreeVarNamespace ///
const STRICT_RESOLUTION = {
    resolution: () => SexpOpcodes.GetStrictKeyword,
    serialize: () => "Strict",
    isAngleBracket: !1
}, HTML_RESOLUTION = {
    ...STRICT_RESOLUTION,
    isAngleBracket: !0
};

/**
 * A `LooseModeResolution` includes one or more namespaces to resolve the variable in
 *
 * In practice, there are a limited number of possible combinations of these degrees of freedom,
 * and they are captured by the `Namespaces` union below.
 */
class LooseModeResolution {
    /**
   * Namespaced resolution is used in an unambiguous syntax position:
   *
   * 1. `(sexp)` (namespace: `Helper`)
   * 2. `{{#block}}` (namespace: `Component`)
   * 3. `<a {{modifier}}>` (namespace: `Modifier`)
   * 4. `<Component />` (namespace: `Component`)
   */
    static namespaced(namespace, isAngleBracket = !1) {
        return new LooseModeResolution([ namespace ], isAngleBracket);
    }
    /**
   * Append resolution is used when the variable should be resolved in both the `component` and
   * `helper` namespaces.
   *
   * ```hbs
   * {{x}}
   * ```
   *
   * ```hbs
   * {{x y}}
   * ```
   *
   * ^ In either case, `x` should be resolved in the `component` and `helper` namespaces.
   */    static append() {
        return new LooseModeResolution([ "Component", "Helper" ]);
    }
    /**
   * Trusting append resolution is used when the variable should be resolved only in the
   * `helper` namespaces.
   *
   * ```hbs
   * {{{x}}}
   * ```
   *
   * ```hbs
   * {{{x y}}}
   * ```
   *
   * ^ In either case, `x` should be resolved in the `helper` namespace.
   */    static trustingAppend() {
        return this.namespaced("Helper");
    }
    constructor(namespaces, isAngleBracket = !1) {
        this.namespaces = namespaces, this.isAngleBracket = isAngleBracket;
    }
    resolution() {
        if (1 !== this.namespaces.length) return SexpOpcodes.GetFreeAsComponentOrHelperHead;
        switch (this.namespaces[0]) {
          case "Helper":
            return SexpOpcodes.GetFreeAsHelperHead;

          case "Modifier":
            return SexpOpcodes.GetFreeAsModifierHead;

          case "Component":
            return SexpOpcodes.GetFreeAsComponentHead;
        }
    }
    serialize() {
        return 1 === this.namespaces.length ? this.namespaces[0] : "ComponentOrHelper";
    }
}

var api =  Object.freeze({
    __proto__: null,
    AppendContent: AppendContent,
    ArgReference: ArgReference,
    Args: Args,
    Block: Block,
    COMPONENT_NAMESPACE: "Component",
    CallExpression: CallExpression,
    ComponentArg: ComponentArg,
    ElementModifier: ElementModifier,
    FreeVarReference: FreeVarReference,
    GlimmerComment: GlimmerComment,
    HELPER_NAMESPACE: "Helper",
    HTML_RESOLUTION: HTML_RESOLUTION,
    HtmlAttr: HtmlAttr,
    HtmlComment: HtmlComment,
    HtmlText: HtmlText,
    InterpolateExpression: InterpolateExpression,
    InvokeBlock: InvokeBlock,
    InvokeComponent: InvokeComponent,
    KeywordExpression: KeywordExpression,
    LiteralExpression: LiteralExpression,
    LocalVarReference: LocalVarReference,
    LooseModeResolution: LooseModeResolution,
    MODIFIER_NAMESPACE: "Modifier",
    NamedArgument: NamedArgument,
    NamedArguments: NamedArguments,
    NamedBlock: NamedBlock,
    NamedBlocks: NamedBlocks,
    PathExpression: PathExpression,
    PositionalArguments: PositionalArguments,
    STRICT_RESOLUTION: STRICT_RESOLUTION,
    SimpleElement: SimpleElement,
    SplatAttr: SplatAttr,
    Template: Template,
    ThisReference: ThisReference,
    isLiteral: function(node, kind) {
        return "Literal" === node.type && (void 0 === kind || ("null" === kind ? null === node.value : typeof node.value === kind));
    },
    isStrictResolution: function(value) {
        return value === STRICT_RESOLUTION;
    },
    loadResolution: function(resolution) {
        return "Strict" === resolution ? STRICT_RESOLUTION : "ComponentOrHelper" === resolution ? LooseModeResolution.append() : LooseModeResolution.namespaced(resolution);
    },
    node: node
});

class SymbolTable {
    static top(locals, keywords, options) {
        return new ProgramSymbolTable(locals, keywords, options);
    }
    child(locals) {
        let symbols = locals.map((name => this.allocate(name)));
        return new BlockSymbolTable(this, locals, symbols);
    }
}

class ProgramSymbolTable extends SymbolTable {
    constructor(templateLocals, keywords, options) {
        super(), this.templateLocals = templateLocals, this.keywords = keywords, this.options = options, 
        this.symbols = [], this.upvars = [], this.size = 1, this.named = dict(), this.blocks = dict(), 
        this.usedTemplateLocals = [];
    }
    root() {
        return this;
    }
    hasLexical(name) {
        return this.options.lexicalScope(name);
    }
    hasKeyword(name) {
        return this.keywords.includes(name);
    }
    getKeyword(name) {
        return this.allocateFree(name, STRICT_RESOLUTION);
    }
    getUsedTemplateLocals() {
        return this.usedTemplateLocals;
    }
    has(name) {
        return this.templateLocals.includes(name);
    }
    get(name) {
        let index = this.usedTemplateLocals.indexOf(name);
        return -1 !== index || (index = this.usedTemplateLocals.length, this.usedTemplateLocals.push(name)), 
        [ index, !0 ];
    }
    getLocalsMap() {
        return dict();
    }
    getDebugInfo() {
        return [ this.getLocalsMap(), this.named ];
    }
    allocateFree(name, resolution) {
        // If the name in question is an uppercase (i.e. angle-bracket) component invocation, run
        // the optional `customizeComponentName` function provided to the precompiler.
        resolution.resolution() === SexpOpcodes.GetFreeAsComponentHead && resolution.isAngleBracket && (name = this.options.customizeComponentName(name));
        let index = this.upvars.indexOf(name);
        return -1 !== index || (index = this.upvars.length, this.upvars.push(name)), index;
    }
    allocateNamed(name) {
        let named = this.named[name];
        return named || (named = this.named[name] = this.allocate(name)), named;
    }
    allocateBlock(name) {
        "inverse" === name && (name = "else");
        let block = this.blocks[name];
        return block || (block = this.blocks[name] = this.allocate(`&${name}`)), block;
    }
    allocate(identifier) {
        return this.symbols.push(identifier), this.size++;
    }
}

class BlockSymbolTable extends SymbolTable {
    constructor(parent, symbols, slots) {
        super(), this.parent = parent, this.symbols = symbols, this.slots = slots;
    }
    root() {
        return this.parent.root();
    }
    get locals() {
        return this.symbols;
    }
    hasLexical(name) {
        return this.parent.hasLexical(name);
    }
    getKeyword(name) {
        return this.parent.getKeyword(name);
    }
    hasKeyword(name) {
        return this.parent.hasKeyword(name);
    }
    has(name) {
        return -1 !== this.symbols.indexOf(name) || this.parent.has(name);
    }
    get(name) {
        let local = this.#get(name);
        return local ? [ local, !1 ] : this.parent.get(name);
    }
    #get(name) {
        let slot = this.symbols.indexOf(name);
        return -1 === slot ? null : this.slots[slot];
    }
    getLocalsMap() {
        let dict = this.parent.getLocalsMap();
        return this.symbols.forEach((symbol => dict[symbol] = this.get(symbol)[0])), dict;
    }
    getDebugInfo() {
        const locals = this.getLocalsMap(), root = this.root();
        return [ {
            ...locals,
            ...root.named
        }, Object.fromEntries(root.upvars.map(((s, i) => [ s, i ]))) ];
    }
    allocateFree(name, resolution) {
        return this.parent.allocateFree(name, resolution);
    }
    allocateNamed(name) {
        return this.parent.allocateNamed(name);
    }
    allocateBlock(name) {
        return this.parent.allocateBlock(name);
    }
    allocate(identifier) {
        return this.parent.allocate(identifier);
    }
}

class Builder {
    // TEMPLATE //
    template(symbols, body, loc) {
        return new Template({
            table: symbols,
            body: body,
            loc: loc
        });
    }
    // INTERNAL (these nodes cannot be reached when doing general-purpose visiting) //
    block(symbols, body, loc) {
        return new Block({
            scope: symbols,
            body: body,
            loc: loc
        });
    }
    namedBlock(name, block, loc) {
        return new NamedBlock({
            name: name,
            block: block,
            attrs: [],
            componentArgs: [],
            modifiers: [],
            loc: loc
        });
    }
    simpleNamedBlock(name, block, loc) {
        return new BuildElement({
            selfClosing: !1,
            attrs: [],
            componentArgs: [],
            modifiers: [],
            comments: []
        }).named(name, block, loc);
    }
    slice(chars, loc) {
        return new SourceSlice({
            loc: loc,
            chars: chars
        });
    }
    args(positional, named, loc) {
        return new Args({
            loc: loc,
            positional: positional,
            named: named
        });
    }
    positional(exprs, loc) {
        return new PositionalArguments({
            loc: loc,
            exprs: exprs
        });
    }
    namedArgument(key, value) {
        return new NamedArgument({
            name: key,
            value: value
        });
    }
    named(entries, loc) {
        return new NamedArguments({
            loc: loc,
            entries: entries
        });
    }
    attr({name: name, value: value, trusting: trusting}, loc) {
        return new HtmlAttr({
            loc: loc,
            name: name,
            value: value,
            trusting: trusting
        });
    }
    splatAttr(symbol, loc) {
        return new SplatAttr({
            symbol: symbol,
            loc: loc
        });
    }
    arg({name: name, value: value, trusting: trusting}, loc) {
        return new ComponentArg({
            name: name,
            value: value,
            trusting: trusting,
            loc: loc
        });
    }
    // EXPRESSIONS //
    path(head, tail, loc) {
        return new PathExpression({
            loc: loc,
            ref: head,
            tail: tail
        });
    }
    keyword(name, symbol, loc) {
        return new KeywordExpression({
            loc: loc,
            name: name,
            symbol: symbol
        });
    }
    self(loc) {
        return new ThisReference({
            loc: loc
        });
    }
    at(name, symbol, loc) {
        return name[0], new ArgReference({
            loc: loc,
            name: new SourceSlice({
                loc: loc,
                chars: name
            }),
            symbol: symbol
        });
    }
    freeVar({name: name, context: context, symbol: symbol, loc: loc}) {
        return name[0], new FreeVarReference({
            name: name,
            resolution: context,
            symbol: symbol,
            loc: loc
        });
    }
    localVar(name, symbol, isTemplateLocal, loc) {
        return name[0], new LocalVarReference({
            loc: loc,
            name: name,
            isTemplateLocal: isTemplateLocal,
            symbol: symbol
        });
    }
    sexp(parts, loc) {
        return new CallExpression({
            loc: loc,
            callee: parts.callee,
            args: parts.args
        });
    }
    interpolate(parts, loc) {
        return new InterpolateExpression({
            loc: loc,
            parts: parts
        });
    }
    literal(value, loc) {
        return new LiteralExpression({
            loc: loc,
            value: value
        });
    }
    // STATEMENTS //
    append({table: table, trusting: trusting, value: value}, loc) {
        return new AppendContent({
            table: table,
            trusting: trusting,
            value: value,
            loc: loc
        });
    }
    modifier({callee: callee, args: args}, loc) {
        return new ElementModifier({
            loc: loc,
            callee: callee,
            args: args
        });
    }
    namedBlocks(blocks, loc) {
        return new NamedBlocks({
            loc: loc,
            blocks: blocks
        });
    }
    blockStatement({program: program, inverse: inverse = null, ...call}, loc) {
        let blocksLoc = program.loc, blocks = [ this.namedBlock(SourceSlice.synthetic("default"), program, program.loc) ];
        return inverse && (blocksLoc = blocksLoc.extend(inverse.loc), blocks.push(this.namedBlock(SourceSlice.synthetic("else"), inverse, inverse.loc))), 
        new InvokeBlock({
            loc: loc,
            blocks: this.namedBlocks(blocks, blocksLoc),
            callee: call.callee,
            args: call.args
        });
    }
    element(options) {
        return new BuildElement(options);
    }
}

class BuildElement {
    constructor(base) {
        this.base = base, this.builder = new Builder;
    }
    simple(tag, body, loc) {
        return new SimpleElement(assign({
            tag: tag,
            body: body,
            componentArgs: [],
            loc: loc
        }, this.base));
    }
    named(name, block, loc) {
        return new NamedBlock(assign({
            name: name,
            block: block,
            componentArgs: [],
            loc: loc
        }, this.base));
    }
    selfClosingComponent(callee, loc) {
        return new InvokeComponent(assign({
            loc: loc,
            callee: callee,
            // point the empty named blocks at the `/` self-closing tag
            blocks: new NamedBlocks({
                blocks: [],
                loc: loc.sliceEndChars({
                    skipEnd: 1,
                    chars: 1
                })
            })
        }, this.base));
    }
    componentWithDefaultBlock(callee, children, symbols, loc) {
        let block = this.builder.block(symbols, children, loc), namedBlock = this.builder.namedBlock(SourceSlice.synthetic("default"), block, loc);
        // BUILDER.simpleNamedBlock('default', children, symbols, loc);
        return new InvokeComponent(assign({
            loc: loc,
            callee: callee,
            blocks: this.builder.namedBlocks([ namedBlock ], namedBlock.loc)
        }, this.base));
    }
    componentWithNamedBlocks(callee, blocks, loc) {
        return new InvokeComponent(assign({
            loc: loc,
            callee: callee,
            blocks: this.builder.namedBlocks(blocks, SpanList.range(blocks))
        }, this.base));
    }
}

function SexpSyntaxContext(node) {
    return isSimpleCallee(node) ? LooseModeResolution.namespaced("Helper") : null;
}

function ModifierSyntaxContext(node) {
    return isSimpleCallee(node) ? LooseModeResolution.namespaced("Modifier") : null;
}

function BlockSyntaxContext(node) {
    return isSimpleCallee(node) ? LooseModeResolution.namespaced("Component") : null;
}

function ComponentSyntaxContext(node) {
    return isSimplePath(node) ? LooseModeResolution.namespaced("Component", !0) : null;
}

/**
 * This corresponds to attribute curlies (<Foo bar={{...}}>).
 * In strict mode, this also corresponds to arg curlies.
 */ function AttrValueSyntaxContext(node) {
    return isSimpleCallee(node) ? LooseModeResolution.namespaced("Helper") : null;
}

/**
 * This corresponds to append positions text curlies.
 */ function AppendSyntaxContext(node) {
    let isSimple = isSimpleCallee(node), trusting = node.trusting;
    return isSimple ? trusting ? LooseModeResolution.trustingAppend() : LooseModeResolution.append() : null;
}

// UTILITIES
/**
 * A call node has a simple callee if its head is:
 *
 * - a `PathExpression`
 * - the `PathExpression`'s head is a `VarHead`
 * - it has no tail
 *
 * Simple heads:
 *
 * ```
 * {{x}}
 * {{x y}}
 * ```
 *
 * Not simple heads:
 *
 * ```
 * {{x.y}}
 * {{x.y z}}
 * {{@x}}
 * {{@x a}}
 * {{this}}
 * {{this a}}
 * ```
 */ function isSimpleCallee(node) {
    return isSimplePath(node.path);
}

function isSimplePath(node) {
    return "PathExpression" === node.type && "VarHead" === node.head.type && 0 === node.tail.length;
}

function normalize(source, options = {
    lexicalScope: () => !1
}) {
    let ast = preprocess(source, options), normalizeOptions = {
        strictMode: !1,
        ...options,
        locals: ast.blockParams,
        keywords: options.keywords ?? []
    }, top = SymbolTable.top(normalizeOptions.locals, normalizeOptions.keywords, {
        customizeComponentName: options.customizeComponentName ?? (name => name),
        lexicalScope: options.lexicalScope
    }), block = new BlockContext(source, normalizeOptions, top), normalizer = new StatementNormalizer(block), astV2 = new TemplateChildren(block.loc(ast.loc), ast.body.map((b => normalizer.normalize(b))), block).assertTemplate(top);
    return [ astV2, top.getUsedTemplateLocals() ];
}

/**
 * A `BlockContext` represents the block that a particular AST node is contained inside of.
 *
 * `BlockContext` is aware of template-wide options (such as strict mode), as well as the bindings
 * that are in-scope within that block.
 *
 * Concretely, it has the `PrecompileOptions` and current `SymbolTable`, and provides
 * facilities for working with those options.
 *
 * `BlockContext` is stateless.
 */ class BlockContext {
    constructor(source, options, table) {
        this.source = source, this.options = options, this.table = table, this.builder = new Builder;
    }
    get strict() {
        return this.options.strictMode || !1;
    }
    loc(loc) {
        return this.source.spanFor(loc);
    }
    resolutionFor(node, resolution) {
        if (this.strict) return {
            result: STRICT_RESOLUTION
        };
        if (this.isFreeVar(node)) {
            let r = resolution(node);
            return null === r ? {
                result: "error",
                path: printPath(node),
                head: printHead(node)
            } : {
                result: r
            };
        }
        return {
            result: STRICT_RESOLUTION
        };
    }
    isLexicalVar(variable) {
        return this.table.hasLexical(variable);
    }
    isKeyword(name) {
        return this.strict && !this.table.hasLexical(name) && this.table.hasKeyword(name);
    }
    isFreeVar(callee) {
        return "PathExpression" === callee.type ? "VarHead" === callee.head.type && !this.table.has(callee.head.name) : "PathExpression" === callee.path.type && this.isFreeVar(callee.path);
    }
    hasBinding(name) {
        return this.table.has(name) || this.table.hasLexical(name);
    }
    child(blockParams) {
        return new BlockContext(this.source, this.options, this.table.child(blockParams));
    }
    customizeComponentName(input) {
        return this.options.customizeComponentName ? this.options.customizeComponentName(input) : input;
    }
}

/**
 * An `ExpressionNormalizer` normalizes expressions within a block.
 *
 * `ExpressionNormalizer` is stateless.
 */ class ExpressionNormalizer {
    constructor(block) {
        this.block = block;
    }
    normalize(expr, resolution) {
        switch (expr.type) {
          case "NullLiteral":
          case "BooleanLiteral":
          case "NumberLiteral":
          case "StringLiteral":
          case "UndefinedLiteral":
            return this.block.builder.literal(expr.value, this.block.loc(expr.loc));

          case "PathExpression":
            return this.path(expr, resolution);

          case "SubExpression":
            {
                // expr.path used to incorrectly have the type ASTv1.Expression
                isLiteral(expr.path) && assertIllegalLiteral(expr.path, expr.loc);
                let resolution = this.block.resolutionFor(expr, SexpSyntaxContext);
                if ("error" === resolution.result) throw generateSyntaxError(`You attempted to invoke a path (\`${resolution.path}\`) but ${resolution.head} was not in scope`, expr.loc);
                return this.block.builder.sexp(this.callParts(expr, resolution.result), this.block.loc(expr.loc));
            }
        }
    }
    path(expr, resolution) {
        let loc = this.block.loc(expr.loc);
        if ("VarHead" === expr.head.type && 0 === expr.tail.length && this.block.isKeyword(expr.head.name)) return this.block.builder.keyword(expr.head.name, this.block.table.getKeyword(expr.head.name), loc);
        let tail = [], offset = this.block.loc(expr.head.loc);
        for (let part of expr.tail) offset = offset.sliceStartChars({
            chars: part.length,
            skipStart: 1
        }), tail.push(new SourceSlice({
            loc: offset,
            chars: part
        }));
        return this.block.builder.path(this.ref(expr.head, resolution), tail, loc);
    }
    /**
   * The `callParts` method takes ASTv1.CallParts as well as a syntax context and normalizes
   * it to an ASTv2 CallParts.
   */    callParts(parts, context) {
        let {path: path, params: params, hash: hash, loc: loc} = parts, callee = this.normalize(path, context), paramList = params.map((p => this.normalize(p, STRICT_RESOLUTION))), paramLoc = SpanList.range(paramList, callee.loc.collapse("end")), namedLoc = this.block.loc(hash.loc), argsLoc = SpanList.range([ paramLoc, namedLoc ]), positional = this.block.builder.positional(params.map((p => this.normalize(p, STRICT_RESOLUTION))), paramLoc), named = this.block.builder.named(hash.pairs.map((p => this.namedArgument(p))), this.block.loc(hash.loc));
        switch (callee.type) {
          case "Literal":
            throw generateSyntaxError(`Invalid invocation of a literal value (\`${callee.value}\`)`, loc);

            // This really shouldn't be possible, something has gone pretty wrong
                      case "Interpolate":
            throw generateSyntaxError("Invalid invocation of a interpolated string", loc);
        }
        return {
            callee: callee,
            args: this.block.builder.args(positional, named, argsLoc)
        };
    }
    namedArgument(pair) {
        let keyOffsets = this.block.loc(pair.loc).sliceStartChars({
            chars: pair.key.length
        });
        return this.block.builder.namedArgument(new SourceSlice({
            chars: pair.key,
            loc: keyOffsets
        }), this.normalize(pair.value, STRICT_RESOLUTION));
    }
    /**
   * The `ref` method normalizes an `ASTv1.PathHead` into an `ASTv2.VariableReference`.
   * This method is extremely important, because it is responsible for normalizing free
   * variables into an an ASTv2.PathHead *with appropriate context*.
   *
   * The syntax context is originally determined by the syntactic position that this `PathHead`
   * came from, and is ultimately attached to the `ASTv2.VariableReference` here. In ASTv2,
   * the `VariableReference` node bears full responsibility for loose mode rules that control
   * the behavior of free variables.
   */    ref(head, resolution) {
        let {block: block} = this, {builder: builder, table: table} = block, offsets = block.loc(head.loc);
        switch (head.type) {
          case "ThisHead":
            if (block.hasBinding("this")) {
                let [symbol, isRoot] = table.get("this");
                return block.builder.localVar("this", symbol, isRoot, offsets);
            }
            return builder.self(offsets);

          case "AtHead":
            {
                let symbol = table.allocateNamed(head.name);
                return builder.at(head.name, symbol, offsets);
            }

          case "VarHead":
            if (block.hasBinding(head.name)) {
                let [symbol, isRoot] = table.get(head.name);
                return block.builder.localVar(head.name, symbol, isRoot, offsets);
            }
            {
                let context = block.strict ? STRICT_RESOLUTION : resolution, symbol = block.table.allocateFree(head.name, context);
                return block.builder.freeVar({
                    name: head.name,
                    context: context,
                    symbol: symbol,
                    loc: offsets
                });
            }
        }
    }
}

/**
 * `TemplateNormalizer` normalizes top-level ASTv1 statements to ASTv2.
 */ class StatementNormalizer {
    constructor(block) {
        this.block = block;
    }
    normalize(node) {
        switch (node.type) {
          case "BlockStatement":
            return this.BlockStatement(node);

          case "ElementNode":
            return new ElementNormalizer(this.block).ElementNode(node);

          case "MustacheStatement":
            return this.MustacheStatement(node);

            // These are the same in ASTv2
                      case "MustacheCommentStatement":
            return this.MustacheCommentStatement(node);

          case "CommentStatement":
            {
                let loc = this.block.loc(node.loc);
                return new HtmlComment({
                    loc: loc,
                    text: loc.slice({
                        skipStart: 4,
                        skipEnd: 3
                    }).toSlice(node.value)
                });
            }

          case "TextNode":
            return new HtmlText({
                loc: this.block.loc(node.loc),
                chars: node.chars
            });
        }
    }
    MustacheCommentStatement(node) {
        let loc = this.block.loc(node.loc);
        // If someone cares for these cases to have the right loc, feel free to attempt:
        // {{!}} {{~!}} {{!~}} {{~!~}}
        // {{!-}} {{~!-}} {{!-~}} {{~!-~}}
        // {{!--}} {{~!--}} {{!--~}} {{~!--~}}
        // {{!---}} {{~!---}} {{!---~}} {{~!---~}}
        // {{!----}} {{~!----}} {{!----~}} {{~!----~}}
                if ("" === node.value) return new GlimmerComment({
            loc: loc,
            text: SourceSlice.synthetic("")
        });
        let source = loc.asString(), span = loc;
        if (node.value.startsWith("-")) span = span.sliceStartChars({
            skipStart: source.startsWith("{{~") ? 6 : 5,
            chars: node.value.length
        }); else if (node.value.endsWith("-")) {
            const skipEnd = source.endsWith("~}}") ? 5 : 4, skipStart = source.length - node.value.length - skipEnd;
            span = span.slice({
                skipStart: skipStart,
                skipEnd: skipEnd
            });
        } else span = span.sliceStartChars({
            skipStart: source.lastIndexOf(node.value),
            chars: node.value.length
        });
        return new GlimmerComment({
            loc: loc,
            text: span.toSlice(node.value)
        });
    }
    /**
   * Normalizes an ASTv1.MustacheStatement to an ASTv2.AppendStatement
   */    MustacheStatement(mustache) {
        let value, {path: path, params: params, hash: hash, trusting: trusting} = mustache, loc = this.block.loc(mustache.loc);
        if (isLiteral(path)) 0 === params.length && 0 === hash.pairs.length ? value = this.expr.normalize(path) : assertIllegalLiteral(path, loc); else {
            let resolution = this.block.resolutionFor(mustache, AppendSyntaxContext);
            if ("error" === resolution.result) throw generateSyntaxError(`You attempted to render a path (\`{{${resolution.path}}}\`), but ${resolution.head} was not in scope`, loc);
            // Normalize the call parts in AppendSyntaxContext
                        let callParts = this.expr.callParts({
                path: path,
                params: params,
                hash: hash,
                loc: loc
            }, resolution.result);
            value = callParts.args.isEmpty() ? callParts.callee : this.block.builder.sexp(callParts, loc);
        }
        return this.block.builder.append({
            table: this.block.table,
            trusting: trusting,
            value: value
        }, loc);
    }
    /**
   * Normalizes a ASTv1.BlockStatement to an ASTv2.BlockStatement
   */    BlockStatement(block) {
        let {program: program, inverse: inverse} = block, loc = this.block.loc(block.loc);
        // block.path used to incorrectly have the type ASTv1.Expression
        isLiteral(block.path) && assertIllegalLiteral(block.path, loc);
        let resolution = this.block.resolutionFor(block, BlockSyntaxContext);
        if ("error" === resolution.result) throw generateSyntaxError(`You attempted to invoke a path (\`{{#${resolution.path}}}\`) but ${resolution.head} was not in scope`, loc);
        let callParts = this.expr.callParts(block, resolution.result);
        return this.block.builder.blockStatement(assign({
            symbols: this.block.table,
            program: this.Block(program),
            inverse: inverse ? this.Block(inverse) : null
        }, callParts), loc);
    }
    Block({body: body, loc: loc, blockParams: blockParams}) {
        let child = this.block.child(blockParams), normalizer = new StatementNormalizer(child);
        return new BlockChildren(this.block.loc(loc), body.map((b => normalizer.normalize(b))), this.block).assertBlock(child.table);
    }
    get expr() {
        return new ExpressionNormalizer(this.block);
    }
}

class ElementNormalizer {
    constructor(ctx) {
        this.ctx = ctx;
    }
    /**
   * Normalizes an ASTv1.ElementNode to:
   *
   * - ASTv2.NamedBlock if the tag name begins with `:`
   * - ASTv2.Component if the tag name matches the component heuristics
   * - ASTv2.SimpleElement if the tag name doesn't match the component heuristics
   *
   * A tag name represents a component if:
   *
   * - it begins with `@`
   * - it is exactly `this` or begins with `this.`
   * - the part before the first `.` is a reference to an in-scope variable binding
   * - it begins with an uppercase character
   */    ElementNode(element) {
        let {tag: tag, selfClosing: selfClosing, comments: comments} = element, loc = this.ctx.loc(element.loc), [tagHead, ...rest] = tag.split("."), path = this.classifyTag(tagHead, rest, element.loc), attrs = element.attributes.filter((a => "@" !== a.name[0])).map((a => this.attr(a))), args = element.attributes.filter((a => "@" === a.name[0])).map((a => this.arg(a))), modifiers = element.modifiers.map((m => this.modifier(m))), child = this.ctx.child(element.blockParams), normalizer = new StatementNormalizer(child), childNodes = element.children.map((s => normalizer.normalize(s))), el = this.ctx.builder.element({
            selfClosing: selfClosing,
            attrs: attrs,
            componentArgs: args,
            modifiers: modifiers,
            comments: comments.map((c => new StatementNormalizer(this.ctx).MustacheCommentStatement(c)))
        }), children = new ElementChildren(el, loc, childNodes, this.ctx), tagOffsets = this.ctx.loc(element.loc).sliceStartChars({
            chars: tag.length,
            skipStart: 1
        });
        if ("ElementHead" === path) return ":" === tag[0] ? children.assertNamedBlock(tagOffsets.slice({
            skipStart: 1
        }).toSlice(tag.slice(1)), child.table) : children.assertElement(tagOffsets.toSlice(tag), element.blockParams.length > 0);
        if (element.selfClosing) return el.selfClosingComponent(path, loc);
        {
            let blocks = children.assertComponent(tag, child.table, element.blockParams.length > 0);
            return el.componentWithNamedBlocks(path, blocks, loc);
        }
    }
    modifier(m) {
        // modifier.path used to incorrectly have the type ASTv1.Expression
        isLiteral(m.path) && assertIllegalLiteral(m.path, m.loc);
        let resolution = this.ctx.resolutionFor(m, ModifierSyntaxContext);
        if ("error" === resolution.result) throw generateSyntaxError(`You attempted to invoke a path (\`{{${resolution.path}}}\`) as a modifier, but ${resolution.head} was not in scope`, m.loc);
        let callParts = this.expr.callParts(m, resolution.result);
        return this.ctx.builder.modifier(callParts, this.ctx.loc(m.loc));
    }
    /**
   * This method handles attribute values that are curlies, as well as curlies nested inside of
   * interpolations:
   *
   * ```hbs
   * <a href={{url}} />
   * <a href="{{url}}.html" />
   * ```
   */    mustacheAttr(mustache) {
        let {path: path, params: params, hash: hash, loc: loc} = mustache;
        if (isLiteral(path)) {
            if (0 === params.length && 0 === hash.pairs.length) return this.expr.normalize(path);
            assertIllegalLiteral(path, loc);
        }
        // Normalize the call parts in AttrValueSyntaxContext
                let resolution = this.ctx.resolutionFor(mustache, AttrValueSyntaxContext);
        if ("error" === resolution.result) throw generateSyntaxError(`You attempted to render a path (\`{{${resolution.path}}}\`), but ${resolution.head} was not in scope`, mustache.loc);
        let sexp = this.ctx.builder.sexp(this.expr.callParts(mustache, resolution.result), this.ctx.loc(mustache.loc));
        // If there are no params or hash, just return the function part as its own expression
                return sexp.args.isEmpty() ? sexp.callee : sexp;
    }
    /**
   * attrPart is the narrowed down list of valid attribute values that are also
   * allowed as a concat part (you can't nest concats).
   */    attrPart(part) {
        switch (part.type) {
          case "MustacheStatement":
            return {
                expr: this.mustacheAttr(part),
                trusting: part.trusting
            };

          case "TextNode":
            return {
                expr: this.ctx.builder.literal(part.chars, this.ctx.loc(part.loc)),
                trusting: !0
            };
        }
    }
    attrValue(part) {
        if ("ConcatStatement" === part.type) {
            let parts = part.parts.map((p => this.attrPart(p).expr));
            return {
                expr: this.ctx.builder.interpolate(parts, this.ctx.loc(part.loc)),
                trusting: !1
            };
        }
        return this.attrPart(part);
    }
    attr(m) {
        if (m.name[0], "...attributes" === m.name) return this.ctx.builder.splatAttr(this.ctx.table.allocateBlock("attrs"), this.ctx.loc(m.loc));
        let offsets = this.ctx.loc(m.loc), nameSlice = offsets.sliceStartChars({
            chars: m.name.length
        }).toSlice(m.name), value = this.attrValue(m.value);
        return this.ctx.builder.attr({
            name: nameSlice,
            value: value.expr,
            trusting: value.trusting
        }, offsets);
    }
    // An arg curly <Foo @bar={{...}} /> is the same as an attribute curly for
    // our purposes, except that in loose mode <Foo @bar={{baz}} /> is an error:
    checkArgCall(arg) {
        let {value: value} = arg;
        if ("MustacheStatement" !== value.type) return;
        if (0 !== value.params.length || 0 !== value.hash.pairs.length) return;
        let {path: path} = value;
        if ("PathExpression" !== path.type) return;
        if (path.tail.length > 0) return;
        let resolution = this.ctx.resolutionFor(path, (() => null));
        if ("error" === resolution.result && "has-block" !== resolution.path) throw generateSyntaxError(`You attempted to pass a path as argument (\`${arg.name}={{${resolution.path}}}\`) but ${resolution.head} was not in scope. Try:\n* \`${arg.name}={{this.${resolution.path}}}\` if this is meant to be a property lookup, or\n* \`${arg.name}={{(${resolution.path})}}\` if this is meant to invoke the resolved helper, or\n* \`${arg.name}={{helper "${resolution.path}"}}\` if this is meant to pass the resolved helper by value`, arg.loc);
    }
    arg(arg) {
        arg.name[0], this.checkArgCall(arg);
        let offsets = this.ctx.loc(arg.loc), nameSlice = offsets.sliceStartChars({
            chars: arg.name.length
        }).toSlice(arg.name), value = this.attrValue(arg.value);
        return this.ctx.builder.arg({
            name: nameSlice,
            value: value.expr,
            trusting: value.trusting
        }, offsets);
    }
    /**
   * This function classifies the head of an ASTv1.Element into an ASTv2.PathHead (if the
   * element is a component) or `'ElementHead'` (if the element is a simple element).
   *
   * Rules:
   *
   * 1. If the variable is an `@arg`, return an `AtHead`
   * 2. If the variable is `this`, return a `ThisHead`
   * 3. If the variable is in the current scope:
   *   a. If the scope is the root scope, then return a Free `LocalVarHead`
   *   b. Else, return a standard `LocalVarHead`
   * 4. If the tag name is a path and the variable is not in the current scope, Syntax Error
   * 5. If the variable is uppercase return a FreeVar(ResolveAsComponentHead)
   * 6. Otherwise, return `'ElementHead'`
   */    classifyTag(variable, tail, loc) {
        let uppercase = (tag = variable)[0] === tag[0]?.toUpperCase() && tag[0] !== tag[0]?.toLowerCase();
        var tag;
        let inScope = "@" === variable[0] || "this" === variable || this.ctx.hasBinding(variable);
        if (this.ctx.strict && !inScope) {
            if (uppercase) throw generateSyntaxError(`Attempted to invoke a component that was not in scope in a strict mode template, \`<${variable}>\`. If you wanted to create an element with that name, convert it to lowercase - \`<${variable.toLowerCase()}>\``, loc);
            // In strict mode, values are always elements unless they are in scope
                        return "ElementHead";
        }
        // Since the parser handed us the HTML element name as a string, we need
        // to convert it into an ASTv1 path so it can be processed using the
        // expression normalizer.
                let isComponent = inScope || uppercase, variableLoc = loc.sliceStartChars({
            skipStart: 1,
            chars: variable.length
        }), tailLength = tail.reduce(((accum, part) => accum + 1 + part.length), 0), pathEnd = variableLoc.getEnd().move(tailLength), pathLoc = variableLoc.withEnd(pathEnd);
        if (isComponent) {
            let path = b.path({
                head: b.head({
                    original: variable,
                    loc: variableLoc
                }),
                tail: tail,
                loc: pathLoc
            }), resolution = this.ctx.isLexicalVar(variable) ? {
                result: STRICT_RESOLUTION
            } : this.ctx.resolutionFor(path, ComponentSyntaxContext);
            if ("error" === resolution.result) throw generateSyntaxError(`You attempted to invoke a path (\`<${resolution.path}>\`) but ${resolution.head} was not in scope`, loc);
            return new ExpressionNormalizer(this.ctx).normalize(path, resolution.result);
        }
        // If the tag name wasn't a valid component but contained a `.`, it's
        // a syntax error.
                if (this.ctx.table.allocateFree(variable, STRICT_RESOLUTION), tail.length > 0) throw generateSyntaxError(`You used ${variable}.${tail.join(".")} as a tag name, but ${variable} is not in scope`, loc);
        return "ElementHead";
    }
    get expr() {
        return new ExpressionNormalizer(this.ctx);
    }
}

class Children {
    constructor(loc, children, block) {
        this.loc = loc, this.children = children, this.block = block, this.namedBlocks = children.filter((c => c instanceof NamedBlock)), 
        this.hasSemanticContent = Boolean(children.filter((c => {
            if (c instanceof NamedBlock) return !1;
            switch (c.type) {
              case "GlimmerComment":
              case "HtmlComment":
                return !1;

              case "HtmlText":
                return !/^\s*$/u.test(c.chars);

              default:
                return !0;
            }
        })).length), this.nonBlockChildren = children.filter((c => !(c instanceof NamedBlock)));
    }
}

class TemplateChildren extends Children {
    assertTemplate(table) {
        if (isPresentArray(this.namedBlocks)) throw generateSyntaxError("Unexpected named block at the top-level of a template", this.loc);
        return this.block.builder.template(table, this.nonBlockChildren, this.block.loc(this.loc));
    }
}

class BlockChildren extends Children {
    assertBlock(table) {
        if (isPresentArray(this.namedBlocks)) throw generateSyntaxError("Unexpected named block nested in a normal block", this.loc);
        return this.block.builder.block(table, this.nonBlockChildren, this.loc);
    }
}

class ElementChildren extends Children {
    constructor(el, loc, children, block) {
        super(loc, children, block), this.el = el;
    }
    assertNamedBlock(name, table) {
        if (this.el.base.selfClosing) throw generateSyntaxError(`<:${name.chars}/> is not a valid named block: named blocks cannot be self-closing`, this.loc);
        if (isPresentArray(this.namedBlocks)) throw generateSyntaxError(`Unexpected named block inside <:${name.chars}> named block: named blocks cannot contain nested named blocks`, this.loc);
        if ((tag = name.chars)[0] !== tag[0]?.toLowerCase() || tag[0] === tag[0]?.toUpperCase()) throw generateSyntaxError(`<:${name.chars}> is not a valid named block, and named blocks must begin with a lowercase letter`, this.loc);
        var tag;
        if (this.el.base.attrs.length > 0 || this.el.base.componentArgs.length > 0 || this.el.base.modifiers.length > 0) throw generateSyntaxError(`named block <:${name.chars}> cannot have attributes, arguments, or modifiers`, this.loc);
        let offsets = SpanList.range(this.nonBlockChildren, this.loc);
        return this.block.builder.namedBlock(name, this.block.builder.block(table, this.nonBlockChildren, offsets), this.loc);
    }
    assertElement(name, hasBlockParams) {
        if (hasBlockParams) throw generateSyntaxError(`Unexpected block params in <${name.chars}>: simple elements cannot have block params`, this.loc);
        if (isPresentArray(this.namedBlocks)) {
            let names = this.namedBlocks.map((b => b.name));
            if (1 === names.length) throw generateSyntaxError(`Unexpected named block <:foo> inside <${name.chars}> HTML element`, this.loc);
            {
                let printedNames = names.map((n => `<:${n.chars}>`)).join(", ");
                throw generateSyntaxError(`Unexpected named blocks inside <${name.chars}> HTML element (${printedNames})`, this.loc);
            }
        }
        return this.el.simple(name, this.nonBlockChildren, this.loc);
    }
    assertComponent(name, table, hasBlockParams) {
        if (isPresentArray(this.namedBlocks) && this.hasSemanticContent) throw generateSyntaxError(`Unexpected content inside <${name}> component invocation: when using named blocks, the tag cannot contain other content`, this.loc);
        if (isPresentArray(this.namedBlocks)) {
            if (hasBlockParams) throw generateSyntaxError(`Unexpected block params list on <${name}> component invocation: when passing named blocks, the invocation tag cannot take block params`, this.loc);
            let seenNames = new Set;
            for (let block of this.namedBlocks) {
                let name = block.name.chars;
                if (seenNames.has(name)) throw generateSyntaxError(`Component had two named blocks with the same name, \`<:${name}>\`. Only one block with a given name may be passed`, this.loc);
                if ("inverse" === name && seenNames.has("else") || "else" === name && seenNames.has("inverse")) throw generateSyntaxError("Component has both <:else> and <:inverse> block. <:inverse> is an alias for <:else>", this.loc);
                seenNames.add(name);
            }
            return this.namedBlocks;
        }
        return [ this.block.builder.namedBlock(SourceSlice.synthetic("default"), this.block.builder.block(table, this.nonBlockChildren, this.loc), this.loc) ];
    }
}

function isLiteral(node) {
    switch (node.type) {
      case "StringLiteral":
      case "BooleanLiteral":
      case "NumberLiteral":
      case "UndefinedLiteral":
      case "NullLiteral":
        return !0;

      default:
        return !1;
    }
}

function assertIllegalLiteral(node, loc) {
    throw generateSyntaxError(`Unexpected literal \`${"StringLiteral" === node.type ? JSON.stringify(node.value) : String(node.value)}\``, loc);
}

function printPath(node) {
    return "PathExpression" !== node.type && "PathExpression" === node.path.type ? printPath(node.path) : new Printer({
        entityEncoding: "raw"
    }).print(node);
}

function printHead(node) {
    return "PathExpression" === node.type ? node.head.original : "PathExpression" === node.path.type ? printHead(node.path) : new Printer({
        entityEncoding: "raw"
    }).print(node);
}

export { api as ASTv2, BlockSymbolTable, KEYWORDS_TYPES, Walker as Path, ProgramSymbolTable, SourceSlice, SpanList, SymbolTable, Walker, WalkerPath, publicBuilder as builders, cannotRemoveNode, cannotReplaceNode, generateSyntaxError, getTemplateLocals, getVoidTags, hasSpan, isKeyword, isVoidTag, loc, maybeLoc, node, normalize, preprocess, build as print, sortByLoc, api$1 as src, traverse, visitorKeys };
