// @nts-check
import { getNsPrefix, mergeNsAndName, splitNsName } from "./tags.mjs";
import { ParseError, ParseSourceSpan } from "../parse_util.mjs";
import { Attribute, Block, BlockParameter, CDATA, Comment, Component, Directive, DocType, Element, Expansion, ExpansionCase, LetDeclaration, StartTagComment, Text } from "./ast.mjs";
import { NAMED_ENTITIES } from "./entities.mjs";
import { tokenize } from "./lexer.mjs";
/**
 * @import {Token} from "angular-html-parser-types"
 * @typedef {import("./lexer.mjs").GetTagContentType} GetTagContentType
 * @typedef {import("./html_tags.mjs").HtmlTagDefinition} HtmlTagDefinition
 * @typedef {import("../parse_util.mjs").ParseLocation} ParseLocation
 */
//#region ../compiler/src/ml_parser/parser.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var TreeError = class TreeError extends ParseError {
	/** @type {string | null} */ elementName;
	/** @returns {TreeError} */ static create(/** @type {string | null} */ elementName, /** @type {ParseSourceSpan} */ span, /** @type {string} */ msg) {
		return new TreeError(elementName, span, msg);
	}
	constructor(/** @type {string | null} */ elementName, /** @type {ParseSourceSpan} */ span, /** @type {string} */ msg) {
		super(span, msg);
		this.elementName = elementName;
	}
};
var ParseTreeResult = class {
	/** @type {any[]} */ rootNodes;
	/** @type {ParseError[]} */ errors;
	constructor(/** @type {any[]} */ rootNodes, /** @type {ParseError[]} */ errors) {
		this.rootNodes = rootNodes;
		this.errors = errors;
	}
};
var Parser = class {
	getTagDefinition;
	constructor(getTagDefinition) {
		this.getTagDefinition = getTagDefinition;
	}
	parse(source, url, options, isTagNameCaseSensitive = false, getTagContentType) {
		const lowercasify = (fn) => /** @returns {import("./html_tags.mjs").HtmlTagDefinition} */ (/** @type {string} */ x, ...args) => fn(x.toLowerCase(), ...args);
		/** @type {(tagName: string) => HtmlTagDefinition} */ const getTagDefinition = isTagNameCaseSensitive ? this.getTagDefinition : lowercasify(this.getTagDefinition);
		const getDefaultTagContentType = /** @returns {number} */ (/** @type {string} */ tagName) => getTagDefinition(tagName).getContentType();
		const getTagContentTypeWithProcessedTagName = isTagNameCaseSensitive ? getTagContentType : lowercasify(getTagContentType);
		const tokenizeResult = tokenize(source, url, getTagContentType ? /** @returns {number} */ (/** @type {string} */ tagName, /** @type {string} */ prefix, /** @type {boolean} */ hasParent, /** @type {any[]} */ attrs) => {
			const contentType = getTagContentTypeWithProcessedTagName(tagName, prefix, hasParent, attrs);
			return contentType !== void 0 ? contentType : getDefaultTagContentType(tagName);
		} : getDefaultTagContentType, options);
		const canSelfClose = options && options.canSelfClose || false;
		const allowHtmComponentClosingTags = options && options.allowHtmComponentClosingTags || false;
		const parser = new _TreeBuilder(tokenizeResult.tokens, getTagDefinition, canSelfClose, allowHtmComponentClosingTags, isTagNameCaseSensitive);
		parser.build();
		return new ParseTreeResult(parser.rootNodes, [...tokenizeResult.errors, ...parser.errors]);
	}
};
var _TreeBuilder = class _TreeBuilder {
	/** @type {Token[]} */ tokens;
	/** @type {(tagName: string) => HtmlTagDefinition} */ tagDefinitionResolver;
	/** @type {boolean} */ canSelfClose;
	/** @type {boolean} */ allowHtmComponentClosingTags;
	/** @type {boolean} */ isTagNameCaseSensitive;
	/** @type {number} */ _index = -1;
	/** @type {Token} */ _peek;
	/** @type {(Element | Block)[]} */ _containerStack = [];
	/** @type {any[]} */ rootNodes = [];
	/** @type {ParseError[]} */ errors = [];
	constructor(/** @type {Token[]} */ tokens, /** @type {(tagName: string) => HtmlTagDefinition} */ tagDefinitionResolver, /** @type {boolean} */ canSelfClose, /** @type {boolean} */ allowHtmComponentClosingTags, /** @type {boolean} */ isTagNameCaseSensitive) {
		this.tokens = tokens;
		this.tagDefinitionResolver = tagDefinitionResolver;
		this.canSelfClose = canSelfClose;
		this.allowHtmComponentClosingTags = allowHtmComponentClosingTags;
		this.isTagNameCaseSensitive = isTagNameCaseSensitive;
		this._advance();
	}
	build() {
		while (this._peek.type !== 44) if (this._peek.type === 0 || this._peek.type === 4) this._consumeElementStartTag(this._advance());
		else if (this._peek.type === 3) {
			this._closeVoidElement();
			this._consumeElementEndTag(this._advance());
		} else if (this._peek.type === 13) {
			this._closeVoidElement();
			this._consumeCdata(this._advance());
		} else if (this._peek.type === 10) {
			this._closeVoidElement();
			this._consumeComment(this._advance());
		} else if (this._peek.type === 5 || this._peek.type === 7 || this._peek.type === 6) {
			this._closeVoidElement();
			this._consumeText(this._advance());
		} else if (this._peek.type === 21) this._consumeExpansion(this._advance());
		else if (this._peek.type === 26) {
			this._closeVoidElement();
			this._consumeBlockOpen(this._advance());
		} else if (this._peek.type === 28) {
			this._closeVoidElement();
			this._consumeBlockClose(this._advance());
		} else if (this._peek.type === 30) {
			this._closeVoidElement();
			this._consumeIncompleteBlock(this._advance());
		} else if (this._peek.type === 31) {
			this._closeVoidElement();
			this._consumeLet(this._advance());
		} else if (this._peek.type === 19) this._consumeDocType(this._advance());
		else if (this._peek.type === 34) {
			this._closeVoidElement();
			this._consumeIncompleteLet(this._advance());
		} else if (this._peek.type === 35 || this._peek.type === 39) this._consumeComponentStartTag(this._advance());
		else if (this._peek.type === 38) this._consumeComponentEndTag(this._advance());
		else this._advance();
		for (const leftoverContainer of this._containerStack) if (leftoverContainer instanceof Block) this.errors.push(TreeError.create(leftoverContainer.name, leftoverContainer.sourceSpan, `Unclosed block "${leftoverContainer.name}"`));
	}
	/** @returns {Token} */ _advance() {
		const prev = this._peek;
		if (this._index < this.tokens.length - 1) this._index++;
		this._peek = this.tokens[this._index];
		return prev;
	}
	/** @returns {Token | null} */ _advanceIf(/** @type {number} */ type) {
		if (this._peek.type === type) return this._advance();
		return null;
	}
	_consumeCdata(/** @type {Token} */ startToken) {
		const text = this._advance();
		const value = this._getText(text);
		const endToken = this._advanceIf(14);
		this._addToParent(new CDATA(value, new ParseSourceSpan(startToken.sourceSpan.start, (endToken || text).sourceSpan.end), [text]));
	}
	_consumeComment(/** @type {Token} */ token) {
		const text = this._advanceIf(7);
		const endToken = this._advanceIf(11);
		const value = text != null ? text.parts[0].trim() : null;
		const sourceSpan = endToken == null ? token.sourceSpan : new ParseSourceSpan(token.sourceSpan.start, endToken.sourceSpan.end, token.sourceSpan.fullStart);
		this._addToParent(new Comment(value, sourceSpan));
	}
	_consumeDocType(/** @type {Token} */ startToken) {
		const text = this._advanceIf(7);
		const endToken = this._advanceIf(20);
		const value = text != null ? text.parts[0].trim() : null;
		const sourceSpan = new ParseSourceSpan(startToken.sourceSpan.start, (endToken || text || startToken).sourceSpan.end);
		this._addToParent(new DocType(value, sourceSpan));
	}
	_consumeExpansion(/** @type {Token} */ token) {
		const switchValue = this._advance();
		const type = this._advance();
		/** @type {ExpansionCase[]} */ const cases = [];
		while (this._peek.type === 22) {
			const expCase = this._parseExpansionCase();
			if (!expCase) return;
			cases.push(expCase);
		}
		if (this._peek.type !== 25) {
			this.errors.push(TreeError.create(null, this._peek.sourceSpan, `Invalid ICU message. Missing '}'.`));
			return;
		}
		const sourceSpan = new ParseSourceSpan(token.sourceSpan.start, this._peek.sourceSpan.end, token.sourceSpan.fullStart);
		this._addToParent(new Expansion(switchValue.parts[0], type.parts[0], cases, sourceSpan, switchValue.sourceSpan));
		this._advance();
	}
	/** @returns {ExpansionCase | null} */ _parseExpansionCase() {
		const value = this._advance();
		if (this._peek.type !== 23) {
			this.errors.push(TreeError.create(null, this._peek.sourceSpan, `Invalid ICU message. Missing '{'.`));
			return null;
		}
		const start = this._advance();
		const exp = this._collectExpansionExpTokens(start);
		if (!exp) return null;
		const end = this._advance();
		exp.push({
			type: 44,
			parts: [],
			sourceSpan: end.sourceSpan
		});
		const expansionCaseParser = new _TreeBuilder(exp, this.tagDefinitionResolver, this.canSelfClose, this.allowHtmComponentClosingTags, this.isTagNameCaseSensitive);
		expansionCaseParser.build();
		if (expansionCaseParser.errors.length > 0) {
			this.errors = this.errors.concat(expansionCaseParser.errors);
			return null;
		}
		const sourceSpan = new ParseSourceSpan(value.sourceSpan.start, end.sourceSpan.end, value.sourceSpan.fullStart);
		const expSourceSpan = new ParseSourceSpan(start.sourceSpan.start, end.sourceSpan.end, start.sourceSpan.fullStart);
		return new ExpansionCase(value.parts[0], expansionCaseParser.rootNodes, sourceSpan, value.sourceSpan, expSourceSpan);
	}
	/** @returns {Token[] | null} */ _collectExpansionExpTokens(/** @type {Token} */ start) {
		/** @type {Token[]} */ const exp = [];
		/** @type {number[]} */ const expansionFormStack = [23];
		while (true) {
			if (this._peek.type === 21 || this._peek.type === 23) expansionFormStack.push(this._peek.type);
			if (this._peek.type === 24) {
				if (lastOnStack(expansionFormStack, 23)) {
					expansionFormStack.pop();
					if (expansionFormStack.length === 0) return exp;
				} else {
					this.errors.push(TreeError.create(null, start.sourceSpan, `Invalid ICU message. Missing '}'.`));
					return null;
				}
			}
			if (this._peek.type === 25) {
				if (lastOnStack(expansionFormStack, 21)) expansionFormStack.pop();
				else {
					this.errors.push(TreeError.create(null, start.sourceSpan, `Invalid ICU message. Missing '}'.`));
					return null;
				}
			}
			if (this._peek.type === 44) {
				this.errors.push(TreeError.create(null, start.sourceSpan, `Invalid ICU message. Missing '}'.`));
				return null;
			}
			exp.push(this._advance());
		}
	}
	/** @returns {string} */ _getText(/** @type {Token} */ token) {
		let text = token.parts[0];
		if (text.length > 0 && text[0] == "\n") {
			/** @type {HtmlTagDefinition | null} */ var _this$_getTagDefiniti;
			const parent = this._getClosestElementLikeParent();
			if (parent != null && parent.children.length == 0 && ((_this$_getTagDefiniti = this._getTagDefinition(parent)) === null || _this$_getTagDefiniti === void 0 ? void 0 : _this$_getTagDefiniti.ignoreFirstLf)) text = text.substring(1);
		}
		return text;
	}
	_consumeText(/** @type {Token} */ token) {
		/** @type {Token[]} */ const tokens = [token];
		const startSpan = token.sourceSpan;
		let text = token.parts[0];
		if (text.length > 0 && text[0] === "\n") {
			/** @type {HtmlTagDefinition | null} */ var _this$_getTagDefiniti2;
			const parent = this._getContainer();
			if (parent != null && parent.children.length === 0 && ((_this$_getTagDefiniti2 = this._getTagDefinition(parent)) === null || _this$_getTagDefiniti2 === void 0 ? void 0 : _this$_getTagDefiniti2.ignoreFirstLf)) {
				text = text.substring(1);
				tokens[0] = {
					type: token.type,
					sourceSpan: token.sourceSpan,
					parts: [text]
				};
			}
		}
		while (this._peek.type === 8 || this._peek.type === 5 || this._peek.type === 9) {
			token = this._advance();
			tokens.push(token);
			if (token.type === 8) text += token.parts.join("").replace(/&([^;]+);/g, decodeEntity);
			else if (token.type === 9) text += token.parts[0];
			else text += token.parts.join("");
		}
		if (text.length > 0) {
			const endSpan = token.sourceSpan;
			this._addToParent(new Text(text, new ParseSourceSpan(startSpan.start, endSpan.end, startSpan.fullStart, startSpan.details), tokens));
		}
	}
	_closeVoidElement() {
		/** @type {HtmlTagDefinition | null} */ var _this$_getTagDefiniti3;
		const el = this._getContainer();
		if (el !== null && ((_this$_getTagDefiniti3 = this._getTagDefinition(el)) === null || _this$_getTagDefiniti3 === void 0 ? void 0 : _this$_getTagDefiniti3.isVoid)) this._containerStack.pop();
	}
	_consumeElementStartTag(/** @type {Token} */ startTagToken) {
		/** @type {HtmlTagDefinition | null} */ var _this$_getTagDefiniti4;
		/** @type {Attribute[]} */ const attrs = [];
		/** @type {Directive[]} */ const directives = [];
		/** @type {StartTagComment[]} */ const comments = [];
		this._consumeAttributesAndDirectives(attrs, directives, comments);
		const fullName = this._getElementFullName(startTagToken, this._getClosestElementLikeParent());
		const tagDef = this._getTagDefinition(fullName);
		let selfClosing = false;
		if (this._peek.type === 2) {
			this._advance();
			selfClosing = true;
			const tagDef = this._getTagDefinition(fullName);
			if (!(this.canSelfClose || (tagDef === null || tagDef === void 0 ? void 0 : tagDef.canSelfClose) || getNsPrefix(fullName) !== null || (tagDef === null || tagDef === void 0 ? void 0 : tagDef.isVoid))) this.errors.push(TreeError.create(fullName, startTagToken.sourceSpan, `Only void, custom and foreign elements can be self closed "${startTagToken.parts[1]}"`));
		} else if (this._peek.type === 1) {
			this._advance();
			selfClosing = false;
		}
		const end = this._peek.sourceSpan.fullStart;
		const span = new ParseSourceSpan(startTagToken.sourceSpan.start, end, startTagToken.sourceSpan.fullStart);
		const startSpan = new ParseSourceSpan(startTagToken.sourceSpan.start, end, startTagToken.sourceSpan.fullStart);
		const nameSpan = new ParseSourceSpan(startTagToken.sourceSpan.start.moveBy(1), startTagToken.sourceSpan.end);
		const el = new Element(fullName, attrs, directives, [], selfClosing, span, startSpan, void 0, nameSpan, (tagDef === null || tagDef === void 0 ? void 0 : tagDef.isVoid) ?? false, void 0, comments);
		const parent = this._getContainer();
		const isClosedByChild = parent !== null && !!((_this$_getTagDefiniti4 = this._getTagDefinition(parent)) === null || _this$_getTagDefiniti4 === void 0 ? void 0 : _this$_getTagDefiniti4.isClosedByChild(el.name));
		this._pushContainer(el, isClosedByChild);
		if (selfClosing) this._popContainer(fullName, Element, span);
		else if (startTagToken.type === 4) {
			this._popContainer(fullName, Element, null);
			this.errors.push(TreeError.create(fullName, span, `Opening tag "${fullName}" not terminated.`));
		}
	}
	_consumeComponentStartTag(/** @type {Token} */ startToken) {
		/** @type {HtmlTagDefinition | null} */ var _this$_getTagDefiniti5;
		const componentName = startToken.parts[0];
		/** @type {Attribute[]} */ const attrs = [];
		/** @type {Directive[]} */ const directives = [];
		/** @type {StartTagComment[]} */ const comments = [];
		this._consumeAttributesAndDirectives(attrs, directives, comments);
		const closestElement = this._getClosestElementLikeParent();
		const tagName = this._getComponentTagName(startToken, closestElement);
		const fullName = this._getComponentFullName(startToken, closestElement);
		const selfClosing = this._peek.type === 37;
		this._advance();
		const end = this._peek.sourceSpan.fullStart;
		const span = new ParseSourceSpan(startToken.sourceSpan.start, end, startToken.sourceSpan.fullStart);
		const startSpan = new ParseSourceSpan(startToken.sourceSpan.start, end, startToken.sourceSpan.fullStart);
		const node = new Component(componentName, tagName, fullName, attrs, directives, [], selfClosing, span, startSpan, void 0, void 0, comments);
		const parent = this._getContainer();
		const isClosedByChild = parent !== null && node.tagName !== null && !!((_this$_getTagDefiniti5 = this._getTagDefinition(parent)) === null || _this$_getTagDefiniti5 === void 0 ? void 0 : _this$_getTagDefiniti5.isClosedByChild(node.tagName));
		this._pushContainer(node, isClosedByChild);
		if (selfClosing) this._popContainer(fullName, Component, span);
		else if (startToken.type === 39) {
			this._popContainer(fullName, Component, null);
			this.errors.push(TreeError.create(fullName, span, `Opening tag "${fullName}" not terminated.`));
		}
	}
	_consumeAttributesAndDirectives(/** @type {Attribute[]} */ attributesResult, /** @type {Directive[]} */ directivesResult, /** @type {StartTagComment[]} */ commentsResult) {
		while (this._peek.type === 15 || this._peek.type === 40 || this._peek.type === 12) if (this._peek.type === 40) directivesResult.push(this._consumeDirective(this._peek));
		else if (this._peek.type === 15) attributesResult.push(this._consumeAttr(this._advance()));
		else {
			const commentToken = this._advance();
			commentsResult.push(new StartTagComment(commentToken.parts[0], commentToken.parts[1], commentToken.sourceSpan));
		}
	}
	_consumeComponentEndTag(/** @type {Token} */ endToken) {
		const fullName = this._getComponentFullName(endToken, this._getClosestElementLikeParent());
		if (!this._popContainer(fullName, Component, endToken.sourceSpan)) {
			const container = this._containerStack[this._containerStack.length - 1];
			/** @type {string} */ let suffix;
			if (container instanceof Component && container.componentName === endToken.parts[0]) suffix = `, did you mean "${container.fullName}"?`;
			else suffix = ". It may happen when the tag has already been closed by another tag.";
			const errMsg = `Unexpected closing tag "${fullName}"${suffix}`;
			this.errors.push(TreeError.create(fullName, endToken.sourceSpan, errMsg));
		}
	}
	/** @returns {import("./html_tags.mjs").HtmlTagDefinition | null} */ _getTagDefinition(/** @type {string | Element | Block | Component} */ nodeOrName) {
		if (typeof nodeOrName === "string") return this.tagDefinitionResolver(nodeOrName);
		else if (nodeOrName instanceof Element) return this.tagDefinitionResolver(nodeOrName.name);
		else if (nodeOrName instanceof Component && nodeOrName.tagName !== null) return this.tagDefinitionResolver(nodeOrName.tagName);
		else return null;
	}
	_pushContainer(/** @type {Element | Block} */ node, /** @type {boolean} */ isClosedByChild) {
		if (isClosedByChild) this._containerStack.pop();
		this._addToParent(node);
		this._containerStack.push(node);
	}
	_consumeElementEndTag(/** @type {Token} */ endTagToken) {
		/** @type {HtmlTagDefinition | null} */ var _this$_getTagDefiniti6;
		const fullName = this.allowHtmComponentClosingTags && endTagToken.parts.length === 0 ? null : this._getElementFullName(endTagToken, this._getClosestElementLikeParent());
		if (fullName && ((_this$_getTagDefiniti6 = this._getTagDefinition(fullName)) === null || _this$_getTagDefiniti6 === void 0 ? void 0 : _this$_getTagDefiniti6.isVoid)) this.errors.push(TreeError.create(fullName, endTagToken.sourceSpan, `Void elements do not have end tags "${endTagToken.parts[1]}"`));
		else if (!this._popContainer(fullName, Element, endTagToken.sourceSpan)) {
			const errMsg = `Unexpected closing tag "${fullName}". It may happen when the tag has already been closed by another tag. For more info see https://www.w3.org/TR/html5/syntax.html#closing-elements-that-have-implied-end-tags`;
			this.errors.push(TreeError.create(fullName, endTagToken.sourceSpan, errMsg));
		}
	}
	/**
	* Closes the nearest element with the tag name `fullName` in the parse tree.
	* `endSourceSpan` is the span of the closing tag, or null if the element does
	* not have a closing tag (for example, this happens when an incomplete
	* opening tag is recovered).
	* @returns {boolean}
	*/
	_popContainer(/** @type {string | null} */ expectedName, expectedType, /** @type {ParseSourceSpan | null} */ endSourceSpan) {
		let unexpectedCloseTagDetected = false;
		for (let stackIndex = this._containerStack.length - 1; stackIndex >= 0; stackIndex--) {
			/** @type {HtmlTagDefinition | null} */ var _this$_getTagDefiniti7;
			const node = this._containerStack[stackIndex];
			const nodeName = node instanceof Component ? node.fullName : node.name;
			if (getNsPrefix(nodeName) ? nodeName === expectedName : (nodeName === expectedName || expectedName === null) && node instanceof expectedType) {
				node.endSourceSpan = endSourceSpan;
				node.sourceSpan.end = endSourceSpan !== null ? endSourceSpan.end : node.sourceSpan.end;
				this._containerStack.splice(stackIndex, this._containerStack.length - stackIndex);
				return !unexpectedCloseTagDetected;
			}
			if (node instanceof Block || !((_this$_getTagDefiniti7 = this._getTagDefinition(node)) === null || _this$_getTagDefiniti7 === void 0 ? void 0 : _this$_getTagDefiniti7.closedByParent)) unexpectedCloseTagDetected = true;
		}
		return false;
	}
	/** @returns {Attribute} */ _consumeAttr(/** @type {Token} */ attrName) {
		const fullName = mergeNsAndName(attrName.parts[0], attrName.parts[1]);
		/** @type {ParseLocation} */ let attrEnd = attrName.sourceSpan.end;
		/** @type {Token | undefined} */ let startQuoteToken;
		if (this._peek.type === 16) startQuoteToken = this._advance();
		let value = "";
		/** @type {Token[]} */ const valueTokens = [];
		/** @type {ParseSourceSpan | undefined} */ let valueStartSpan = void 0;
		/** @type {ParseLocation | undefined} */ let valueEnd = void 0;
		if (this._peek.type === 17) {
			valueStartSpan = this._peek.sourceSpan;
			valueEnd = this._peek.sourceSpan.end;
			while (this._peek.type === 17 || this._peek.type === 18 || this._peek.type === 9) {
				const valueToken = this._advance();
				valueTokens.push(valueToken);
				if (valueToken.type === 18) value += valueToken.parts.join("").replace(/&([^;]+);/g, decodeEntity);
				else if (valueToken.type === 9) value += valueToken.parts[0];
				else value += valueToken.parts.join("");
				valueEnd = attrEnd = valueToken.sourceSpan.end;
			}
		}
		if (this._peek.type === 16) valueEnd = attrEnd = this._advance().sourceSpan.end;
		const valueSpan = valueStartSpan && valueEnd && new ParseSourceSpan((startQuoteToken === null || startQuoteToken === void 0 ? void 0 : startQuoteToken.sourceSpan.start) ?? valueStartSpan.start, valueEnd, (startQuoteToken === null || startQuoteToken === void 0 ? void 0 : startQuoteToken.sourceSpan.fullStart) ?? valueStartSpan.fullStart);
		return new Attribute(fullName, value, new ParseSourceSpan(attrName.sourceSpan.start, attrEnd, attrName.sourceSpan.fullStart), attrName.sourceSpan, valueSpan, valueTokens.length > 0 ? valueTokens : void 0, void 0);
	}
	_consumeDirective(/** @type {Token} */ nameToken) {
		/** @type {Attribute[]} */ const attributes = [];
		/** @type {ParseLocation} */ let startSourceSpanEnd = nameToken.sourceSpan.end;
		/** @type {ParseSourceSpan | null} */ let endSourceSpan = null;
		this._advance();
		if (this._peek.type === 41) {
			startSourceSpanEnd = this._peek.sourceSpan.end;
			this._advance();
			while (this._peek.type === 15) attributes.push(this._consumeAttr(this._advance()));
			if (this._peek.type === 42) {
				endSourceSpan = this._peek.sourceSpan;
				this._advance();
			} else this.errors.push(TreeError.create(null, nameToken.sourceSpan, "Unterminated directive definition"));
		}
		const startSourceSpan = new ParseSourceSpan(nameToken.sourceSpan.start, startSourceSpanEnd, nameToken.sourceSpan.fullStart);
		const sourceSpan = new ParseSourceSpan(startSourceSpan.start, endSourceSpan === null ? nameToken.sourceSpan.end : endSourceSpan.end, startSourceSpan.fullStart);
		return new Directive(nameToken.parts[0], attributes, sourceSpan, startSourceSpan, endSourceSpan);
	}
	_consumeBlockOpen(/** @type {Token} */ token) {
		/** @type {BlockParameter[]} */ const parameters = [];
		while (this._peek.type === 29) {
			const paramToken = this._advance();
			parameters.push(new BlockParameter(paramToken.parts[0], paramToken.sourceSpan));
		}
		if (this._peek.type === 27) this._advance();
		const end = this._peek.sourceSpan.fullStart;
		const span = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
		const startSpan = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
		const block = new Block(token.parts[0], parameters, [], span, token.sourceSpan, startSpan);
		this._pushContainer(block, false);
	}
	_consumeBlockClose(/** @type {Token} */ token) {
		const initialStackLength = this._containerStack.length;
		const topNode = this._containerStack[initialStackLength - 1];
		if (!this._popContainer(null, Block, token.sourceSpan)) {
			if (this._containerStack.length < initialStackLength) {
				const nodeName = topNode instanceof Component ? topNode.fullName : topNode.name;
				this.errors.push(TreeError.create(null, token.sourceSpan, `Unexpected closing block. The block may have been closed earlier. Did you forget to close the <${nodeName}> element? If you meant to write the \`}\` character, you should use the "&#125;" HTML entity instead.`));
				return;
			}
			this.errors.push(TreeError.create(null, token.sourceSpan, "Unexpected closing block. The block may have been closed earlier. If you meant to write the `}` character, you should use the \"&#125;\" HTML entity instead."));
		}
	}
	_consumeIncompleteBlock(/** @type {Token} */ token) {
		/** @type {BlockParameter[]} */ const parameters = [];
		while (this._peek.type === 29) {
			const paramToken = this._advance();
			parameters.push(new BlockParameter(paramToken.parts[0], paramToken.sourceSpan));
		}
		const end = this._peek.sourceSpan.fullStart;
		const span = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
		const startSpan = new ParseSourceSpan(token.sourceSpan.start, end, token.sourceSpan.fullStart);
		const block = new Block(token.parts[0], parameters, [], span, token.sourceSpan, startSpan);
		this._pushContainer(block, false);
		this._popContainer(null, Block, null);
		this.errors.push(TreeError.create(token.parts[0], span, `Incomplete block "${token.parts[0]}". If you meant to write the @ character, you should use the "&#64;" HTML entity instead.`));
	}
	_consumeLet(/** @type {Token} */ startToken) {
		const name = startToken.parts[0];
		/** @type {Token} */ let valueToken;
		/** @type {Token} */ let endToken;
		if (this._peek.type !== 32) {
			this.errors.push(TreeError.create(startToken.parts[0], startToken.sourceSpan, `Invalid @let declaration "${name}". Declaration must have a value.`));
			return;
		} else valueToken = this._advance();
		if (this._peek.type !== 33) {
			this.errors.push(TreeError.create(startToken.parts[0], startToken.sourceSpan, `Unterminated @let declaration "${name}". Declaration must be terminated with a semicolon.`));
			return;
		} else endToken = this._advance();
		const end = endToken.sourceSpan.end;
		const span = new ParseSourceSpan(startToken.sourceSpan.start, end, startToken.sourceSpan.fullStart);
		const startOffset = startToken.sourceSpan.toString().lastIndexOf(name);
		const nameStart = startToken.sourceSpan.start.moveBy(startOffset);
		const nameSpan = new ParseSourceSpan(nameStart, startToken.sourceSpan.end);
		const node = new LetDeclaration(name, valueToken.parts[0], span, nameSpan, valueToken.sourceSpan);
		this._addToParent(node);
	}
	_consumeIncompleteLet(/** @type {Token} */ token) {
		const name = token.parts[0] ?? "";
		const nameString = name ? ` "${name}"` : "";
		if (name.length > 0) {
			const startOffset = token.sourceSpan.toString().lastIndexOf(name);
			const nameStart = token.sourceSpan.start.moveBy(startOffset);
			const nameSpan = new ParseSourceSpan(nameStart, token.sourceSpan.end);
			const valueSpan = new ParseSourceSpan(token.sourceSpan.start, token.sourceSpan.start.moveBy(0));
			const node = new LetDeclaration(name, "", token.sourceSpan, nameSpan, valueSpan);
			this._addToParent(node);
		}
		this.errors.push(TreeError.create(token.parts[0], token.sourceSpan, `Incomplete @let declaration${nameString}. @let declarations must be written as \`@let <name> = <value>;\``));
	}
	/** @returns {Element | Block | null} */ _getContainer() {
		return this._containerStack.length > 0 ? this._containerStack[this._containerStack.length - 1] : null;
	}
	/** @returns {Element | null} */ _getClosestElementLikeParent() {
		for (let i = this._containerStack.length - 1; i > -1; i--) {
			const current = this._containerStack[i];
			if (current instanceof Element || current instanceof Component) return current;
		}
		return null;
	}
	_addToParent(/** @type {Text | Element | Comment | DocType | CDATA | Block | LetDeclaration} */ node) {
		const parent = this._getContainer();
		if (parent === null) this.rootNodes.push(node);
		else parent.children.push(node);
	}
	/** @returns {string} */ _getElementFullName(/** @type {Token} */ token, /** @type {Element | null} */ parent) {
		const prefix = this._getPrefix(token, parent);
		return mergeNsAndName(prefix, token.parts[1]);
	}
	/** @returns {string} */ _getComponentFullName(/** @type {Token} */ token, /** @type {Element | null} */ parent) {
		const componentName = token.parts[0];
		const tagName = this._getComponentTagName(token, parent);
		if (tagName === null) return componentName;
		return tagName.startsWith(":") ? componentName + tagName : `${componentName}:${tagName}`;
	}
	/** @returns {string | null} */ _getComponentTagName(/** @type {Token} */ token, /** @type {Element | null} */ parent) {
		const prefix = this._getPrefix(token, parent);
		const tagName = token.parts[2];
		if (!prefix && !tagName) return null;
		else if (!prefix && tagName) return tagName;
		else return mergeNsAndName(prefix, tagName || "ng-component");
	}
	/** @returns {string | null} */ _getPrefix(/** @type {Token} */ token, /** @type {Element | null} */ parent) {
		/** @type {HtmlTagDefinition | null} */ var _this$_getTagDefiniti8;
		/** @type {string | null} */ let prefix;
		/** @type {string} */ let tagName;
		if (token.type === 35 || token.type === 39 || token.type === 38) {
			prefix = token.parts[1];
			tagName = token.parts[2];
		} else {
			prefix = token.parts[0];
			tagName = token.parts[1];
		}
		prefix = prefix || ((_this$_getTagDefiniti8 = this._getTagDefinition(tagName)) === null || _this$_getTagDefiniti8 === void 0 ? void 0 : _this$_getTagDefiniti8.implicitNamespacePrefix) || "";
		if (!prefix && parent) {
			const parentName = parent instanceof Element ? parent.name : parent.tagName;
			if (parentName !== null) {
				const parentTagName = splitNsName(parentName)[1];
				const parentTagDefinition = this._getTagDefinition(parentTagName);
				if (parentTagDefinition !== null && !parentTagDefinition.preventNamespaceInheritance) prefix = getNsPrefix(parentName);
			}
		}
		return prefix;
	}
};
/** @returns {boolean} */ function lastOnStack(/** @type {number[]} */ stack, /** @type {number} */ element) {
	return stack.length > 0 && stack[stack.length - 1] === element;
}
/**
* Decode the `entity` string, which we believe is the contents of an HTML entity.
*
* If the string is not actually a valid/known entity then just return the original `match` string.
* @returns {string}
*/
function decodeEntity(/** @type {string} */ match, /** @type {string | undefined} */ entity) {
	if (NAMED_ENTITIES[entity] !== void 0) return NAMED_ENTITIES[entity] || match;
	if (/^#x[a-f0-9]+$/i.test(entity)) return String.fromCodePoint(parseInt(entity.slice(2), 16));
	if (/^#\d+$/.test(entity)) return String.fromCodePoint(parseInt(entity.slice(1), 10));
	return match;
}
//#endregion
export { ParseTreeResult, Parser, TreeError };
