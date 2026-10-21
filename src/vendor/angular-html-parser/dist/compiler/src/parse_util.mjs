// @nts-check
//#region ../compiler/src/parse_util.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var ParseLocation = class ParseLocation {
	/** @type {any} */ file;
	/** @type {number} */ offset;
	/** @type {number} */ line;
	/** @type {number} */ col;
	constructor(/** @type {ParseSourceFile} */ file, /** @type {number} */ offset, /** @type {number} */ line, /** @type {number} */ col) {
		this.file = file;
		this.offset = offset;
		this.line = line;
		this.col = col;
	}
	toString() {
		return this.offset != null ? `${this.file.url}@${this.line}:${this.col}` : this.file.url;
	}
	/** @returns {ParseLocation} */ moveBy(/** @type {number} */ delta) {
		const source = this.file.content;
		const len = source.length;
		/** @type {number} */ let offset = this.offset;
		/** @type {number} */ let line = this.line;
		/** @type {number} */ let col = this.col;
		while (offset > 0 && delta < 0) {
			offset--;
			delta++;
			if (source.charCodeAt(offset) == 10) {
				line--;
				const priorLine = source.substring(0, offset - 1).lastIndexOf(String.fromCharCode(10));
				col = priorLine > 0 ? offset - priorLine : offset;
			} else col--;
		}
		while (offset < len && delta > 0) {
			const ch = source.charCodeAt(offset);
			offset++;
			delta--;
			if (ch == 10) {
				line++;
				col = 0;
			} else col++;
		}
		return new ParseLocation(this.file, offset, line, col);
	}
	getContext(maxChars, maxLines) {
		const content = this.file.content;
		let startOffset = this.offset;
		if (startOffset != null) {
			if (startOffset > content.length - 1) startOffset = content.length - 1;
			let endOffset = startOffset;
			let ctxChars = 0;
			let ctxLines = 0;
			while (ctxChars < maxChars && startOffset > 0) {
				startOffset--;
				ctxChars++;
				if (content[startOffset] == "\n") {
					if (++ctxLines == maxLines) break;
				}
			}
			ctxChars = 0;
			ctxLines = 0;
			while (ctxChars < maxChars && endOffset < content.length - 1) {
				endOffset++;
				ctxChars++;
				if (content[endOffset] == "\n") {
					if (++ctxLines == maxLines) break;
				}
			}
			return {
				before: content.substring(startOffset, this.offset),
				after: content.substring(this.offset, endOffset + 1)
			};
		}
		return null;
	}
};
var ParseSourceFile = class {
	/** @type {string} */ content;
	/** @type {string | undefined} */ url;
	constructor(/** @type {string} */ content, /** @type {string} */ url) {
		this.content = content;
		this.url = url;
	}
};
var ParseSourceSpan = class {
	/** @type {ParseLocation} */ start;
	/** @type {ParseLocation} */ end;
	/** @type {ParseLocation} */ fullStart;
	/** @type {string | null} */ details;
	/**
	* Create an object that holds information about spans of tokens/nodes captured during
	* lexing/parsing of text.
	*
	* @param start
	* The location of the start of the span (having skipped leading trivia).
	* Skipping leading trivia makes source-spans more "user friendly", since things like HTML
	* elements will appear to begin at the start of the opening tag, rather than at the start of any
	* leading trivia, which could include newlines.
	*
	* @param end
	* The location of the end of the span.
	*
	* @param fullStart
	* The start of the token without skipping the leading trivia.
	* This is used by tooling that splits tokens further, such as extracting Angular interpolations
	* from text tokens. Such tooling creates new source-spans relative to the original token's
	* source-span. If leading trivia characters have been skipped then the new source-spans may be
	* incorrectly offset.
	*
	* @param details
	* Additional information (such as identifier names) that should be associated with the span.
	*/
	constructor(/** @type {ParseLocation} */ start, /** @type {ParseLocation} */ end, /** @type {ParseLocation} */ fullStart = start, /** @type {string | null} */ details = null) {
		this.start = start;
		this.end = end;
		this.fullStart = fullStart;
		this.details = details;
	}
	/** @returns {string} */ toString() {
		return this.start.file.content.substring(this.start.offset, this.end.offset);
	}
};
let ParseErrorLevel = /* @__PURE__ */ function(ParseErrorLevel) {
	ParseErrorLevel[ParseErrorLevel["WARNING"] = 0] = "WARNING";
	ParseErrorLevel[ParseErrorLevel["ERROR"] = 1] = "ERROR";
	return ParseErrorLevel;
}({});
var ParseError = class extends Error {
	/** @type {ParseSourceSpan} */ span;
	/** @type {string} */ msg;
	/** @type {number} */ level;
	relatedError;
	constructor(/** @type {ParseSourceSpan} */ span, /** @type {string} */ msg, level = 1, relatedError) {
		super(msg);
		this.span = span;
		this.msg = msg;
		this.level = level;
		this.relatedError = relatedError;
		Object.setPrototypeOf(this, new.target.prototype);
	}
	contextualMessage() {
		const ctx = this.span.start.getContext(100, 3);
		return ctx ? `${this.msg} ("${ctx.before}[${ParseErrorLevel[this.level]} ->]${ctx.after}")` : this.msg;
	}
	toString() {
		const details = this.span.details ? `, ${this.span.details}` : "";
		return `${this.contextualMessage()}: ${this.span.start}${details}`;
	}
};
//#endregion
export { ParseError, ParseErrorLevel, ParseLocation, ParseSourceFile, ParseSourceSpan };
