// @nts-check
/** @typedef {{ peek: number, offset: number, line: number, column: number }} CursorState */
import { mergeNsAndName } from "./tags.mjs";
import { isAsciiHexDigit, isAsciiLetter, isDigit, isNewLine, isOctalDigit, isQuote, isWhitespace } from "../chars.mjs";
import { ParseError, ParseLocation, ParseSourceFile, ParseSourceSpan } from "../parse_util.mjs";
import { NAMED_ENTITIES } from "./entities.mjs";
//#region ../compiler/src/ml_parser/lexer.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var TokenizeResult = class {
	/** @type {any[]} */ tokens;
	/** @type {any[]} */ errors;
	/** @type {any[]} */ nonNormalizedIcuExpressions;
	constructor(/** @type {any[]} */ tokens, /** @type {any[]} */ errors, /** @type {any[]} */ nonNormalizedIcuExpressions) {
		this.tokens = tokens;
		this.errors = errors;
		this.nonNormalizedIcuExpressions = nonNormalizedIcuExpressions;
	}
};
/** @returns {TokenizeResult} */ function tokenize(/** @type {string | undefined} */ source, /** @type {string | undefined} */ url, getTagContentType, options = {}) {
	const tokenizer = new _Tokenizer(new ParseSourceFile(source, url), getTagContentType, options);
	tokenizer.tokenize();
	return new TokenizeResult(mergeTextTokens(tokenizer.tokens), tokenizer.errors, tokenizer.nonNormalizedIcuExpressions);
}
const _CR_OR_CRLF_REGEXP = /\r\n?/g;
/** @returns {string} */ function _unexpectedCharacterErrorMsg(/** @type {number} */ charCode) {
	return `Unexpected character "${charCode === 0 ? "EOF" : String.fromCharCode(charCode)}"`;
}
function _unknownEntityErrorMsg(entitySrc) {
	return `Unknown entity "${entitySrc}" - use the "&#<decimal>;" or  "&#x<hex>;" syntax`;
}
function _unparsableEntityErrorMsg(type, entityStr) {
	return `Unable to parse entity "${entityStr}" - ${type} character reference entities must end with ";"`;
}
const SUPPORTED_BLOCKS = [
	"@if",
	"@else",
	"@for",
	"@switch",
	"@case",
	"@default",
	"@empty",
	"@defer",
	"@placeholder",
	"@loading",
	"@boundary",
	"@error",
	"@content"
];
const INTERPOLATION = {
	start: "{{",
	end: "}}"
};
const DEFAULT_NEVER_PATTERN = /^default[^\S\r\n]+never/;
const ELSE_IF_PATTERN = /^else[^\S\r\n]+if/;
var _Tokenizer = class {
	_getTagContentType;
	/** @type {PlainCharacterCursor} */ _cursor;
	/** @type {boolean} */ _tokenizeIcu;
	_leadingTriviaCodePoints;
	/** @type {boolean} */ _canSelfClose;
	/** @type {boolean} */ _allowHtmComponentClosingTags;
	/** @type {boolean} */ _allowStartTagComments;
	/** @type {PlainCharacterCursor | null} */ _currentTokenStart = null;
	/** @type {number | null} */ _currentTokenType = null;
	_expansionCaseStack = [];
	_openDirectiveCount = 0;
	/** @type {boolean} */ _inInterpolation = false;
	/** @type {boolean} */ _preserveLineEndings;
	/** @type {boolean} */ _i18nNormalizeLineEndingsInICUs;
	_fullNameStack = [];
	/** @type {boolean} */ _tokenizeBlocks;
	/** @type {boolean} */ _tokenizeLet;
	/** @type {boolean} */ _selectorlessEnabled;
	tokens = [];
	errors = [];
	nonNormalizedIcuExpressions = [];
	/**
	* @param _file The html source file being tokenized.
	* @param _getTagContentType A function that will retrieve a tag content type for a given tag
	*     name.
	* @param options Configuration of the tokenization.
	*/
	constructor(/** @type {import("../../../prettier/node_modules/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseSourceFile} */ _file, _getTagContentType, options) {
		this._getTagContentType = _getTagContentType;
		this._tokenizeIcu = options.tokenizeExpansionForms || false;
		this._leadingTriviaCodePoints = options.leadingTriviaChars && options.leadingTriviaChars.map((c) => c.codePointAt(0) || 0);
		this._canSelfClose = options.canSelfClose || false;
		this._allowHtmComponentClosingTags = options.allowHtmComponentClosingTags || false;
		this._allowStartTagComments = options.allowStartTagComments ?? true;
		const range = options.range || {
			endPos: _file.content.length,
			startPos: 0,
			startLine: 0,
			startCol: 0
		};
		this._cursor = options.escapedString ? new EscapedCharacterCursor(_file, range) : new PlainCharacterCursor(_file, range);
		this._preserveLineEndings = options.preserveLineEndings || false;
		this._i18nNormalizeLineEndingsInICUs = options.i18nNormalizeLineEndingsInICUs || false;
		this._tokenizeBlocks = options.tokenizeBlocks ?? true;
		this._tokenizeLet = options.tokenizeLet ?? true;
		this._selectorlessEnabled = options.selectorlessEnabled ?? false;
		try {
			this._cursor.init();
		} catch (e) {
			this.handleError(e);
		}
	}
	/** @returns {string} */ _processCarriageReturns(/** @type {string} */ content) {
		if (this._preserveLineEndings) return content;
		return content.replace(_CR_OR_CRLF_REGEXP, "\n");
	}
	tokenize() {
		while (this._cursor.peek() !== 0) {
			const start = this._cursor.clone();
			try {
				if (this._attemptCharCode(60)) {
					if (this._attemptCharCode(33)) {
						if (this._attemptStr("[CDATA[")) this._consumeCdata(start);
						else if (this._attemptStr("--")) this._consumeComment(start);
						else if (this._attemptStrCaseInsensitive("doctype")) this._consumeDocType(start);
						else this._consumeBogusComment(start);
					} else if (this._attemptCharCode(47)) this._consumeTagClose(start);
					else {
						const savedPos = this._cursor.clone();
						if (this._attemptCharCode(63)) {
							this._cursor = savedPos;
							this._consumeBogusComment(start);
						} else this._consumeTagOpen(start);
					}
				} else if (this._tokenizeLet && this._cursor.peek() === 64 && !this._inInterpolation && this._isLetStart()) this._consumeLetDeclaration(start);
				else if (this._tokenizeBlocks && this._isBlockStart()) this._consumeBlockStart(start);
				else if (this._tokenizeBlocks && !this._inInterpolation && !this._isInExpansionCase() && !this._isInExpansionForm() && this._attemptCharCode(125)) this._consumeBlockEnd(start);
				else if (!(this._tokenizeIcu && this._tokenizeExpansionForm())) this._consumeWithInterpolation(5, 8, /** @returns {boolean} */ () => this._isTextEnd(), /** @returns {boolean} */ () => this._isTagStart());
			} catch (e) {
				this.handleError(e);
			}
		}
		this._beginToken(44);
		this._endToken([]);
	}
	/** @returns {string} */ _getBlockName() {
		let spacesInNameAllowed = false;
		const nameCursor = this._cursor.clone();
		this._attemptCharCodeUntilFn(/** @returns {boolean} */ (/** @type {number} */ code) => {
			if (isWhitespace(code)) return !spacesInNameAllowed;
			if (isBlockNameChar(code)) {
				spacesInNameAllowed = true;
				return false;
			}
			return true;
		});
		let result = this._cursor.getChars(nameCursor).trim();
		if (ELSE_IF_PATTERN.test(result)) result = "else if";
		else if (DEFAULT_NEVER_PATTERN.test(result)) result = "default never";
		return result;
	}
	_consumeBlockStart(/** @type {PlainCharacterCursor} */ start) {
		this._requireCharCode(64);
		this._beginToken(26, start);
		const startToken = this._endToken([this._getBlockName()]);
		if (this._cursor.peek() === 40) {
			this._cursor.advance();
			this._consumeBlockParameters();
			this._attemptCharCodeUntilFn(isNotWhitespace);
			if (this._attemptCharCode(41)) this._attemptCharCodeUntilFn(isNotWhitespace);
			else {
				startToken.type = 30;
				return;
			}
		}
		if (startToken.parts[0] === "default never" && this._attemptCharCode(59)) {
			this._beginToken(27);
			this._endToken([]);
			this._beginToken(28);
			this._endToken([]);
			return;
		}
		if (this._attemptCharCode(123)) {
			this._beginToken(27);
			this._endToken([]);
		} else if (this._isBlockStart() && (startToken.parts[0] === "case" || startToken.parts[0] === "default")) {
			this._beginToken(27);
			this._endToken([]);
			this._beginToken(28);
			this._endToken([]);
		} else startToken.type = 30;
	}
	_consumeBlockEnd(/** @type {PlainCharacterCursor} */ start) {
		this._beginToken(28, start);
		this._endToken([]);
	}
	_consumeBlockParameters() {
		this._attemptCharCodeUntilFn(isBlockParameterChar);
		while (this._cursor.peek() !== 41 && this._cursor.peek() !== 0) {
			this._beginToken(29);
			const start = this._cursor.clone();
			let inQuote = null;
			let openParens = 0;
			while (this._cursor.peek() !== 59 && this._cursor.peek() !== 0 || inQuote !== null) {
				const char = this._cursor.peek();
				if (char === 92) this._cursor.advance();
				else if (char === inQuote) inQuote = null;
				else if (inQuote === null && isQuote(char)) inQuote = char;
				else if (char === 40 && inQuote === null) openParens++;
				else if (char === 41 && inQuote === null) {
					if (openParens === 0) break;
					else if (openParens > 0) openParens--;
				}
				this._cursor.advance();
			}
			this._endToken([this._cursor.getChars(start)]);
			this._attemptCharCodeUntilFn(isBlockParameterChar);
		}
	}
	_consumeLetDeclaration(/** @type {PlainCharacterCursor} */ start) {
		this._requireStr("@let");
		this._beginToken(31, start);
		if (isWhitespace(this._cursor.peek())) this._attemptCharCodeUntilFn(isNotWhitespace);
		else {
			const token = this._endToken([this._cursor.getChars(start)]);
			token.type = 34;
			return;
		}
		const startToken = this._endToken([this._getLetDeclarationName()]);
		this._attemptCharCodeUntilFn(isNotWhitespace);
		if (!this._attemptCharCode(61)) {
			startToken.type = 34;
			return;
		}
		this._attemptCharCodeUntilFn(/** @returns {boolean} */ (/** @type {number} */ code) => isNotWhitespace(code) && !isNewLine(code));
		this._consumeLetDeclarationValue();
		if (this._cursor.peek() === 59) {
			this._beginToken(33);
			this._cursor.advance();
			this._endToken([]);
		} else {
			startToken.type = 34;
			startToken.sourceSpan = this._cursor.getSpan(start);
		}
	}
	/** @returns {string} */ _getLetDeclarationName() {
		const nameCursor = this._cursor.clone();
		let allowDigit = false;
		this._attemptCharCodeUntilFn(/** @returns {boolean} */ (/** @type {number} */ code) => {
			if (isAsciiLetter(code) || code === 36 || code === 95 || allowDigit && isDigit(code)) {
				allowDigit = true;
				return false;
			}
			return true;
		});
		return this._cursor.getChars(nameCursor).trim();
	}
	_consumeLetDeclarationValue() {
		const start = this._cursor.clone();
		this._beginToken(32, start);
		this._attemptUntilIgnoreQuotes(/** @returns {boolean} */ (/** @type {number} */ char) => char === 59);
		this._endToken([this._cursor.getChars(start)]);
	}
	/**
	* @returns whether an ICU token has been created
	* @internal
	* @returns {boolean}
	*/
	_tokenizeExpansionForm() {
		if (this.isExpansionFormStart()) {
			this._consumeExpansionFormStart();
			return true;
		}
		if (isExpansionCaseStart(this._cursor.peek()) && this._isInExpansionForm()) {
			this._consumeExpansionCaseStart();
			return true;
		}
		if (this._cursor.peek() === 125) {
			if (this._isInExpansionCase()) {
				this._consumeExpansionCaseEnd();
				return true;
			}
			if (this._isInExpansionForm()) {
				this._consumeExpansionFormEnd();
				return true;
			}
		}
		return false;
	}
	_beginToken(/** @type {number} */ type, start = this._cursor.clone()) {
		this._currentTokenStart = start;
		this._currentTokenType = type;
	}
	_endToken(/** @type {any[]} */ parts, /** @type {PlainCharacterCursor | undefined} */ end) {
		if (this._currentTokenStart === null) throw new ParseError(this._cursor.getSpan(end), "Programming error - attempted to end a token when there was no start to the token");
		if (this._currentTokenType === null) throw new ParseError(this._cursor.getSpan(this._currentTokenStart), "Programming error - attempted to end a token which has no token type");
		const token = {
			type: this._currentTokenType,
			parts,
			sourceSpan: (end ?? this._cursor).getSpan(this._currentTokenStart, this._leadingTriviaCodePoints)
		};
		this.tokens.push(token);
		this._currentTokenStart = null;
		this._currentTokenType = null;
		return token;
	}
	/** @returns {import("../../../prettier/node_modules/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseError} */ _createError(/** @type {string} */ msg, /** @type {import("../../../prettier/node_modules/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseSourceSpan} */ span) {
		if (this._isInExpansionForm()) msg += ` (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.)`;
		const error = new ParseError(span, msg);
		this._currentTokenStart = null;
		this._currentTokenType = null;
		return error;
	}
	handleError(e) {
		if (e instanceof CursorError) e = this._createError(e.msg, this._cursor.getSpan(e.cursor));
		if (e instanceof ParseError) this.errors.push(e);
		else throw e;
	}
	/** @returns {boolean} */ _attemptCharCode(/** @type {number} */ charCode) {
		if (this._cursor.peek() === charCode) {
			this._cursor.advance();
			return true;
		}
		return false;
	}
	/** @returns {boolean} */ _attemptCharCodeCaseInsensitive(/** @type {number} */ charCode) {
		if (compareCharCodeCaseInsensitive(this._cursor.peek(), charCode)) {
			this._cursor.advance();
			return true;
		}
		return false;
	}
	_requireCharCode(/** @type {number} */ charCode) {
		const location = this._cursor.clone();
		if (!this._attemptCharCode(charCode)) throw this._createError(_unexpectedCharacterErrorMsg(this._cursor.peek()), this._cursor.getSpan(location));
	}
	/** @returns {boolean} */ _attemptStr(/** @type {string} */ chars) {
		const len = chars.length;
		if (this._cursor.charsLeft() < len) return false;
		const initialPosition = this._cursor.clone();
		for (let i = 0; i < len; i++) if (!this._attemptCharCode(chars.charCodeAt(i))) {
			this._cursor = initialPosition;
			return false;
		}
		return true;
	}
	/** @returns {boolean} */ _attemptStrCaseInsensitive(/** @type {string} */ chars) {
		for (let i = 0; i < chars.length; i++) if (!this._attemptCharCodeCaseInsensitive(chars.charCodeAt(i))) return false;
		return true;
	}
	_requireStr(/** @type {string} */ chars) {
		const location = this._cursor.clone();
		if (!this._attemptStr(chars)) throw this._createError(_unexpectedCharacterErrorMsg(this._cursor.peek()), this._cursor.getSpan(location));
	}
	_requireStrCaseInsensitive(chars) {
		const location = this._cursor.clone();
		if (!this._attemptStrCaseInsensitive(chars)) throw this._createError(_unexpectedCharacterErrorMsg(this._cursor.peek()), this._cursor.getSpan(location));
	}
	_attemptCharCodeUntilFn(predicate) {
		while (!predicate(this._cursor.peek())) this._cursor.advance();
	}
	_requireCharCodeUntilFn(predicate, /** @type {number} */ len) {
		const start = this._cursor.clone();
		this._attemptCharCodeUntilFn(predicate);
		if (this._cursor.diff(start) < len) throw this._createError(_unexpectedCharacterErrorMsg(this._cursor.peek()), this._cursor.getSpan(start));
	}
	_attemptUntilChar(/** @type {number} */ char) {
		while (this._cursor.peek() !== char) this._cursor.advance();
	}
	_attemptUntilIgnoreQuotes(predicate) {
		while (this._cursor.peek() !== 0) {
			const char = this._cursor.peek();
			if (predicate(char)) break;
			if (isQuote(char)) {
				this._cursor.advance();
				this._attemptCharCodeUntilFn(/** @returns {boolean} */ (/** @type {number} */ inner) => {
					if (inner === 92) {
						this._cursor.advance();
						return false;
					}
					return inner === char;
				});
			}
			this._cursor.advance();
		}
	}
	/** @returns {string} */ _readChar() {
		const char = String.fromCodePoint(this._cursor.peek());
		this._cursor.advance();
		return char;
	}
	/** @returns {boolean} */ _peekStr(/** @type {string} */ chars) {
		const len = chars.length;
		if (this._cursor.charsLeft() < len) return false;
		const cursor = this._cursor.clone();
		for (let i = 0; i < len; i++) {
			if (cursor.peek() !== chars.charCodeAt(i)) return false;
			cursor.advance();
		}
		return true;
	}
	/** @returns {boolean} */ _isBlockStart() {
		return this._cursor.peek() === 64 && SUPPORTED_BLOCKS.some(/** @returns {boolean} */ (blockName) => this._peekStr(blockName));
	}
	/** @returns {boolean} */ _isLetStart() {
		return this._cursor.peek() === 64 && this._peekStr("@let");
	}
	_consumeEntity(/** @type {number} */ textTokenType) {
		this._beginToken(9);
		const start = this._cursor.clone();
		this._cursor.advance();
		if (this._attemptCharCode(35)) {
			const isHex = this._attemptCharCode(120) || this._attemptCharCode(88);
			const codeStart = this._cursor.clone();
			this._attemptCharCodeUntilFn(isDigitEntityEnd);
			if (this._cursor.peek() != 59) {
				this._cursor.advance();
				const entityType = isHex ? "hexadecimal" : "decimal";
				throw this._createError(_unparsableEntityErrorMsg(entityType, this._cursor.getChars(start)), this._cursor.getSpan());
			}
			const strNum = this._cursor.getChars(codeStart);
			this._cursor.advance();
			try {
				const charCode = parseInt(strNum, isHex ? 16 : 10);
				this._endToken([String.fromCodePoint(charCode), this._cursor.getChars(start)]);
			} catch {
				throw this._createError(_unknownEntityErrorMsg(this._cursor.getChars(start)), this._cursor.getSpan());
			}
		} else {
			const nameStart = this._cursor.clone();
			this._attemptCharCodeUntilFn(isNamedEntityEnd);
			if (this._cursor.peek() != 59) {
				this._beginToken(textTokenType, start);
				this._cursor = nameStart;
				this._endToken(["&"]);
			} else {
				const name = this._cursor.getChars(nameStart);
				this._cursor.advance();
				const char = Object.hasOwn(NAMED_ENTITIES, name) && NAMED_ENTITIES[name];
				if (!char) throw this._createError(_unknownEntityErrorMsg(name), this._cursor.getSpan(start));
				this._endToken([char, `&${name};`]);
			}
		}
	}
	_consumeRawText(/** @type {boolean} */ consumeEntities, endMarkerPredicate) {
		this._beginToken(consumeEntities ? 6 : 7);
		const parts = [];
		while (true) {
			const tagCloseStart = this._cursor.clone();
			const foundEndMarker = endMarkerPredicate();
			this._cursor = tagCloseStart;
			if (foundEndMarker) break;
			if (consumeEntities && this._cursor.peek() === 38) {
				this._endToken([this._processCarriageReturns(parts.join(""))]);
				parts.length = 0;
				this._consumeEntity(6);
				this._beginToken(6);
			} else parts.push(this._readChar());
		}
		this._endToken([this._processCarriageReturns(parts.join(""))]);
	}
	_consumeComment(/** @type {PlainCharacterCursor} */ start) {
		this._beginToken(10, start);
		this._endToken([]);
		this._consumeRawText(false, /** @returns {boolean} */ () => this._attemptStr("-->"));
		this._beginToken(11);
		this._requireStr("-->");
		this._endToken([]);
	}
	_consumeBogusComment(/** @type {PlainCharacterCursor} */ start) {
		this._beginToken(10, start);
		this._endToken([]);
		this._consumeRawText(false, /** @returns {boolean} */ () => this._cursor.peek() === 62);
		this._beginToken(11);
		this._cursor.advance();
		this._endToken([]);
	}
	_consumeCdata(/** @type {PlainCharacterCursor} */ start) {
		this._beginToken(13, start);
		this._endToken([]);
		this._consumeRawText(false, /** @returns {boolean} */ () => this._attemptStr("]]>"));
		this._beginToken(14);
		this._requireStr("]]>");
		this._endToken([]);
	}
	_consumeDocType(/** @type {PlainCharacterCursor} */ start) {
		this._beginToken(19, start);
		this._endToken([]);
		this._consumeRawText(false, /** @returns {boolean} */ () => this._cursor.peek() === 62);
		this._beginToken(20);
		this._cursor.advance();
		this._endToken([]);
	}
	_consumeProcessingInstruction(start) {
		this._beginToken(43, start);
		const contentStart = this._cursor.clone();
		this._attemptUntilIgnoreQuotes((char) => char === 63 || char === 62);
		const endChar = this._cursor.peek();
		const content = this._cursor.getChars(contentStart);
		this._cursor.advance();
		if (endChar === 63) this._requireCharCode(62);
		this._endToken([content]);
	}
	/** @returns {any[]} */ _consumePrefixAndName(endPredicate) {
		const nameOrPrefixStart = this._cursor.clone();
		let prefix = "";
		while (this._cursor.peek() !== 58 && !isPrefixEnd(this._cursor.peek())) this._cursor.advance();
		let nameStart;
		if (this._cursor.peek() === 58) {
			prefix = this._cursor.getChars(nameOrPrefixStart);
			this._cursor.advance();
			nameStart = this._cursor.clone();
		} else nameStart = nameOrPrefixStart;
		this._requireCharCodeUntilFn(endPredicate, prefix === "" ? 0 : 1);
		const name = this._cursor.getChars(nameStart);
		return [prefix, name];
	}
	_consumeSingleLineComment(/** @type {PlainCharacterCursor} */ start) {
		const contentStart = this._cursor.clone();
		this._attemptCharCodeUntilFn(/** @returns {boolean} */ (/** @type {number} */ code) => isNewLine(code) || code === 0);
		const spanEnd = this._cursor.clone();
		const content = spanEnd.getChars(contentStart);
		this._beginToken(12, start);
		this._endToken([content, "single"], spanEnd);
		this._attemptCharCodeUntilFn(isNotWhitespace);
	}
	_consumeMultiLineComment(/** @type {PlainCharacterCursor} */ start) {
		const contentStart = this._cursor.clone();
		this._attemptCharCodeUntilFn(/** @returns {boolean} */ (/** @type {number} */ code) => {
			if (code === 0) return true;
			if (code === 42) {
				const next = this._cursor.clone();
				next.advance();
				return next.peek() === 47;
			}
			return false;
		});
		const contentEnd = this._cursor.clone();
		const content = contentEnd.getChars(contentStart);
		let spanEnd = contentEnd;
		if (this._attemptStr("*/")) {
			spanEnd = this._cursor.clone();
			this._attemptCharCodeUntilFn(isNotWhitespace);
		}
		this._beginToken(12, start);
		this._endToken([content, "multi"], spanEnd);
	}
	_consumeTagOpen(/** @type {PlainCharacterCursor} */ start) {
		let tagName;
		let prefix;
		let closingTagName;
		let openToken;
		const attrs = [];
		try {
			if (this._selectorlessEnabled && isSelectorlessNameStart(this._cursor.peek())) {
				openToken = this._consumeComponentOpenStart(start);
				[closingTagName, prefix, tagName] = openToken.parts;
				if (prefix) closingTagName += `:${prefix}`;
				if (tagName) closingTagName += `:${tagName}`;
				this._attemptCharCodeUntilFn(isNotWhitespace);
			} else {
				if (!isAsciiLetter(this._cursor.peek())) throw this._createError(_unexpectedCharacterErrorMsg(this._cursor.peek()), this._cursor.getSpan(start));
				openToken = this._consumeTagOpenStart(start);
				prefix = openToken.parts[0];
				tagName = closingTagName = openToken.parts[1];
				this._attemptCharCodeUntilFn(isNotWhitespace);
			}
			while (true) {
				if (this._allowStartTagComments) {
					const commentStart = this._cursor.clone();
					if (this._attemptStr("//")) {
						this._consumeSingleLineComment(commentStart);
						continue;
					}
					if (this._attemptStr("/*")) {
						this._consumeMultiLineComment(commentStart);
						continue;
					}
				}
				if (isAttributeTerminator(this._cursor.peek())) break;
				if (this._selectorlessEnabled && this._cursor.peek() === 64) {
					const start = this._cursor.clone();
					const nameStart = start.clone();
					nameStart.advance();
					if (isSelectorlessNameStart(nameStart.peek())) this._consumeDirective(start, nameStart);
				} else {
					const attr = this._consumeAttribute();
					attrs.push(attr);
				}
			}
			if (openToken.type === 35) this._consumeComponentOpenEnd();
			else this._consumeTagOpenEnd();
		} catch (e) {
			if (e instanceof ParseError) {
				if (openToken) openToken.type = openToken.type === 35 ? 39 : 4;
				else {
					this._beginToken(5, start);
					this._endToken(["<"]);
				}
				return;
			}
			throw e;
		}
		if (this._canSelfClose && this.tokens[this.tokens.length - 1].type === 2) return;
		const contentTokenType = this._getTagContentType(tagName, prefix, this._fullNameStack.length > 0, attrs);
		this._handleFullNameStackForTagOpen(prefix, tagName);
		if (contentTokenType === 0) this._consumeRawTextWithTagClose(prefix, openToken, closingTagName, false);
		else if (contentTokenType === 1) this._consumeRawTextWithTagClose(prefix, openToken, closingTagName, true);
	}
	_consumeRawTextWithTagClose(/** @type {string} */ prefix, openToken, /** @type {string} */ tagName, consumeEntities) {
		this._consumeRawText(consumeEntities, /** @returns {boolean} */ () => {
			if (!this._attemptCharCode(60)) return false;
			if (!this._attemptCharCode(47)) return false;
			this._attemptCharCodeUntilFn(isNotWhitespace);
			if (!this._attemptStrCaseInsensitive(prefix && openToken.type !== 35 ? `${prefix}:${tagName}` : tagName)) return false;
			this._attemptCharCodeUntilFn(isNotWhitespace);
			return this._attemptCharCode(62);
		});
		this._beginToken(openToken.type === 35 ? 38 : 3);
		this._requireCharCodeUntilFn(/** @returns {boolean} */ (/** @type {number} */ code) => code === 62, 3);
		this._cursor.advance();
		this._endToken(openToken.parts);
		this._handleFullNameStackForTagClose(prefix, tagName);
	}
	_consumeTagOpenStart(/** @type {PlainCharacterCursor} */ start) {
		this._beginToken(0, start);
		const parts = this._consumePrefixAndName(isNameEnd);
		return this._endToken(parts);
	}
	_consumeComponentOpenStart(start) {
		this._beginToken(35, start);
		const parts = this._consumeComponentName();
		return this._endToken(parts);
	}
	_consumeComponentName() {
		const nameStart = this._cursor.clone();
		while (isSelectorlessNameChar(this._cursor.peek())) this._cursor.advance();
		const name = this._cursor.getChars(nameStart);
		let prefix = "";
		let tagName = "";
		if (this._cursor.peek() === 58) {
			this._cursor.advance();
			[prefix, tagName] = this._consumePrefixAndName(isNameEnd);
		}
		return [
			name,
			prefix,
			tagName
		];
	}
	_consumeAttribute() {
		const [prefix, name] = this._consumeAttributeName();
		let value;
		this._attemptCharCodeUntilFn(isNotWhitespace);
		if (this._attemptCharCode(61)) {
			this._attemptCharCodeUntilFn(isNotWhitespace);
			value = this._consumeAttributeValue();
		}
		this._attemptCharCodeUntilFn(isNotWhitespace);
		return {
			prefix,
			name,
			value
		};
	}
	/** @returns {any[]} */ _consumeAttributeName() {
		const attrNameStart = this._cursor.peek();
		if (attrNameStart === 39 || attrNameStart === 34) throw this._createError(_unexpectedCharacterErrorMsg(attrNameStart), this._cursor.getSpan());
		this._beginToken(15);
		let nameEndPredicate;
		if (this._openDirectiveCount > 0) {
			let openParens = 0;
			nameEndPredicate = (code) => {
				if (this._openDirectiveCount > 0) {
					if (code === 40) openParens++;
					else if (code === 41) {
						if (openParens === 0) return true;
						openParens--;
					}
				}
				return isNameEnd(code);
			};
		} else if (attrNameStart === 91) {
			let openBrackets = 0;
			nameEndPredicate = /** @returns {boolean} */ (/** @type {number} */ code) => {
				if (code === 91) openBrackets++;
				else if (code === 93) openBrackets--;
				return openBrackets <= 0 ? isNameEnd(code) : isNewLine(code);
			};
		} else nameEndPredicate = isNameEnd;
		const prefixAndName = this._consumePrefixAndName(nameEndPredicate);
		this._endToken(prefixAndName);
		return prefixAndName;
	}
	/** @returns {string} */ _consumeAttributeValue() {
		let value;
		if (this._cursor.peek() === 39 || this._cursor.peek() === 34) {
			const quoteChar = this._cursor.peek();
			this._consumeQuote(quoteChar);
			const endPredicate = /** @returns {boolean} */ () => this._cursor.peek() === quoteChar;
			value = this._consumeWithInterpolation(17, 18, endPredicate, endPredicate);
			this._consumeQuote(quoteChar);
		} else {
			const endPredicate = /** @returns {boolean} */ () => isNameEnd(this._cursor.peek());
			value = this._consumeWithInterpolation(17, 18, endPredicate, endPredicate);
		}
		return value;
	}
	_consumeQuote(/** @type {number} */ quoteChar) {
		this._beginToken(16);
		this._requireCharCode(quoteChar);
		this._endToken([String.fromCodePoint(quoteChar)]);
	}
	_consumeTagOpenEnd() {
		const tokenType = this._attemptCharCode(47) ? 2 : 1;
		this._beginToken(tokenType);
		this._requireCharCode(62);
		this._endToken([]);
	}
	_consumeComponentOpenEnd() {
		const tokenType = this._attemptCharCode(47) ? 37 : 36;
		this._beginToken(tokenType);
		this._requireCharCode(62);
		this._endToken([]);
	}
	_consumeTagClose(/** @type {PlainCharacterCursor} */ start) {
		if (this._selectorlessEnabled) {
			const clone = start.clone();
			while (clone.peek() !== 62 && !isSelectorlessNameStart(clone.peek())) clone.advance();
			if (isSelectorlessNameStart(clone.peek())) {
				this._beginToken(38, start);
				const parts = this._consumeComponentName();
				this._attemptCharCodeUntilFn(isNotWhitespace);
				this._requireCharCode(62);
				this._endToken(parts);
				return;
			}
		}
		this._beginToken(3, start);
		this._attemptCharCodeUntilFn(isNotWhitespace);
		if (this._allowHtmComponentClosingTags && this._attemptCharCode(47)) {
			this._attemptCharCodeUntilFn(isNotWhitespace);
			this._requireCharCode(62);
			this._endToken([]);
		} else {
			const [prefix, name] = this._consumePrefixAndName(isNameEnd);
			this._attemptCharCodeUntilFn(isNotWhitespace);
			this._requireCharCode(62);
			this._endToken([prefix, name]);
			this._handleFullNameStackForTagClose(prefix, name);
		}
	}
	_consumeExpansionFormStart() {
		this._beginToken(21);
		this._requireCharCode(123);
		this._endToken([]);
		this._expansionCaseStack.push(21);
		this._beginToken(7);
		const condition = this._readUntil(44);
		const normalizedCondition = this._processCarriageReturns(condition);
		if (this._i18nNormalizeLineEndingsInICUs) this._endToken([normalizedCondition]);
		else {
			const conditionToken = this._endToken([condition]);
			if (normalizedCondition !== condition) this.nonNormalizedIcuExpressions.push(conditionToken);
		}
		this._requireCharCode(44);
		this._attemptCharCodeUntilFn(isNotWhitespace);
		this._beginToken(7);
		const type = this._readUntil(44);
		this._endToken([type]);
		this._requireCharCode(44);
		this._attemptCharCodeUntilFn(isNotWhitespace);
	}
	_consumeExpansionCaseStart() {
		this._beginToken(22);
		const value = this._readUntil(123).trim();
		this._endToken([value]);
		this._attemptCharCodeUntilFn(isNotWhitespace);
		this._beginToken(23);
		this._requireCharCode(123);
		this._endToken([]);
		this._attemptCharCodeUntilFn(isNotWhitespace);
		this._expansionCaseStack.push(23);
	}
	_consumeExpansionCaseEnd() {
		this._beginToken(24);
		this._requireCharCode(125);
		this._endToken([]);
		this._attemptCharCodeUntilFn(isNotWhitespace);
		this._expansionCaseStack.pop();
	}
	_consumeExpansionFormEnd() {
		this._beginToken(25);
		this._requireCharCode(125);
		this._endToken([]);
		this._expansionCaseStack.pop();
	}
	/**
	* Consume a string that may contain interpolation expressions.
	*
	* The first token consumed will be of `tokenType` and then there will be alternating
	* `interpolationTokenType` and `tokenType` tokens until the `endPredicate()` returns true.
	*
	* If an interpolation token ends prematurely it will have no end marker in its `parts` array.
	*
	* @param textTokenType the kind of tokens to interleave around interpolation tokens.
	* @param interpolationTokenType the kind of tokens that contain interpolation.
	* @param endPredicate a function that should return true when we should stop consuming.
	* @param endInterpolation a function that should return true if there is a premature end to an
	*     interpolation expression - i.e. before we get to the normal interpolation closing marker.
	* @returns {string}
	*/
	_consumeWithInterpolation(/** @type {number} */ textTokenType, /** @type {number} */ interpolationTokenType, endPredicate, endInterpolation) {
		this._beginToken(textTokenType);
		const parts = [];
		while (!endPredicate()) {
			const current = this._cursor.clone();
			if (this._attemptStr(INTERPOLATION.start)) {
				this._endToken([this._processCarriageReturns(parts.join(""))], current);
				parts.length = 0;
				this._consumeInterpolation(interpolationTokenType, current, endInterpolation);
				this._beginToken(textTokenType);
			} else if (this._cursor.peek() === 38) {
				this._endToken([this._processCarriageReturns(parts.join(""))]);
				parts.length = 0;
				this._consumeEntity(textTokenType);
				this._beginToken(textTokenType);
			} else parts.push(this._readChar());
		}
		this._inInterpolation = false;
		const value = this._processCarriageReturns(parts.join(""));
		this._endToken([value]);
		return value;
	}
	/**
	* Consume a block of text that has been interpreted as an Angular interpolation.
	*
	* @param interpolationTokenType the type of the interpolation token to generate.
	* @param interpolationStart a cursor that points to the start of this interpolation.
	* @param prematureEndPredicate a function that should return true if the next characters indicate
	*     an end to the interpolation before its normal closing marker.
	*/
	_consumeInterpolation(/** @type {number} */ interpolationTokenType, /** @type {PlainCharacterCursor} */ interpolationStart, prematureEndPredicate) {
		const parts = [];
		this._beginToken(interpolationTokenType, interpolationStart);
		parts.push(INTERPOLATION.start);
		const expressionStart = this._cursor.clone();
		let inQuote = null;
		let inComment = false;
		while (this._cursor.peek() !== 0 && (prematureEndPredicate === null || !prematureEndPredicate())) {
			const current = this._cursor.clone();
			if (this._isTagStart()) {
				this._cursor = current;
				parts.push(this._getProcessedChars(expressionStart, current));
				this._endToken(parts);
				return;
			}
			if (inQuote === null) {
				if (this._attemptStr(INTERPOLATION.end)) {
					parts.push(this._getProcessedChars(expressionStart, current));
					parts.push(INTERPOLATION.end);
					this._endToken(parts);
					return;
				} else if (this._attemptStr("//")) inComment = true;
			}
			const char = this._cursor.peek();
			this._cursor.advance();
			if (char === 92) this._cursor.advance();
			else if (char === inQuote) inQuote = null;
			else if (!inComment && inQuote === null && isQuote(char)) inQuote = char;
		}
		parts.push(this._getProcessedChars(expressionStart, this._cursor));
		this._endToken(parts);
	}
	_consumeDirective(start, nameStart) {
		this._requireCharCode(64);
		this._cursor.advance();
		while (isSelectorlessNameChar(this._cursor.peek())) this._cursor.advance();
		this._beginToken(40, start);
		const name = this._cursor.getChars(nameStart);
		this._endToken([name]);
		this._attemptCharCodeUntilFn(isNotWhitespace);
		if (this._cursor.peek() !== 40) return;
		this._openDirectiveCount++;
		this._beginToken(41);
		this._cursor.advance();
		this._endToken([]);
		this._attemptCharCodeUntilFn(isNotWhitespace);
		while (!isAttributeTerminator(this._cursor.peek()) && this._cursor.peek() !== 41) this._consumeAttribute();
		this._attemptCharCodeUntilFn(isNotWhitespace);
		this._openDirectiveCount--;
		if (this._cursor.peek() !== 41) {
			if (this._cursor.peek() === 62 || this._cursor.peek() === 47) return;
			throw this._createError(_unexpectedCharacterErrorMsg(this._cursor.peek()), this._cursor.getSpan(start));
		}
		this._beginToken(42);
		this._cursor.advance();
		this._endToken([]);
		this._attemptCharCodeUntilFn(isNotWhitespace);
	}
	/** @returns {string} */ _getProcessedChars(/** @type {PlainCharacterCursor} */ start, /** @type {PlainCharacterCursor} */ end) {
		return this._processCarriageReturns(end.getChars(start));
	}
	/** @returns {boolean} */ _isTextEnd() {
		if (this._isTagStart() || this._cursor.peek() === 0) return true;
		if (this._tokenizeIcu && !this._inInterpolation) {
			if (this.isExpansionFormStart()) return true;
			if (this._cursor.peek() === 125 && this._isInExpansionCase()) return true;
		}
		if (this._tokenizeBlocks && !this._inInterpolation && !this._isInExpansion() && (this._isBlockStart() || this._isLetStart() || this._cursor.peek() === 125)) return true;
		return false;
	}
	/**
	* Returns true if the current cursor is pointing to the start of a tag
	* (opening/closing/comments/cdata/etc).
	* @returns {boolean}
	*/
	_isTagStart() {
		if (this._cursor.peek() === 60) {
			const tmp = this._cursor.clone();
			tmp.advance();
			const code = tmp.peek();
			if (97 <= code && code <= 122 || 65 <= code && code <= 90 || code === 47 || code === 33 || code === 63) return true;
		}
		return false;
	}
	/** @returns {string} */ _readUntil(/** @type {number} */ char) {
		const start = this._cursor.clone();
		this._attemptUntilChar(char);
		return this._cursor.getChars(start);
	}
	/** @returns {boolean} */ _isInExpansion() {
		return this._isInExpansionCase() || this._isInExpansionForm();
	}
	/** @returns {boolean} */ _isInExpansionCase() {
		return this._expansionCaseStack.length > 0 && this._expansionCaseStack[this._expansionCaseStack.length - 1] === 23;
	}
	/** @returns {boolean} */ _isInExpansionForm() {
		return this._expansionCaseStack.length > 0 && this._expansionCaseStack[this._expansionCaseStack.length - 1] === 21;
	}
	/** @returns {boolean} */ isExpansionFormStart() {
		if (this._cursor.peek() !== 123) return false;
		const start = this._cursor.clone();
		const isInterpolation = this._attemptStr(INTERPOLATION.start);
		this._cursor = start;
		return !isInterpolation;
	}
	_handleFullNameStackForTagOpen(/** @type {string} */ prefix, /** @type {string} */ tagName) {
		const fullName = mergeNsAndName(prefix, tagName);
		if (this._fullNameStack.length === 0 || this._fullNameStack[this._fullNameStack.length - 1] === fullName) this._fullNameStack.push(fullName);
	}
	_handleFullNameStackForTagClose(/** @type {string} */ prefix, /** @type {string} */ tagName) {
		const fullName = mergeNsAndName(prefix, tagName);
		if (this._fullNameStack.length !== 0 && this._fullNameStack[this._fullNameStack.length - 1] === fullName) this._fullNameStack.pop();
	}
};
/** @returns {boolean} */ function isNotWhitespace(/** @type {number} */ code) {
	return !isWhitespace(code) || code === 0;
}
/** @returns {boolean} */ function isNameEnd(/** @type {number} */ code) {
	return isWhitespace(code) || code === 62 || code === 60 || code === 47 || code === 39 || code === 34 || code === 61 || code === 0;
}
/** @returns {boolean} */ function isPrefixEnd(/** @type {number} */ code) {
	return (code < 97 || 122 < code) && (code < 65 || 90 < code) && (code < 48 || code > 57);
}
/** @returns {boolean} */ function isDigitEntityEnd(/** @type {number} */ code) {
	return code === 59 || code === 0 || !isAsciiHexDigit(code);
}
/** @returns {boolean} */ function isNamedEntityEnd(/** @type {number} */ code) {
	return code === 59 || code === 0 || !(isAsciiLetter(code) || isDigit(code));
}
/** @returns {boolean} */ function isExpansionCaseStart(/** @type {number} */ peek) {
	return peek !== 125;
}
/** @returns {boolean} */ function compareCharCodeCaseInsensitive(/** @type {number} */ code1, /** @type {number} */ code2) {
	return toUpperCaseCharCode(code1) === toUpperCaseCharCode(code2);
}
/** @returns {number} */ function toUpperCaseCharCode(/** @type {number} */ code) {
	return code >= 97 && code <= 122 ? code - 97 + 65 : code;
}
/** @returns {boolean} */ function isBlockNameChar(/** @type {number} */ code) {
	return isAsciiLetter(code) || isDigit(code) || code === 95;
}
/** @returns {boolean} */ function isBlockParameterChar(/** @type {number} */ code) {
	return code !== 59 && isNotWhitespace(code);
}
function isSelectorlessNameStart(code) {
	return code === 95 || code >= 65 && code <= 90;
}
function isSelectorlessNameChar(code) {
	return isAsciiLetter(code) || isDigit(code) || code === 95;
}
/** @returns {boolean} */ function isAttributeTerminator(/** @type {number} */ code) {
	return code === 47 || code === 62 || code === 60 || code === 0;
}
/** @returns {any[]} */ function mergeTextTokens(/** @type {any[]} */ srcTokens) {
	const dstTokens = [];
	let lastDstToken = void 0;
	for (let i = 0; i < srcTokens.length; i++) {
		const token = srcTokens[i];
		if (lastDstToken && lastDstToken.type === 5 && token.type === 5 || lastDstToken && lastDstToken.type === 17 && token.type === 17) {
			lastDstToken.parts[0] += token.parts[0];
			lastDstToken.sourceSpan.end = token.sourceSpan.end;
		} else {
			lastDstToken = token;
			dstTokens.push(lastDstToken);
		}
	}
	return dstTokens;
}
var PlainCharacterCursor = class PlainCharacterCursor {
	/** @type {CursorState} */ state;
	/** @type {import("../../../prettier/node_modules/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseSourceFile} */ file;
	/** @type {string} */ input;
	/** @type {number} */ end;
	constructor(fileOrCursor, range) {
		if (fileOrCursor instanceof PlainCharacterCursor) {
			this.file = fileOrCursor.file;
			this.input = fileOrCursor.input;
			this.end = fileOrCursor.end;
			/** @type {CursorState} */
			const state = fileOrCursor.state;
			this.state = {
				peek: state.peek,
				offset: state.offset,
				line: state.line,
				column: state.column
			};
		} else {
			if (!range) throw new Error("Programming error: the range argument must be provided with a file argument.");
			this.file = fileOrCursor;
			this.input = fileOrCursor.content;
			this.end = range.endPos;
			this.state = {
				peek: -1,
				offset: range.startPos,
				line: range.startLine,
				column: range.startCol
			};
		}
	}
	clone() {
		return new PlainCharacterCursor(this);
	}
	/** @returns {number} */ peek() {
		return this.state.peek;
	}
	/** @returns {number} */ charsLeft() {
		return this.end - this.state.offset;
	}
	/** @returns {number} */ diff(/** @type {PlainCharacterCursor} */ other) {
		return this.state.offset - other.state.offset;
	}
	advance() {
		this.advanceState(this.state);
	}
	init() {
		this.updatePeek(this.state);
	}
	/** @returns {import("../../../prettier/node_modules/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseSourceSpan} */ getSpan(/** @type {PlainCharacterCursor | undefined} */ start, leadingTriviaCodePoints) {
		start = start || this;
		let fullStart = start;
		if (leadingTriviaCodePoints) while (this.diff(start) > 0 && leadingTriviaCodePoints.indexOf(start.peek()) !== -1) {
			if (fullStart === start) start = start.clone();
			start.advance();
		}
		const startLocation = this.locationFromCursor(start);
		const endLocation = this.locationFromCursor(this);
		const fullStartLocation = fullStart !== start ? this.locationFromCursor(fullStart) : startLocation;
		return new ParseSourceSpan(startLocation, endLocation, fullStartLocation);
	}
	getChars(start) {
		return this.input.substring(start.state.offset, this.state.offset);
	}
	/** @returns {number} */ charAt(/** @type {number} */ pos) {
		return this.input.charCodeAt(pos);
	}
	advanceState(/** @type {CursorState} */ state) {
		if (state.offset >= this.end) {
			this.state = state;
			throw new CursorError("Unexpected character \"EOF\"", this);
		}
		const currentChar = this.charAt(state.offset);
		if (currentChar === 10) {
			state.line++;
			state.column = 0;
		} else if (!isNewLine(currentChar)) state.column++;
		state.offset++;
		this.updatePeek(state);
	}
	updatePeek(/** @type {CursorState} */ state) {
		state.peek = state.offset >= this.end ? 0 : this.charAt(state.offset);
	}
	/** @returns {import("../../../prettier/node_modules/angular-html-parser/dist/compiler/src/parse_util.mjs").ParseLocation} */ locationFromCursor(/** @type {PlainCharacterCursor} */ cursor) {
		return new ParseLocation(cursor.file, cursor.state.offset, cursor.state.line, cursor.state.column);
	}
};
var EscapedCharacterCursor = class EscapedCharacterCursor extends PlainCharacterCursor {
	internalState;
	constructor(fileOrCursor, range) {
		if (fileOrCursor instanceof EscapedCharacterCursor) {
			super(fileOrCursor);
			this.internalState = { ...fileOrCursor.internalState };
		} else {
			super(fileOrCursor, range);
			this.internalState = this.state;
		}
	}
	advance() {
		this.state = this.internalState;
		super.advance();
		this.processEscapeSequence();
	}
	init() {
		super.init();
		this.processEscapeSequence();
	}
	clone() {
		return new EscapedCharacterCursor(this);
	}
	getChars(start) {
		const cursor = start.clone();
		let chars = "";
		while (cursor.internalState.offset < this.internalState.offset) {
			chars += String.fromCodePoint(cursor.peek());
			cursor.advance();
		}
		return chars;
	}
	/**
	* Process the escape sequence that starts at the current position in the text.
	*
	* This method is called to ensure that `peek` has the unescaped value of escape sequences.
	*/
	processEscapeSequence() {
		const peek = () => this.internalState.peek;
		if (peek() === 92) {
			this.internalState = { ...this.state };
			this.advanceState(this.internalState);
			if (peek() === 110) this.state.peek = 10;
			else if (peek() === 114) this.state.peek = 13;
			else if (peek() === 118) this.state.peek = 11;
			else if (peek() === 116) this.state.peek = 9;
			else if (peek() === 98) this.state.peek = 8;
			else if (peek() === 102) this.state.peek = 12;
			else if (peek() === 117) {
				this.advanceState(this.internalState);
				if (peek() === 123) {
					this.advanceState(this.internalState);
					const digitStart = this.clone();
					let length = 0;
					while (peek() !== 125) {
						this.advanceState(this.internalState);
						length++;
					}
					this.state.peek = this.decodeHexDigits(digitStart, length);
				} else {
					const digitStart = this.clone();
					this.advanceState(this.internalState);
					this.advanceState(this.internalState);
					this.advanceState(this.internalState);
					this.state.peek = this.decodeHexDigits(digitStart, 4);
				}
			} else if (peek() === 120) {
				this.advanceState(this.internalState);
				const digitStart = this.clone();
				this.advanceState(this.internalState);
				this.state.peek = this.decodeHexDigits(digitStart, 2);
			} else if (isOctalDigit(peek())) {
				let octal = "";
				let length = 0;
				let previous = this.clone();
				while (isOctalDigit(peek()) && length < 3) {
					previous = this.clone();
					octal += String.fromCodePoint(peek());
					this.advanceState(this.internalState);
					length++;
				}
				this.state.peek = parseInt(octal, 8);
				this.internalState = previous.internalState;
			} else if (isNewLine(this.internalState.peek)) {
				this.advanceState(this.internalState);
				this.state = this.internalState;
			} else this.state.peek = this.internalState.peek;
		}
	}
	decodeHexDigits(start, length) {
		const hex = this.input.slice(start.internalState.offset, start.internalState.offset + length);
		const charCode = parseInt(hex, 16);
		if (!isNaN(charCode)) return charCode;
		else {
			start.state = start.internalState;
			throw new CursorError("Invalid hexadecimal escape sequence", start);
		}
	}
};
var CursorError = class extends Error {
	/** @type {string} */ msg;
	/** @type {PlainCharacterCursor} */ cursor;
	constructor(/** @type {string} */ msg, /** @type {PlainCharacterCursor} */ cursor) {
		super(msg);
		this.msg = msg;
		this.cursor = cursor;
		Object.setPrototypeOf(this, new.target.prototype);
	}
};
//#endregion
export { CursorError, SUPPORTED_BLOCKS, TokenizeResult, tokenize };
