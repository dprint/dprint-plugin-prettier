// @nts-check
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region lib/exception.js
const errorProps = [
	"description",
	"fileName",
	"lineNumber",
	"endLineNumber",
	"message",
	"name",
	"number",
	"stack"
];
function Exception(message, node) {
	let loc = node && node.loc, line, endLineNumber, column, endColumn;
	if (loc) {
		line = loc.start.line;
		endLineNumber = loc.end.line;
		column = loc.start.column;
		endColumn = loc.end.column;
		message += " - " + line + ":" + column;
	}
	let tmp = Error.prototype.constructor.call(this, message);
	for (let idx = 0; idx < errorProps.length; idx++) this[errorProps[idx]] = tmp[errorProps[idx]];
	/* istanbul ignore else */
	if (Error.captureStackTrace) Error.captureStackTrace(this, Exception);
	try {
		if (loc) {
			this.lineNumber = line;
			this.endLineNumber = endLineNumber;
			/* istanbul ignore next */
			if (Object.defineProperty) {
				Object.defineProperty(this, "column", {
					value: column,
					enumerable: true
				});
				Object.defineProperty(this, "endColumn", {
					value: endColumn,
					enumerable: true
				});
			} else {
				this.column = column;
				this.endColumn = endColumn;
			}
		}
	} catch (nop) {}
}
Exception.prototype = /* @__PURE__ */ new Error();
//#endregion
//#region lib/visitor.js
/**
 * What a visitor is to its methods: the nodes it is inside of, the one it is at, whether it puts back what its
 * methods give, and what whitespace control is told and has seen; the methods are found by the names of node types
 * @typedef {{
 *   parents: any[],
 *   current: any,
 *   mutating: boolean,
 *   options: any,
 *   isRootSeen: boolean,
 *   accept: (this: HbsVisitor, object: any) => any,
 *   acceptKey: (this: HbsVisitor, node: any, name: string | number) => void,
 *   acceptRequired: (this: HbsVisitor, node: any, name: string) => void,
 *   acceptArray: (this: HbsVisitor, array: any[]) => void,
 * }} HbsVisitor
 * A node of the tree that the parser's actions and helpers write out, as the visitors read it
 * @typedef {{
 *   type: string,
 *   body?: any[],
 *   blockParams?: any[],
 *   params?: any[],
 *   hash?: any,
 *   path?: any,
 *   program?: any,
 *   inverse?: any,
 *   name?: any,
 *   original?: any,
 *   pairs?: any[],
 *   key?: string,
 *   value?: any,
 *   parts?: any[],
 *   strip?: any,
 *   openStrip?: any,
 *   closeStrip?: any,
 *   inverseStrip?: any,
 *   chained?: boolean,
 *   escaped?: any,
 *   indent?: string,
 *   loc?: any,
 *   data?: boolean,
 *   head?: any,
 *   tail?: any[],
 *   items?: any[],
 *   open?: string,
 *   chain?: boolean,
 *   this?: boolean,
 *   depth?: number,
 *   partial?: boolean,
 *   decorator?: boolean,
 * }} HbsNode
 * A part of a path that the parser gives the helper that makes paths
 * @typedef {{ part: string, original: string, separator?: string }} HbsPathPart
 * What the printer of trees is to its methods: how far it indents
 * @typedef {{
 *   padding: number,
 *   pad: (this: HbsPrintVisitor, string: string) => string,
 *   accept: (this: HbsPrintVisitor, object: any) => string,
 *   callBody: (this: HbsPrintVisitor, mustache: HbsNode) => string,
 * }} HbsPrintVisitor
 */
function Visitor() {
	this.parents = [];
}
Visitor.prototype = {
	constructor: Visitor,
	mutating: false,
	acceptKey: /** @this {HbsVisitor} */ function(/** @type {any} */ node, /** @type {string | number} */ name) {
		let value = this.accept(node[name]);
		if (this.mutating) {
			if (value && !Visitor.prototype[value.type]) throw new Exception("Unexpected node type \"" + value.type + "\" found when accepting " + name + " on " + node.type);
			node[name] = value;
		}
	},
	acceptRequired: /** @this {HbsVisitor} */ function(/** @type {HbsNode} */ node, /** @type {string} */ name) {
		this.acceptKey(node, name);
		if (!node[name]) throw new Exception(node.type + " requires " + name);
	},
	acceptArray: /** @this {HbsVisitor} */ function(/** @type {any[]} */ array) {
		for (let i = 0, l = array.length; i < l; i++) {
			this.acceptKey(array, i);
			if (!array[i]) {
				array.splice(i, 1);
				i--;
				l--;
			}
		}
	},
	accept: /** @this {HbsVisitor} */ function(/** @type {HbsNode | undefined} */ object) {
		if (!object) return;
		/* istanbul ignore next: Sanity code */
		if (!this[object.type]) throw new Exception("Unknown type: " + object.type, object);
		if (this.current) this.parents.unshift(this.current);
		this.current = object;
		let ret = this[object.type](object);
		this.current = this.parents.shift();
		if (!this.mutating || ret) return ret;
		else if (ret !== false) return object;
	},
	Program: /** @this {HbsVisitor} */ function(/** @type {HbsNode} */ program) {
		this.acceptArray(program.body);
	},
	MustacheStatement: visitSubExpression,
	Decorator: visitSubExpression,
	BlockStatement: visitBlock,
	DecoratorBlock: visitBlock,
	PartialStatement: visitPartial,
	PartialBlockStatement: /** @this {HbsVisitor} */ function(/** @type {HbsNode} */ partial) {
		visitPartial.call(this, partial);
		this.acceptKey(partial, "program");
	},
	ContentStatement: /** @this {HbsVisitor} */ function() {},
	CommentStatement: /** @this {HbsVisitor} */ function() {},
	SubExpression: visitSubExpression,
	PathExpression: /** @this {HbsVisitor} */ function() {},
	StringLiteral: /** @this {HbsVisitor} */ function() {},
	NumberLiteral: /** @this {HbsVisitor} */ function() {},
	BooleanLiteral: /** @this {HbsVisitor} */ function() {},
	UndefinedLiteral: /** @this {HbsVisitor} */ function() {},
	NullLiteral: /** @this {HbsVisitor} */ function() {},
	Hash: /** @this {HbsVisitor} */ function(/** @type {HbsNode} */ hash) {
		this.acceptArray(hash.pairs);
	},
	HashPair: /** @this {HbsVisitor} */ function(/** @type {HbsNode} */ pair) {
		this.acceptRequired(pair, "value");
	}
};
/** @this {HbsVisitor} */ function visitSubExpression(mustache) {
	this.acceptRequired(mustache, "path");
	this.acceptArray(mustache.params);
	this.acceptKey(mustache, "hash");
}
/** @this {HbsVisitor} */ function visitBlock(block) {
	visitSubExpression.call(this, block);
	this.acceptKey(block, "program");
	this.acceptKey(block, "inverse");
}
/** @this {HbsVisitor} */ function visitPartial(partial) {
	this.acceptRequired(partial, "name");
	this.acceptArray(partial.params);
	this.acceptKey(partial, "hash");
}
//#endregion
//#region lib/whitespace-control.js
function WhitespaceControl(options = {}) {
	this.options = options;
}
WhitespaceControl.prototype = new Visitor();
WhitespaceControl.prototype.Program = /** @this {HbsVisitor} */ function(/** @type {HbsNode} */ program) {
	const doStandalone = !this.options.ignoreStandalone;
	let isRoot = !this.isRootSeen;
	this.isRootSeen = true;
	let body = program.body;
	for (let i = 0, l = body.length; i < l; i++) {
		let current = body[i], strip = this.accept(current);
		if (!strip) continue;
		let _isPrevWhitespace = isPrevWhitespace(body, i, isRoot), _isNextWhitespace = isNextWhitespace(body, i, isRoot), openStandalone = strip.openStandalone && _isPrevWhitespace, closeStandalone = strip.closeStandalone && _isNextWhitespace, inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;
		if (strip.close) omitRight(body, i, true);
		if (strip.open) omitLeft(body, i, true);
		if (doStandalone && inlineStandalone) {
			omitRight(body, i);
			if (omitLeft(body, i)) {
				if (current.type === "PartialStatement") current.indent = /(?:^|[^ \t])([ \t]+)$/.exec(body[i - 1].original)[1];
			}
		}
		if (doStandalone && openStandalone) {
			omitRight((current.program || current.inverse).body);
			omitLeft(body, i);
		}
		if (doStandalone && closeStandalone) {
			omitRight(body, i);
			let chainNode = current.inverse;
			if (chainNode && chainNode.chained) {
				while (chainNode && chainNode.chained) {
					let lastBlock = chainNode.body[chainNode.body.length - 1];
					omitLeft(lastBlock.program.body);
					chainNode = lastBlock.inverse;
				}
				if (chainNode) omitLeft(chainNode.body);
			} else omitLeft((current.inverse || current.program).body);
		}
	}
	return program;
};
WhitespaceControl.prototype.BlockStatement = WhitespaceControl.prototype.DecoratorBlock = WhitespaceControl.prototype.PartialBlockStatement = /** @this {HbsVisitor} */ function(/** @type {HbsNode} */ block) {
	this.accept(block.program);
	this.accept(block.inverse);
	let program = block.program || block.inverse, inverse = block.program && block.inverse, firstInverse = inverse, lastInverse = inverse;
	if (inverse && inverse.chained) {
		firstInverse = inverse.body[0].program;
		while (lastInverse.chained) lastInverse = lastInverse.body[lastInverse.body.length - 1].program;
	}
	let strip = {
		open: block.openStrip.open,
		close: block.closeStrip.close,
		openStandalone: isNextWhitespace(program.body),
		closeStandalone: isPrevWhitespace((firstInverse || program).body)
	};
	if (block.openStrip.close) omitRight(program.body, null, true);
	if (inverse) {
		let inverseStrip = block.inverseStrip;
		if (inverseStrip.open) omitLeft(program.body, null, true);
		if (inverseStrip.close) omitRight(firstInverse.body, null, true);
		if (block.closeStrip.open) omitLeft(lastInverse.body, null, true);
		if (!this.options.ignoreStandalone && isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {
			omitLeft(program.body);
			omitRight(firstInverse.body);
		}
	} else if (block.closeStrip.open) omitLeft(program.body, null, true);
	return strip;
};
WhitespaceControl.prototype.Decorator = WhitespaceControl.prototype.MustacheStatement = /** @this {HbsVisitor} */ function(/** @type {HbsNode} */ mustache) {
	return mustache.strip;
};
WhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = /** @this {HbsVisitor} */ function(/** @type {HbsNode} */ node) {
	/* istanbul ignore next */
	let strip = node.strip || {};
	return {
		inlineStandalone: true,
		open: strip.open,
		close: strip.close
	};
};
function isPrevWhitespace(body, i, isRoot) {
	if (i === void 0) i = body.length;
	let prev = body[i - 1], sibling = body[i - 2];
	if (!prev) return isRoot;
	if (prev.type === "ContentStatement") return (sibling || !isRoot ? /(?:^|\S)[^\S\n]*\n\s*$/ : /^\s*$|(?:^|\S)[^\S\n]*\n\s*$/).test(prev.original);
}
function isNextWhitespace(body, i, isRoot) {
	if (i === void 0) i = -1;
	let next = body[i + 1], sibling = body[i + 2];
	if (!next) return isRoot;
	if (next.type === "ContentStatement") return (sibling || !isRoot ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(next.original);
}
function omitRight(body, i, multiple) {
	let current = body[i == null ? 0 : i + 1];
	if (!current || current.type !== "ContentStatement" || !multiple && current.rightStripped) return;
	let original = current.value;
	current.value = current.value.replace(multiple ? /^\s+/ : /^[ \t]*\r?\n?/, "");
	current.rightStripped = current.value !== original;
}
function omitLeft(body, i, multiple) {
	let current = body[i == null ? body.length - 1 : i - 1];
	if (!current || current.type !== "ContentStatement" || !multiple && current.leftStripped) return;
	let original = current.value;
	current.value = current.value.replace(multiple ? /(^|\S)\s+$/ : /(^|[^ \t])[ \t]+$/, "$1");
	current.leftStripped = current.value !== original;
	return current.leftStripped;
}
//#endregion
//#region lib/parser.js
/**
 * Where a token or a rule's match is, which jison works out as it goes
 * @typedef {{ first_line: number, last_line: number, first_column: number, last_column: number, range?: any[] }} JisonLocation
 * What a rule gives and where it is, which the parser's action is called on
 * @typedef {{ $: any, _$: JisonLocation }} JisonValue
 * What the parser's actions are given: handlebars' helpers, the location maker and the syntax of literals; the helpers
 * that use `this` say so, and are called on it
 * @typedef {{
 *   locInfo: (locInfo: JisonLocation) => any,
 *   stripFlags: typeof stripFlags,
 *   stripComment: typeof stripComment,
 *   id: typeof id,
 *   preparePath: typeof preparePath,
 *   prepareBlock: typeof prepareBlock,
 *   prepareProgram: typeof prepareProgram,
 *   prepareMustache: typeof prepareMustache,
 *   prepareRawBlock: typeof prepareRawBlock,
 *   preparePartialBlock: typeof preparePartialBlock,
 *   syntax: { square: ((array: any, loc: any) => any) | string, hash: (hash: any, loc: any) => any },
 *   parseError?: any,
 *   lexer?: any,
 *   parser?: any,
 * }} JisonShared
 * The parser, whose tables say what each state does with each symbol (an array for an action, a number for the state
 * to go to), and whose methods jison writes into it
 * @typedef {{
 *   trace: (this: JisonParser, ...args: any[]) => void,
 *   yy: any,
 *   symbols_: Record<string, any>,
 *   terminals_: Record<string, any>,
 *   productions_: any[],
 *   table: Record<string, any>[],
 *   defaultActions: Record<string, any>,
 *   performAction: any,
 *   parseError: (this: JisonParser, str: string, hash: any) => void,
 *   parse: (this: JisonParser, input: string | undefined) => any,
 *   lexer: any,
 * }} JisonParser
 * The lexer, which the parser makes one of for each input from this one
 * @typedef {{
 *   EOF: number,
 *   last_line?: any,
 *   yy: any,
 *   yytext: string,
 *   yyleng: number,
 *   yylineno: number,
 *   yylloc: JisonLocation,
 *   match: string,
 *   matched: string,
 *   matches: any,
 *   offset: number,
 *   done: boolean,
 *   _input: string,
 *   _more: boolean,
 *   _backtrack: boolean,
 *   conditionStack: any[],
 *   conditions: Record<string, any>,
 *   rules: any[],
 *   options: any,
 *   parseError: (this: JisonLexer, str: string, hash: any) => any,
 *   setInput: (this: JisonLexer, input: string, yy: any) => JisonLexer,
 *   input: (this: JisonLexer) => string,
 *   unput: (this: JisonLexer, ch: string) => JisonLexer,
 *   more: (this: JisonLexer) => JisonLexer,
 *   reject: (this: JisonLexer) => any,
 *   less: (this: JisonLexer, n: number) => void,
 *   pastInput: (this: JisonLexer) => string,
 *   upcomingInput: (this: JisonLexer) => string,
 *   showPosition: (this: JisonLexer) => string,
 *   test_match: (this: JisonLexer, match: RegExpMatchArray, indexed_rule: number) => any,
 *   next: (this: JisonLexer) => any,
 *   lex: (this: JisonLexer) => any,
 *   begin: (this: JisonLexer, condition: string) => void,
 *   popState: (this: JisonLexer) => string,
 *   _currentRules: (this: JisonLexer) => any,
 *   topState: (this: JisonLexer, n?: number) => string,
 *   pushState: (this: JisonLexer, condition: string) => void,
 *   stateStackSize: (this: JisonLexer) => number,
 *   performAction: any,
 * }} JisonLexer
 */
var parser = (function() {
	var o = function(/** @type {any[] | undefined} */ k, /** @type {any[] | undefined} */ v, o, l) {
		for (o = o || {}, l = k.length; l--; o[k[l]] = v);
		return o;
	}, $V0 = [2, 52], $V1 = [1, 20], $V2 = [
		5,
		14,
		15,
		19,
		29,
		34,
		39,
		44,
		47,
		48,
		53,
		57,
		61
	], $V3 = [1, 44], $V4 = [1, 40], $V5 = [1, 43], $V6 = [1, 33], $V7 = [1, 34], $V8 = [1, 35], $V9 = [1, 36], $Va = [1, 37], $Vb = [1, 42], $Vc = [1, 46], $Vd = [
		14,
		15,
		19,
		29,
		34,
		39,
		44,
		47,
		48,
		53,
		57,
		61
	], $Ve = [
		14,
		15,
		19,
		29,
		34,
		44,
		47,
		48,
		53,
		57,
		61
	], $Vf = [15, 18], $Vg = [
		14,
		15,
		19,
		29,
		34,
		47,
		48,
		53,
		57,
		61
	], $Vh = [
		33,
		67,
		73,
		75,
		84,
		85,
		86,
		87,
		88,
		89
	], $Vi = [
		23,
		33,
		56,
		67,
		68,
		73,
		75,
		77,
		79,
		84,
		85,
		86,
		87,
		88,
		89
	], $Vj = [1, 62], $Vk = [1, 63], $Vl = [
		23,
		33,
		56,
		68,
		73,
		79
	], $Vm = [
		23,
		33,
		56,
		67,
		68,
		73,
		75,
		77,
		79,
		84,
		85,
		86,
		87,
		88,
		89,
		92,
		93
	], $Vn = [2, 51], $Vo = [1, 64], $Vp = [
		67,
		73,
		75,
		77,
		84,
		85,
		86,
		87,
		88,
		89
	], $Vq = [
		56,
		67,
		73,
		75,
		84,
		85,
		86,
		87,
		88,
		89
	], $Vr = [1, 75], $Vs = [1, 76], $Vt = [1, 83], $Vu = [
		33,
		67,
		73,
		75,
		79,
		84,
		85,
		86,
		87,
		88,
		89
	], $Vv = [
		23,
		67,
		73,
		75,
		84,
		85,
		86,
		87,
		88,
		89
	], $Vw = [
		67,
		68,
		73,
		75,
		84,
		85,
		86,
		87,
		88,
		89
	], $Vx = [33, 79], $Vy = [1, 134], $Vz = [73, 81];
	var parser = {
		trace: function trace() {},
		yy: {},
		symbols_: {
			"error": 2,
			"root": 3,
			"program": 4,
			"EOF": 5,
			"program_repetition0": 6,
			"statement": 7,
			"mustache": 8,
			"block": 9,
			"rawBlock": 10,
			"partial": 11,
			"partialBlock": 12,
			"content": 13,
			"COMMENT": 14,
			"CONTENT": 15,
			"openRawBlock": 16,
			"rawBlock_repetition0": 17,
			"END_RAW_BLOCK": 18,
			"OPEN_RAW_BLOCK": 19,
			"helperName": 20,
			"openRawBlock_repetition0": 21,
			"openRawBlock_option0": 22,
			"CLOSE_RAW_BLOCK": 23,
			"openBlock": 24,
			"block_option0": 25,
			"closeBlock": 26,
			"openInverse": 27,
			"block_option1": 28,
			"OPEN_BLOCK": 29,
			"openBlock_repetition0": 30,
			"openBlock_option0": 31,
			"openBlock_option1": 32,
			"CLOSE": 33,
			"OPEN_INVERSE": 34,
			"openInverse_repetition0": 35,
			"openInverse_option0": 36,
			"openInverse_option1": 37,
			"openInverseChain": 38,
			"OPEN_INVERSE_CHAIN": 39,
			"openInverseChain_repetition0": 40,
			"openInverseChain_option0": 41,
			"openInverseChain_option1": 42,
			"inverseAndProgram": 43,
			"INVERSE": 44,
			"inverseChain": 45,
			"inverseChain_option0": 46,
			"OPEN_ENDBLOCK": 47,
			"OPEN": 48,
			"hash": 49,
			"expr": 50,
			"mustache_repetition0": 51,
			"mustache_option0": 52,
			"OPEN_UNESCAPED": 53,
			"mustache_repetition1": 54,
			"mustache_option1": 55,
			"CLOSE_UNESCAPED": 56,
			"OPEN_PARTIAL": 57,
			"partial_repetition0": 58,
			"partial_option0": 59,
			"openPartialBlock": 60,
			"OPEN_PARTIAL_BLOCK": 61,
			"openPartialBlock_repetition0": 62,
			"openPartialBlock_option0": 63,
			"exprHead": 64,
			"arrayLiteral": 65,
			"sexpr": 66,
			"OPEN_SEXPR": 67,
			"CLOSE_SEXPR": 68,
			"sexpr_repetition0": 69,
			"sexpr_option0": 70,
			"hash_repetition_plus0": 71,
			"hashSegment": 72,
			"ID": 73,
			"EQUALS": 74,
			"OPEN_ARRAY": 75,
			"arrayLiteral_repetition0": 76,
			"CLOSE_ARRAY": 77,
			"blockParams": 78,
			"OPEN_BLOCK_PARAMS": 79,
			"blockParams_repetition_plus0": 80,
			"CLOSE_BLOCK_PARAMS": 81,
			"path": 82,
			"dataName": 83,
			"STRING": 84,
			"NUMBER": 85,
			"BOOLEAN": 86,
			"UNDEFINED": 87,
			"NULL": 88,
			"DATA": 89,
			"pathSegments": 90,
			"sep": 91,
			"SEP": 92,
			"PRIVATE_SEP": 93,
			"$accept": 0,
			"$end": 1
		},
		terminals_: {
			2: "error",
			5: "EOF",
			14: "COMMENT",
			15: "CONTENT",
			18: "END_RAW_BLOCK",
			19: "OPEN_RAW_BLOCK",
			23: "CLOSE_RAW_BLOCK",
			29: "OPEN_BLOCK",
			33: "CLOSE",
			34: "OPEN_INVERSE",
			39: "OPEN_INVERSE_CHAIN",
			44: "INVERSE",
			47: "OPEN_ENDBLOCK",
			48: "OPEN",
			53: "OPEN_UNESCAPED",
			56: "CLOSE_UNESCAPED",
			57: "OPEN_PARTIAL",
			61: "OPEN_PARTIAL_BLOCK",
			67: "OPEN_SEXPR",
			68: "CLOSE_SEXPR",
			73: "ID",
			74: "EQUALS",
			75: "OPEN_ARRAY",
			77: "CLOSE_ARRAY",
			79: "OPEN_BLOCK_PARAMS",
			81: "CLOSE_BLOCK_PARAMS",
			84: "STRING",
			85: "NUMBER",
			86: "BOOLEAN",
			87: "UNDEFINED",
			88: "NULL",
			89: "DATA",
			92: "SEP",
			93: "PRIVATE_SEP"
		},
		productions_: [
			0,
			[3, 2],
			[4, 1],
			[7, 1],
			[7, 1],
			[7, 1],
			[7, 1],
			[7, 1],
			[7, 1],
			[7, 1],
			[13, 1],
			[10, 3],
			[16, 5],
			[9, 4],
			[9, 4],
			[24, 6],
			[27, 6],
			[38, 6],
			[43, 2],
			[45, 3],
			[45, 1],
			[26, 3],
			[8, 3],
			[8, 5],
			[8, 5],
			[11, 5],
			[12, 3],
			[60, 5],
			[50, 1],
			[50, 1],
			[64, 1],
			[64, 1],
			[66, 3],
			[66, 5],
			[49, 1],
			[72, 3],
			[65, 3],
			[78, 3],
			[20, 1],
			[20, 1],
			[20, 1],
			[20, 1],
			[20, 1],
			[20, 1],
			[20, 1],
			[83, 2],
			[91, 1],
			[91, 1],
			[82, 3],
			[82, 1],
			[90, 3],
			[90, 1],
			[6, 0],
			[6, 2],
			[17, 0],
			[17, 2],
			[21, 0],
			[21, 2],
			[22, 0],
			[22, 1],
			[25, 0],
			[25, 1],
			[28, 0],
			[28, 1],
			[30, 0],
			[30, 2],
			[31, 0],
			[31, 1],
			[32, 0],
			[32, 1],
			[35, 0],
			[35, 2],
			[36, 0],
			[36, 1],
			[37, 0],
			[37, 1],
			[40, 0],
			[40, 2],
			[41, 0],
			[41, 1],
			[42, 0],
			[42, 1],
			[46, 0],
			[46, 1],
			[51, 0],
			[51, 2],
			[52, 0],
			[52, 1],
			[54, 0],
			[54, 2],
			[55, 0],
			[55, 1],
			[58, 0],
			[58, 2],
			[59, 0],
			[59, 1],
			[62, 0],
			[62, 2],
			[63, 0],
			[63, 1],
			[69, 0],
			[69, 2],
			[70, 0],
			[70, 1],
			[71, 1],
			[71, 2],
			[76, 0],
			[76, 2],
			[80, 1],
			[80, 2]
		],
		performAction: /** @this {JisonValue} */ function anonymous(/** @type {string} */ yytext, /** @type {number} */ yyleng, /** @type {number} */ yylineno, /** @type {JisonShared} */ yy, /** @type {number} */ yystate, /** @type {any[]} */ $$, /** @type {any[]} */ _$) {
			/** @type {number} */ var $0 = $$.length - 1;
			switch (yystate) {
				case 1: return $$[$0 - 1];
				case 2:
					this.$ = yy.prepareProgram($$[$0]);
					break;
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
				case 8:
				case 20:
				case 28:
				case 29:
				case 30:
				case 31:
				case 38:
				case 39:
				case 46:
				case 47:
					this.$ = $$[$0];
					break;
				case 9:
					this.$ = {
						type: "CommentStatement",
						value: yy.stripComment($$[$0]),
						strip: yy.stripFlags($$[$0], $$[$0]),
						loc: yy.locInfo(this._$)
					};
					break;
				case 10:
					this.$ = {
						type: "ContentStatement",
						original: $$[$0],
						value: $$[$0],
						loc: yy.locInfo(this._$)
					};
					break;
				case 11:
					this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
					break;
				case 12:
					this.$ = {
						path: $$[$0 - 3],
						params: $$[$0 - 2],
						hash: $$[$0 - 1]
					};
					break;
				case 13:
					this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
					break;
				case 14:
					this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
					break;
				case 15:
					this.$ = {
						open: $$[$0 - 5],
						path: $$[$0 - 4],
						params: $$[$0 - 3],
						hash: $$[$0 - 2],
						blockParams: $$[$0 - 1],
						strip: yy.stripFlags($$[$0 - 5], $$[$0])
					};
					break;
				case 16:
				case 17:
					this.$ = {
						path: $$[$0 - 4],
						params: $$[$0 - 3],
						hash: $$[$0 - 2],
						blockParams: $$[$0 - 1],
						strip: yy.stripFlags($$[$0 - 5], $$[$0])
					};
					break;
				case 18:
					this.$ = {
						strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]),
						program: $$[$0]
					};
					break;
				case 19:
					var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$), program = yy.prepareProgram([inverse], $$[$0 - 1].loc);
					program.chained = true;
					this.$ = {
						strip: $$[$0 - 2].strip,
						program,
						chain: true
					};
					break;
				case 21:
					this.$ = {
						path: $$[$0 - 1],
						strip: yy.stripFlags($$[$0 - 2], $$[$0])
					};
					break;
				case 22:
					this.$ = yy.prepareMustache(yy.syntax.hash($$[$0 - 1], yy.locInfo(this._$), {
						yy,
						syntax: "expr"
					}), [], void 0, $$[$0 - 2], yy.stripFlags($$[$0 - 2], $$[$0]), this._$);
					break;
				case 23:
				case 24:
					this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
					break;
				case 25:
					this.$ = {
						type: "PartialStatement",
						name: $$[$0 - 3],
						params: $$[$0 - 2],
						hash: $$[$0 - 1],
						indent: "",
						strip: yy.stripFlags($$[$0 - 4], $$[$0]),
						loc: yy.locInfo(this._$)
					};
					break;
				case 26:
					this.$ = yy.preparePartialBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
					break;
				case 27:
					this.$ = {
						path: $$[$0 - 3],
						params: $$[$0 - 2],
						hash: $$[$0 - 1],
						strip: yy.stripFlags($$[$0 - 4], $$[$0])
					};
					break;
				case 32:
					this.$ = yy.syntax.hash($$[$0 - 1], yy.locInfo(this._$), {
						yy,
						syntax: "expr"
					});
					break;
				case 33:
					this.$ = {
						type: "SubExpression",
						path: $$[$0 - 3],
						params: $$[$0 - 2],
						hash: $$[$0 - 1],
						loc: yy.locInfo(this._$)
					};
					break;
				case 34:
					this.$ = {
						type: "Hash",
						pairs: $$[$0],
						loc: yy.locInfo(this._$)
					};
					break;
				case 35:
					this.$ = {
						type: "HashPair",
						key: yy.id($$[$0 - 2]),
						value: $$[$0],
						loc: yy.locInfo(this._$)
					};
					break;
				case 36:
					this.$ = yy.syntax.square($$[$0 - 1], yy.locInfo(this._$), {
						yy,
						syntax: "expr"
					});
					break;
				case 37:
					this.$ = yy.id($$[$0 - 1]);
					break;
				case 40:
					this.$ = {
						type: "StringLiteral",
						value: $$[$0],
						original: $$[$0],
						loc: yy.locInfo(this._$)
					};
					break;
				case 41:
					this.$ = {
						type: "NumberLiteral",
						value: Number($$[$0]),
						original: Number($$[$0]),
						loc: yy.locInfo(this._$)
					};
					break;
				case 42:
					this.$ = {
						type: "BooleanLiteral",
						value: $$[$0] === "true",
						original: $$[$0] === "true",
						loc: yy.locInfo(this._$)
					};
					break;
				case 43:
					this.$ = {
						type: "UndefinedLiteral",
						original: void 0,
						value: void 0,
						loc: yy.locInfo(this._$)
					};
					break;
				case 44:
					this.$ = {
						type: "NullLiteral",
						original: null,
						value: null,
						loc: yy.locInfo(this._$)
					};
					break;
				case 45:
					this.$ = yy.preparePath(true, false, $$[$0], this._$);
					break;
				case 48:
					this.$ = yy.preparePath(false, $$[$0 - 2], $$[$0], this._$);
					break;
				case 49:
					this.$ = yy.preparePath(false, false, $$[$0], this._$);
					break;
				case 50:
					$$[$0 - 2].push({
						part: yy.id($$[$0]),
						original: $$[$0],
						separator: $$[$0 - 1]
					});
					this.$ = $$[$0 - 2];
					break;
				case 51:
					this.$ = [{
						part: yy.id($$[$0]),
						original: $$[$0]
					}];
					break;
				case 52:
				case 54:
				case 56:
				case 64:
				case 70:
				case 76:
				case 84:
				case 88:
				case 92:
				case 96:
				case 100:
				case 106:
					this.$ = [];
					break;
				case 53:
				case 55:
				case 57:
				case 65:
				case 71:
				case 77:
				case 85:
				case 89:
				case 93:
				case 97:
				case 101:
				case 105:
				case 107:
				case 109:
					$$[$0 - 1].push($$[$0]);
					break;
				case 104:
				case 108: this.$ = [$$[$0]];
			}
		},
		table: [
			o([
				5,
				14,
				15,
				19,
				29,
				34,
				48,
				53,
				57,
				61
			], $V0, {
				3: 1,
				4: 2,
				6: 3
			}),
			{ 1: [3] },
			{ 5: [1, 4] },
			o([
				5,
				39,
				44,
				47
			], [2, 2], {
				7: 5,
				8: 6,
				9: 7,
				10: 8,
				11: 9,
				12: 10,
				13: 11,
				24: 15,
				27: 16,
				16: 17,
				60: 19,
				14: [1, 12],
				15: $V1,
				19: [1, 23],
				29: [1, 21],
				34: [1, 22],
				48: [1, 13],
				53: [1, 14],
				57: [1, 18],
				61: [1, 24]
			}),
			{ 1: [2, 1] },
			o($V2, [2, 53]),
			o($V2, [2, 3]),
			o($V2, [2, 4]),
			o($V2, [2, 5]),
			o($V2, [2, 6]),
			o($V2, [2, 7]),
			o($V2, [2, 8]),
			o($V2, [2, 9]),
			{
				20: 28,
				49: 25,
				50: 26,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				71: 27,
				72: 30,
				73: $V4,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			{
				20: 28,
				50: 45,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				73: $Vc,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			o($Vd, $V0, {
				6: 3,
				4: 47
			}),
			o($Ve, $V0, {
				6: 3,
				4: 48
			}),
			o($Vf, [2, 54], { 17: 49 }),
			{
				20: 28,
				50: 50,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				73: $Vc,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			o($Vg, $V0, {
				6: 3,
				4: 51
			}),
			o([
				5,
				14,
				15,
				18,
				19,
				29,
				34,
				39,
				44,
				47,
				48,
				53,
				57,
				61
			], [2, 10]),
			{
				20: 52,
				64: 53,
				65: 38,
				66: 39,
				67: $V3,
				73: $Vc,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			{
				20: 54,
				64: 53,
				65: 38,
				66: 39,
				67: $V3,
				73: $Vc,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			{
				20: 55,
				64: 53,
				65: 38,
				66: 39,
				67: $V3,
				73: $Vc,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			{
				20: 28,
				50: 56,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				73: $Vc,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			{ 33: [1, 57] },
			o($Vh, [2, 84], { 51: 58 }),
			o([
				23,
				33,
				56,
				68,
				79
			], [2, 34], {
				72: 59,
				73: [1, 60]
			}),
			o($Vi, [2, 28]),
			o($Vi, [2, 29], {
				91: 61,
				92: $Vj,
				93: $Vk
			}),
			o($Vl, [2, 104]),
			o($Vi, [2, 38]),
			o($Vi, [2, 39]),
			o($Vi, [2, 40]),
			o($Vi, [2, 41]),
			o($Vi, [2, 42]),
			o($Vi, [2, 43]),
			o($Vi, [2, 44]),
			o($Vm, [2, 30]),
			o($Vm, [2, 31]),
			o([
				23,
				33,
				56,
				67,
				68,
				73,
				75,
				79,
				84,
				85,
				86,
				87,
				88,
				89,
				92,
				93
			], $Vn, { 74: $Vo }),
			o($Vi, [2, 49], {
				91: 65,
				92: $Vj,
				93: $Vk
			}),
			{
				73: $Vc,
				90: 66
			},
			o($Vp, [2, 106], { 76: 67 }),
			{
				20: 28,
				49: 68,
				50: 69,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				71: 27,
				72: 30,
				73: $V4,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			o($Vq, [2, 88], { 54: 70 }),
			o($Vm, $Vn),
			{
				25: 71,
				38: 73,
				39: $Vr,
				43: 74,
				44: $Vs,
				45: 72,
				47: [2, 60]
			},
			{
				28: 77,
				43: 78,
				44: $Vs,
				47: [2, 62]
			},
			{
				13: 80,
				15: $V1,
				18: [1, 79]
			},
			o($Vh, [2, 92], { 58: 81 }),
			{
				26: 82,
				47: $Vt
			},
			o($Vu, [2, 64], { 30: 84 }),
			{
				91: 61,
				92: $Vj,
				93: $Vk
			},
			o($Vu, [2, 70], { 35: 85 }),
			o($Vv, [2, 56], { 21: 86 }),
			o($Vh, [2, 96], { 62: 87 }),
			o($V2, [2, 22]),
			{
				20: 28,
				33: [2, 86],
				49: 90,
				50: 89,
				52: 88,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				71: 27,
				72: 30,
				73: $V4,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			o($Vl, [2, 105]),
			{ 74: $Vo },
			{
				73: $Vc,
				90: 91
			},
			{ 73: [2, 46] },
			{ 73: [2, 47] },
			{
				20: 28,
				50: 92,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				73: $Vc,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			{ 73: [1, 93] },
			o($Vi, [2, 45], {
				91: 65,
				92: $Vj,
				93: $Vk
			}),
			{
				20: 28,
				50: 95,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				73: $Vc,
				75: $V5,
				77: [1, 94],
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			{ 68: [1, 96] },
			o($Vw, [2, 100], { 69: 97 }),
			{
				20: 28,
				49: 100,
				50: 99,
				55: 98,
				56: [2, 90],
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				71: 27,
				72: 30,
				73: $V4,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			{
				26: 101,
				47: $Vt
			},
			{ 47: [2, 61] },
			o($Vd, $V0, {
				6: 3,
				4: 102
			}),
			{ 47: [2, 20] },
			{
				20: 103,
				64: 53,
				65: 38,
				66: 39,
				67: $V3,
				73: $Vc,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			o($Vg, $V0, {
				6: 3,
				4: 104
			}),
			{
				26: 105,
				47: $Vt
			},
			{ 47: [2, 63] },
			o($V2, [2, 11]),
			o($Vf, [2, 55]),
			{
				20: 28,
				33: [2, 94],
				49: 108,
				50: 107,
				59: 106,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				71: 27,
				72: 30,
				73: $V4,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			o($V2, [2, 26]),
			{
				20: 109,
				64: 53,
				65: 38,
				66: 39,
				67: $V3,
				73: $Vc,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			o($Vx, [2, 66], {
				71: 27,
				20: 28,
				64: 29,
				72: 30,
				82: 31,
				83: 32,
				65: 38,
				66: 39,
				90: 41,
				31: 110,
				50: 111,
				49: 112,
				67: $V3,
				73: $V4,
				75: $V5,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb
			}),
			o($Vx, [2, 72], {
				71: 27,
				20: 28,
				64: 29,
				72: 30,
				82: 31,
				83: 32,
				65: 38,
				66: 39,
				90: 41,
				36: 113,
				50: 114,
				49: 115,
				67: $V3,
				73: $V4,
				75: $V5,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb
			}),
			{
				20: 28,
				22: 116,
				23: [2, 58],
				49: 118,
				50: 117,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				71: 27,
				72: 30,
				73: $V4,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			{
				20: 28,
				33: [2, 98],
				49: 121,
				50: 120,
				63: 119,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				71: 27,
				72: 30,
				73: $V4,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			{ 33: [1, 122] },
			o($Vh, [2, 85]),
			{ 33: [2, 87] },
			o($Vi, [2, 48], {
				91: 65,
				92: $Vj,
				93: $Vk
			}),
			o($Vl, [2, 35]),
			o($Vm, [2, 50]),
			o($Vm, [2, 36]),
			o($Vp, [2, 107]),
			o($Vm, [2, 32]),
			{
				20: 28,
				49: 125,
				50: 124,
				64: 29,
				65: 38,
				66: 39,
				67: $V3,
				68: [2, 102],
				70: 123,
				71: 27,
				72: 30,
				73: $V4,
				75: $V5,
				82: 31,
				83: 32,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb,
				90: 41
			},
			{ 56: [1, 126] },
			o($Vq, [2, 89]),
			{ 56: [2, 91] },
			o($V2, [2, 13]),
			{
				38: 73,
				39: $Vr,
				43: 74,
				44: $Vs,
				45: 128,
				46: 127,
				47: [2, 82]
			},
			o($Vu, [2, 76], { 40: 129 }),
			{ 47: [2, 18] },
			o($V2, [2, 14]),
			{ 33: [1, 130] },
			o($Vh, [2, 93]),
			{ 33: [2, 95] },
			{ 33: [1, 131] },
			{
				32: 132,
				33: [2, 68],
				78: 133,
				79: $Vy
			},
			o($Vu, [2, 65]),
			o($Vx, [2, 67]),
			{
				33: [2, 74],
				37: 135,
				78: 136,
				79: $Vy
			},
			o($Vu, [2, 71]),
			o($Vx, [2, 73]),
			{ 23: [1, 137] },
			o($Vv, [2, 57]),
			{ 23: [2, 59] },
			{ 33: [1, 138] },
			o($Vh, [2, 97]),
			{ 33: [2, 99] },
			o($V2, [2, 23]),
			{ 68: [1, 139] },
			o($Vw, [2, 101]),
			{ 68: [2, 103] },
			o($V2, [2, 24]),
			{ 47: [2, 19] },
			{ 47: [2, 83] },
			o($Vx, [2, 78], {
				71: 27,
				20: 28,
				64: 29,
				72: 30,
				82: 31,
				83: 32,
				65: 38,
				66: 39,
				90: 41,
				41: 140,
				50: 141,
				49: 142,
				67: $V3,
				73: $V4,
				75: $V5,
				84: $V6,
				85: $V7,
				86: $V8,
				87: $V9,
				88: $Va,
				89: $Vb
			}),
			o($V2, [2, 25]),
			o($V2, [2, 21]),
			{ 33: [1, 143] },
			{ 33: [2, 69] },
			{
				73: [1, 145],
				80: 144
			},
			{ 33: [1, 146] },
			{ 33: [2, 75] },
			o($Vf, [2, 12]),
			o($Vg, [2, 27]),
			o($Vm, [2, 33]),
			{
				33: [2, 80],
				42: 147,
				78: 148,
				79: $Vy
			},
			o($Vu, [2, 77]),
			o($Vx, [2, 79]),
			o($Vd, [2, 15]),
			{
				73: [1, 150],
				81: [1, 149]
			},
			o($Vz, [2, 108]),
			o($Ve, [2, 16]),
			{ 33: [1, 151] },
			{ 33: [2, 81] },
			{ 33: [2, 37] },
			o($Vz, [2, 109]),
			o($Vd, [2, 17])
		],
		defaultActions: {
			4: [2, 1],
			62: [2, 46],
			63: [2, 47],
			72: [2, 61],
			74: [2, 20],
			78: [2, 63],
			90: [2, 87],
			100: [2, 91],
			104: [2, 18],
			108: [2, 95],
			118: [2, 59],
			121: [2, 99],
			125: [2, 103],
			127: [2, 19],
			128: [2, 83],
			133: [2, 69],
			136: [2, 75],
			148: [2, 81],
			149: [2, 37]
		},
		parseError: /** @this {JisonParser} */ function parseError(/** @type {string} */ str, hash) {
			if (hash.recoverable) this.trace(str);
			else {
				var error = new Error(str);
				error.hash = hash;
				throw error;
			}
		},
		parse: /** @this {JisonParser} */ function parse(/** @type {string | undefined} */ input) {
			var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
			var args = lstack.slice.call(arguments, 1);
			var lexer = /** @type {JisonLexer} */ (Object.create(this.lexer));
			var sharedState = { yy: {} };
			for (var k in this.yy) if (Object.prototype.hasOwnProperty.call(this.yy, k)) sharedState.yy[k] = this.yy[k];
			lexer.setInput(input, sharedState.yy);
			sharedState.yy.lexer = lexer;
			sharedState.yy.parser = this;
			if (typeof lexer.yylloc == "undefined") lexer.yylloc = {};
			var yyloc = lexer.yylloc;
			lstack.push(yyloc);
			var ranges = lexer.options && lexer.options.ranges;
			if (typeof sharedState.yy.parseError === "function") this.parseError = sharedState.yy.parseError;
			else this.parseError = Object.getPrototypeOf(this).parseError;
			_token_stack: var lex = function() {
				var token = lexer.lex() || EOF;
				if (typeof token !== "number") token = self.symbols_[token] || token;
				return token;
			};
			var symbol, preErrorSymbol, state, action, r, yyval = /** @type {JisonValue} */ ({}), p, len, newState, expected;
			while (true) {
				state = stack[stack.length - 1];
				if (this.defaultActions[state]) action = this.defaultActions[state];
				else {
					if (symbol === null || typeof symbol == "undefined") symbol = lex();
					action = table[state] && table[state][symbol];
				}
				if (typeof action === "undefined" || !action.length || !action[0]) {
					var errStr = "";
					expected = [];
					for (p in table[state]) if (this.terminals_[p] && p > TERROR) expected.push("'" + this.terminals_[p] + "'");
					if (lexer.showPosition) errStr = "Parse error on line " + (yylineno + 1) + ":\n" + lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
					else errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == EOF ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
					this.parseError(errStr, {
						text: lexer.match,
						token: this.terminals_[symbol] || symbol,
						line: lexer.yylineno,
						loc: yyloc,
						expected
					});
				}
				if (action[0] instanceof Array && action.length > 1) throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
				switch (action[0]) {
					case 1:
						stack.push(symbol);
						vstack.push(lexer.yytext);
						lstack.push(lexer.yylloc);
						stack.push(action[1]);
						symbol = null;
						if (!preErrorSymbol) {
							yyleng = lexer.yyleng;
							yytext = lexer.yytext;
							yylineno = lexer.yylineno;
							yyloc = lexer.yylloc;
							if (recovering > 0) recovering--;
						} else {
							symbol = preErrorSymbol;
							preErrorSymbol = null;
						}
						break;
					case 2:
						len = this.productions_[action[1]][1];
						yyval.$ = vstack[vstack.length - len];
						yyval._$ = {
							first_line: lstack[lstack.length - (len || 1)].first_line,
							last_line: lstack[lstack.length - 1].last_line,
							first_column: lstack[lstack.length - (len || 1)].first_column,
							last_column: lstack[lstack.length - 1].last_column
						};
						if (ranges) yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
						r = this.performAction.apply(yyval, [
							yytext,
							yyleng,
							yylineno,
							sharedState.yy,
							action[1],
							vstack,
							lstack
						].concat(args));
						if (typeof r !== "undefined") return r;
						if (len) {
							stack = stack.slice(0, -1 * len * 2);
							vstack = vstack.slice(0, -1 * len);
							lstack = lstack.slice(0, -1 * len);
						}
						stack.push(this.productions_[action[1]][0]);
						vstack.push(yyval.$);
						lstack.push(yyval._$);
						newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
						stack.push(newState);
						break;
					case 3: return true;
				}
			}
			return true;
		}
	};
	parser.lexer = (function() {
		return {
			EOF: 1,
			parseError: /** @this {JisonLexer} */ function parseError(str, hash) {
				if (this.yy.parser) this.yy.parser.parseError(str, hash);
				else throw new Error(str);
			},
			setInput: /** @this {JisonLexer} */ function(/** @type {string} */ input, yy) {
				this.yy = yy || this.yy || {};
				this._input = input;
				this._more = this._backtrack = this.done = false;
				this.yylineno = this.yyleng = 0;
				this.yytext = this.matched = this.match = "";
				this.conditionStack = ["INITIAL"];
				this.yylloc = {
					first_line: 1,
					first_column: 0,
					last_line: 1,
					last_column: 0
				};
				if (this.options.ranges) this.yylloc.range = [0, 0];
				this.offset = 0;
				return this;
			},
			input: /** @this {JisonLexer} */ function() {
				var ch = this._input[0];
				this.yytext += ch;
				this.yyleng++;
				this.offset++;
				this.match += ch;
				this.matched += ch;
				if (ch.match(/(?:\r\n?|\n).*/g)) {
					this.yylineno++;
					this.yylloc.last_line++;
				} else this.yylloc.last_column++;
				if (this.options.ranges) this.yylloc.range[1]++;
				this._input = this._input.slice(1);
				return ch;
			},
			unput: /** @this {JisonLexer} */ function(/** @type {string} */ ch) {
				/** @type {number} */ var len = ch.length;
				var lines = ch.split(/(?:\r\n?|\n)/g);
				this._input = ch + this._input;
				this.yytext = this.yytext.substr(0, this.yytext.length - len);
				this.offset -= len;
				var oldLines = this.match.split(/(?:\r\n?|\n)/g);
				this.match = this.match.substr(0, this.match.length - 1);
				this.matched = this.matched.substr(0, this.matched.length - 1);
				if (lines.length - 1) this.yylineno -= lines.length - 1;
				var r = this.yylloc.range;
				this.yylloc = {
					first_line: this.yylloc.first_line,
					last_line: this.yylineno + 1,
					first_column: this.yylloc.first_column,
					last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
				};
				if (this.options.ranges) this.yylloc.range = [r[0], r[0] + this.yyleng - len];
				this.yyleng = this.yytext.length;
				return this;
			},
			more: /** @this {JisonLexer} */ function() {
				this._more = true;
				return this;
			},
			reject: /** @this {JisonLexer} */ function() {
				if (this.options.backtrack_lexer) this._backtrack = true;
				else return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n" + this.showPosition(), {
					text: "",
					token: null,
					line: this.yylineno
				});
				return this;
			},
			less: /** @this {JisonLexer} */ function(n) {
				this.unput(this.match.slice(n));
			},
			pastInput: /** @returns {string} */ /** @this {JisonLexer} */ function() {
				var past = this.matched.substr(0, this.matched.length - this.match.length);
				return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
			},
			upcomingInput: /** @returns {string} */ /** @this {JisonLexer} */ function() {
				var next = this.match;
				if (next.length < 20) next += this._input.substr(0, 20 - next.length);
				return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
			},
			showPosition: /** @returns {string} */ /** @this {JisonLexer} */ function() {
				/** @type {string} */ var pre = this.pastInput();
				/** @type {string} */ var c = new Array(pre.length + 1).join("-");
				return pre + this.upcomingInput() + "\n" + c + "^";
			},
			test_match: /** @this {JisonLexer} */ function(/** @type {RegExpMatchArray} */ match, /** @type {number} */ indexed_rule) {
				var token, lines, backup;
				if (this.options.backtrack_lexer) {
					backup = {
						yylineno: this.yylineno,
						yylloc: {
							first_line: this.yylloc.first_line,
							last_line: this.last_line,
							first_column: this.yylloc.first_column,
							last_column: this.yylloc.last_column
						},
						yytext: this.yytext,
						match: this.match,
						matches: this.matches,
						matched: this.matched,
						yyleng: this.yyleng,
						offset: this.offset,
						_more: this._more,
						_input: this._input,
						yy: this.yy,
						conditionStack: this.conditionStack.slice(0),
						done: this.done
					};
					if (this.options.ranges) backup.yylloc.range = this.yylloc.range.slice(0);
				}
				lines = match[0].match(/(?:\r\n?|\n).*/g);
				if (lines) this.yylineno += lines.length;
				this.yylloc = {
					first_line: this.yylloc.last_line,
					last_line: this.yylineno + 1,
					first_column: this.yylloc.last_column,
					last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
				};
				this.yytext += match[0];
				this.match += match[0];
				this.matches = match;
				this.yyleng = this.yytext.length;
				if (this.options.ranges) this.yylloc.range = [this.offset, this.offset += this.yyleng];
				this._more = false;
				this._backtrack = false;
				this._input = this._input.slice(match[0].length);
				this.matched += match[0];
				token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
				if (this.done && this._input) this.done = false;
				if (token) return token;
				else if (this._backtrack) {
					for (var k in backup) this[k] = backup[k];
					return false;
				}
				return false;
			},
			next: /** @this {JisonLexer} */ function() {
				if (this.done) return this.EOF;
				if (!this._input) this.done = true;
				var token, match, tempMatch, index;
				if (!this._more) {
					this.yytext = "";
					this.match = "";
				}
				var rules = this._currentRules();
				for (var i = 0; i < rules.length; i++) {
					tempMatch = this._input.match(/** @type {RegExp} */ (this.rules[rules[i]]));
					if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
						match = tempMatch;
						index = i;
						if (this.options.backtrack_lexer) {
							token = this.test_match(tempMatch, rules[i]);
							if (token !== false) return token;
							else if (this._backtrack) {
								match = false;
								continue;
							} else return false;
						} else if (!this.options.flex) break;
					}
				}
				if (match) {
					token = this.test_match(match, rules[index]);
					if (token !== false) return token;
					return false;
				}
				if (this._input === "") return this.EOF;
				else return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
					text: "",
					token: null,
					line: this.yylineno
				});
			},
			lex: /** @this {JisonLexer} */ function lex() {
				var r = this.next();
				if (r) return r;
				else return this.lex();
			},
			begin: /** @this {JisonLexer} */ function begin(/** @type {string} */ condition) {
				this.conditionStack.push(condition);
			},
			popState: /** @returns {string} */ /** @this {JisonLexer} */ function popState() {
				if (this.conditionStack.length - 1 > 0) return this.conditionStack.pop();
				else return this.conditionStack[0];
			},
			_currentRules: /** @returns {any[]} */ /** @this {JisonLexer} */ function _currentRules() {
				if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
				else return this.conditions["INITIAL"].rules;
			},
			topState: /** @this {JisonLexer} */ function topState(n) {
				n = this.conditionStack.length - 1 - Math.abs(n || 0);
				if (n >= 0) return this.conditionStack[n];
				else return "INITIAL";
			},
			pushState: /** @this {JisonLexer} */ function pushState(condition) {
				this.begin(condition);
			},
			stateStackSize: /** @this {JisonLexer} */ function stateStackSize() {
				return this.conditionStack.length;
			},
			options: {},
			performAction: /** @this {JisonLexer} */ function anonymous(yy, /** @type {JisonLexer} */ yy_, /** @type {number} */ $avoiding_name_collisions, /** @type {string} */ YY_START) {
				/** @returns {string} */ function strip(/** @type {number} */ start, /** @type {number} */ end) {
					return yy_.yytext = yy_.yytext.substring(start, yy_.yyleng - end + start);
				}
				switch ($avoiding_name_collisions) {
					case 0:
						if (yy_.yytext.slice(-2) === "\\\\") {
							strip(0, 1);
							this.begin("mu");
						} else if (yy_.yytext.slice(-1) === "\\") {
							strip(0, 1);
							this.begin("emu");
						} else this.begin("mu");
						if (yy_.yytext) return 15;
						break;
					case 1: return 15;
					case 2:
						this.popState();
						return 15;
					case 3:
						this.begin("raw");
						return 15;
					case 4:
						this.popState();
						if (this.conditionStack[this.conditionStack.length - 1] === "raw") return 15;
						else {
							strip(5, 9);
							return 18;
						}
					case 5: return 15;
					case 6:
						this.popState();
						return 14;
					case 7: return 67;
					case 8: return 68;
					case 9:
						if (yy.syntax.square === "string") {
							this.unput(yy_.yytext);
							this.begin("escl");
						} else return 75;
						break;
					case 10: return 77;
					case 11: return 19;
					case 12:
						this.popState();
						this.begin("raw");
						return 23;
					case 13: return 57;
					case 14: return 61;
					case 15: return 29;
					case 16: return 47;
					case 17:
						this.popState();
						return 44;
					case 18:
						this.popState();
						return 44;
					case 19: return 34;
					case 20: return 39;
					case 21: return 53;
					case 22: return 48;
					case 23:
						this.unput(yy_.yytext);
						this.popState();
						this.begin("com");
						break;
					case 24:
						this.popState();
						return 14;
					case 25: return 48;
					case 26: return 74;
					case 27: return 73;
					case 28: return 73;
					case 29: return 93;
					case 30: return 92;
					case 31: break;
					case 32:
						this.popState();
						return 56;
					case 33:
						this.popState();
						return 33;
					case 34:
						yy_.yytext = strip(1, 2).replace(/\\"/g, "\"");
						return 84;
					case 35:
						yy_.yytext = strip(1, 2).replace(/\\'/g, "'");
						return 84;
					case 36: return 89;
					case 37: return 86;
					case 38: return 86;
					case 39: return 87;
					case 40: return 88;
					case 41: return 85;
					case 42: return 79;
					case 43: return 81;
					case 44: return 73;
					case 45:
						yy_.yytext = yy_.yytext.replace(/\\([\\\]])/g, "$1");
						this.popState();
						return 73;
					case 46: return "INVALID";
					case 47: return 5;
				}
			},
			rules: [
				/^(?:[^\x00]*?(?=(\{\{)))/,
				/^(?:[^\x00]+)/,
				/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,
				/^(?:\{\{\{\{(?=[^/]))/,
				/^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,
				/^(?:[^\x00]+?(?=(\{\{\{\{)))/,
				/^(?:[\s\S]*?--(~)?\}\})/,
				/^(?:\()/,
				/^(?:\))/,
				/^(?:\[)/,
				/^(?:\])/,
				/^(?:\{\{\{\{)/,
				/^(?:\}\}\}\})/,
				/^(?:\{\{(~)?>)/,
				/^(?:\{\{(~)?#>)/,
				/^(?:\{\{(~)?#\*?)/,
				/^(?:\{\{(~)?\/)/,
				/^(?:\{\{(~)?\^\s*(~)?\}\})/,
				/^(?:\{\{(~)?\s*else\s*(~)?\}\})/,
				/^(?:\{\{(~)?\^)/,
				/^(?:\{\{(~)?\s*else\b)/,
				/^(?:\{\{(~)?\{)/,
				/^(?:\{\{(~)?&)/,
				/^(?:\{\{(~)?!--)/,
				/^(?:\{\{(~)?![\s\S]*?\}\})/,
				/^(?:\{\{(~)?\*?)/,
				/^(?:=)/,
				/^(?:\.\.)/,
				/^(?:\.(?=([=~}\s\/.)\]|])))/,
				/^(?:\.#)/,
				/^(?:[\/.])/,
				/^(?:\s+)/,
				/^(?:\}(~)?\}\})/,
				/^(?:(~)?\}\})/,
				/^(?:"(\\["]|[^"])*")/,
				/^(?:'(\\[']|[^'])*')/,
				/^(?:@)/,
				/^(?:true(?=([~}\s)\]])))/,
				/^(?:false(?=([~}\s)\]])))/,
				/^(?:undefined(?=([~}\s)\]])))/,
				/^(?:null(?=([~}\s)\]])))/,
				/^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)\]])))/,
				/^(?:as\s+\|)/,
				/^(?:\|)/,
				/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)\]|]))))/,
				/^(?:\[(\\\]|[^\]])*\])/,
				/^(?:.)/,
				/^(?:$)/
			],
			conditions: {
				"mu": {
					"rules": [
						7,
						8,
						9,
						10,
						11,
						12,
						13,
						14,
						15,
						16,
						17,
						18,
						19,
						20,
						21,
						22,
						23,
						24,
						25,
						26,
						27,
						28,
						29,
						30,
						31,
						32,
						33,
						34,
						35,
						36,
						37,
						38,
						39,
						40,
						41,
						42,
						43,
						44,
						46,
						47
					],
					"inclusive": false
				},
				"emu": {
					"rules": [2],
					"inclusive": false
				},
				"com": {
					"rules": [6],
					"inclusive": false
				},
				"raw": {
					"rules": [
						3,
						4,
						5
					],
					"inclusive": false
				},
				"escl": {
					"rules": [45],
					"inclusive": false
				},
				"INITIAL": {
					"rules": [
						0,
						1,
						47
					],
					"inclusive": true
				}
			}
		};
	})();
	function Parser() {
		this.yy = {};
	}
	Parser.prototype = parser;
	parser.Parser = Parser;
	return new Parser();
})();
//#endregion
//#region lib/printer.js
function print(ast) {
	return new PrintVisitor().accept(ast);
}
function PrintVisitor() {
	this.padding = 0;
}
PrintVisitor.prototype = new Visitor();
PrintVisitor.prototype.pad = /** @this {HbsPrintVisitor} */ function(/** @type {string} */ string) {
	let out = "";
	for (let i = 0, l = this.padding; i < l; i++) out += "  ";
	out += string + "\n";
	return out;
};
PrintVisitor.prototype.Program = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ program) {
	let out = "", body = program.body, i, l;
	if (program.blockParams) {
		let blockParams = "BLOCK PARAMS: [";
		for (i = 0, l = program.blockParams.length; i < l; i++) blockParams += " " + program.blockParams[i];
		blockParams += " ]";
		out += this.pad(blockParams);
	}
	for (i = 0, l = body.length; i < l; i++) out += this.accept(body[i]);
	this.padding--;
	return out;
};
PrintVisitor.prototype.MustacheStatement = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ mustache) {
	if (mustache.params.length > 0 || mustache.hash) return this.pad("{{ " + this.callBody(mustache) + " }}");
	else return this.pad("{{ " + this.accept(mustache.path) + " }}");
};
PrintVisitor.prototype.Decorator = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ mustache) {
	return this.pad("{{ DIRECTIVE " + this.callBody(mustache) + " }}");
};
PrintVisitor.prototype.BlockStatement = PrintVisitor.prototype.DecoratorBlock = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ block) {
	let out = "";
	out += this.pad((block.type === "DecoratorBlock" ? "DIRECTIVE " : "") + "BLOCK:");
	this.padding++;
	out += this.pad(this.callBody(block));
	if (block.program) {
		out += this.pad("PROGRAM:");
		this.padding++;
		out += this.accept(block.program);
		this.padding--;
	}
	if (block.inverse) {
		if (block.program) this.padding++;
		out += this.pad("{{^}}");
		this.padding++;
		out += this.accept(block.inverse);
		this.padding--;
		if (block.program) this.padding--;
	}
	this.padding--;
	return out;
};
PrintVisitor.prototype.PartialStatement = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ partial) {
	let content = "PARTIAL:" + partial.name.original;
	if (partial.params[0]) content += " " + this.accept(partial.params[0]);
	if (partial.hash) content += " " + this.accept(partial.hash);
	return this.pad("{{> " + content + " }}");
};
PrintVisitor.prototype.PartialBlockStatement = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ partial) {
	let content = "PARTIAL BLOCK:" + partial.name.original;
	if (partial.params[0]) content += " " + this.accept(partial.params[0]);
	if (partial.hash) content += " " + this.accept(partial.hash);
	content += " " + this.pad("PROGRAM:");
	this.padding++;
	content += this.accept(partial.program);
	this.padding--;
	return this.pad("{{> " + content + " }}");
};
PrintVisitor.prototype.ContentStatement = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ content) {
	return this.pad("CONTENT[ '" + content.value + "' ]");
};
PrintVisitor.prototype.CommentStatement = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ comment) {
	return this.pad("{{! '" + comment.value + "' }}");
};
PrintVisitor.prototype.SubExpression = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ sexpr) {
	return `(${this.callBody(sexpr)})`;
};
PrintVisitor.prototype.callBody = /** @this {HbsPrintVisitor} */ function(callExpr) {
	let params = callExpr.params, paramStrings = [], hash;
	for (let i = 0, l = params.length; i < l; i++) paramStrings.push(this.accept(params[i]));
	params = paramStrings.length === 0 ? "" : " [" + paramStrings.join(", ") + "]";
	hash = callExpr.hash ? " " + this.accept(callExpr.hash) : "";
	return this.accept(callExpr.path) + params + hash;
};
PrintVisitor.prototype.PathExpression = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ id) {
	let path = [typeof id.head === "string" ? id.head : `[${this.accept(id.head)}]`, ...id.tail].join("/");
	return "p%" + prefix(id) + path;
};
function prefix(path) {
	if (path.data) return "@";
	else if (path.this) return "this.";
	else return "";
}
PrintVisitor.prototype.StringLiteral = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ string) {
	return "\"" + string.value + "\"";
};
PrintVisitor.prototype.NumberLiteral = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ number) {
	return "n%" + number.value;
};
PrintVisitor.prototype.BooleanLiteral = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ bool) {
	return "b%" + bool.value;
};
PrintVisitor.prototype.UndefinedLiteral = /** @this {HbsPrintVisitor} */ function() {
	return "UNDEFINED";
};
PrintVisitor.prototype.NullLiteral = /** @this {HbsPrintVisitor} */ function() {
	return "NULL";
};
PrintVisitor.prototype.ArrayLiteral = /** @this {HbsPrintVisitor} */ function(array) {
	return `Array[${array.items.map((item) => this.accept(item)).join(", ")}]`;
};
PrintVisitor.prototype.HashLiteral = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ hash) {
	return `Hash{${this.hashPairs(hash)}}`;
};
PrintVisitor.prototype.Hash = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ hash) {
	return `HASH{${this.hashPairs(hash)}}`;
};
PrintVisitor.prototype.hashPairs = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ hash) {
	let pairs = hash.pairs, joinedPairs = [];
	for (let i = 0, l = pairs.length; i < l; i++) joinedPairs.push(this.HashPair(pairs[i]));
	return joinedPairs.join(" ");
};
PrintVisitor.prototype.HashPair = /** @this {HbsPrintVisitor} */ function(/** @type {HbsNode} */ pair) {
	return pair.key + "=" + this.accept(pair.value);
};
//#endregion
//#region lib/helpers.js
var helpers_exports = /* @__PURE__ */ __exportAll({
	SourceLocation: () => SourceLocation,
	id: () => id,
	prepareBlock: () => prepareBlock,
	prepareMustache: () => prepareMustache,
	preparePartialBlock: () => preparePartialBlock,
	preparePath: () => preparePath,
	prepareProgram: () => prepareProgram,
	prepareRawBlock: () => prepareRawBlock,
	stripComment: () => stripComment,
	stripFlags: () => stripFlags
});
function validateClose(/** @type {HbsNode} */ open, close) {
	close = close.path ? close.path.original : close;
	if (open.path.original !== close) {
		let errorNode = { loc: open.path.loc };
		throw new Exception(open.path.original + " doesn't match " + close, errorNode);
	}
}
function SourceLocation(/** @type {string | undefined} */ source, /** @type {JisonLocation} */ locInfo) {
	this.source = source;
	this.start = {
		line: locInfo.first_line,
		column: locInfo.first_column
	};
	this.end = {
		line: locInfo.last_line,
		column: locInfo.last_column
	};
}
/** @returns {string | string[]} */ function id(/** @type {string | string[]} */ token) {
	if (/^\[.*\]$/.test(token)) return token.substring(1, token.length - 1);
	else return token;
}
function stripFlags(/** @type {string} */ open, /** @type {string} */ close) {
	return {
		open: open.charAt(2) === "~",
		close: close.charAt(close.length - 3) === "~"
	};
}
/** @returns {string} */ function stripComment(/** @type {string} */ comment) {
	return comment.replace(/^\{\{~?!-?-?/, "").replace(/-?-?~?\}\}$/, "");
}
/** @this {JisonShared} */ function preparePath(/** @type {boolean} */ data, sexpr, /** @type {HbsPathPart[]} */ parts, loc) {
	loc = this.locInfo(loc);
	let original;
	if (data) original = "@";
	else if (sexpr) original = sexpr.original + ".";
	else original = "";
	let tail = [];
	let depth = 0;
	for (let i = 0, l = parts.length; i < l; i++) {
		let part = parts[i].part;
		let isLiteral = parts[i].original !== part;
		let separator = parts[i].separator;
		let partPrefix = separator === ".#" ? "#" : "";
		original += (separator || "") + part;
		if (!isLiteral && (part === ".." || part === "." || part === "this")) {
			if (tail.length > 0) throw new Exception("Invalid path: " + original, { loc });
			else if (part === "..") depth++;
		} else tail.push(`${partPrefix}${part}`);
	}
	let head = sexpr || tail.shift();
	return {
		type: "PathExpression",
		this: original.startsWith("this."),
		data,
		depth,
		head,
		tail,
		parts: head ? [head, ...tail] : tail,
		original,
		loc
	};
}
/** @this {JisonShared} */ function prepareMustache(/** @type {HbsNode} */ path, /** @type {any[]} */ params, hash, /** @type {string} */ open, strip, locInfo) {
	let escapeFlag = open.charAt(3) || open.charAt(2), escaped = escapeFlag !== "{" && escapeFlag !== "&";
	return {
		type: /\*/.test(open) ? "Decorator" : "MustacheStatement",
		path,
		params,
		hash,
		escaped,
		strip,
		loc: this.locInfo(locInfo)
	};
}
/** @this {JisonShared} */ function prepareRawBlock(/** @type {HbsNode} */ openRawBlock, /** @type {any[]} */ contents, close, locInfo) {
	validateClose(openRawBlock, close);
	locInfo = this.locInfo(locInfo);
	let program = {
		type: "Program",
		body: contents,
		strip: {},
		loc: locInfo
	};
	return {
		type: "BlockStatement",
		path: openRawBlock.path,
		params: openRawBlock.params,
		hash: openRawBlock.hash,
		program,
		openStrip: {},
		inverseStrip: {},
		closeStrip: {},
		loc: locInfo
	};
}
/** @this {JisonShared} */ function prepareBlock(/** @type {HbsNode} */ openBlock, program, inverseAndProgram, close, inverted, locInfo) {
	if (close && close.path) validateClose(openBlock, close);
	let decorator = /\*/.test(openBlock.open);
	program.blockParams = openBlock.blockParams;
	let inverse, inverseStrip;
	if (inverseAndProgram) {
		if (decorator) throw new Exception("Unexpected inverse block on decorator", inverseAndProgram);
		if (inverseAndProgram.chain && !close.chain) {
			const closeStrip = close.strip;
			let innerBlock = inverseAndProgram.program.body[0];
			while (innerBlock) {
				innerBlock.closeStrip = closeStrip;
				innerBlock = innerBlock.inverse && innerBlock.inverse.chained ? innerBlock.inverse.body[0] : null;
			}
		}
		inverseStrip = inverseAndProgram.strip;
		inverse = inverseAndProgram.program;
	}
	if (inverted) {
		inverted = inverse;
		inverse = program;
		program = inverted;
	}
	return {
		type: decorator ? "DecoratorBlock" : "BlockStatement",
		path: openBlock.path,
		params: openBlock.params,
		hash: openBlock.hash,
		program,
		inverse,
		openStrip: openBlock.strip,
		inverseStrip,
		closeStrip: close && close.strip,
		loc: this.locInfo(locInfo)
	};
}
function prepareProgram(/** @type {any[]} */ statements, loc) {
	if (!loc && statements.length) {
		const firstLoc = statements[0].loc, lastLoc = statements[statements.length - 1].loc;
		/* istanbul ignore else */
		if (firstLoc && lastLoc) loc = {
			source: firstLoc.source,
			start: {
				line: firstLoc.start.line,
				column: firstLoc.start.column
			},
			end: {
				line: lastLoc.end.line,
				column: lastLoc.end.column
			}
		};
	}
	return {
		type: "Program",
		body: statements,
		strip: {},
		loc
	};
}
/** @this {JisonShared} */ function preparePartialBlock(/** @type {HbsNode} */ open, /** @type {HbsNode} */ program, close, locInfo) {
	validateClose(open, close);
	return {
		type: "PartialBlockStatement",
		name: open.path,
		params: open.params,
		hash: open.hash,
		program,
		openStrip: open.strip,
		closeStrip: close && close.strip,
		loc: this.locInfo(locInfo)
	};
}
//#endregion
//#region lib/parse.js
let baseHelpers = {};
for (let helper in helpers_exports) if (Object.prototype.hasOwnProperty.call(helpers_exports, helper)) baseHelpers[helper] = helpers_exports[helper];
function parseWithoutProcessing(/** @type {string} */ input, options) {
	if (input.type === "Program") return input;
	parser.yy = baseHelpers;
	parser.yy.locInfo = function(locInfo) {
		return new SourceLocation(options && options.srcName, locInfo);
	};
	let squareSyntax;
	if (typeof options?.syntax?.square === "function") squareSyntax = options.syntax.square;
	else if (options?.syntax?.square === "node") squareSyntax = arrayLiteralNode;
	else squareSyntax = "string";
	let hashSyntax;
	if (typeof options?.syntax?.hash === "function") hashSyntax = options.syntax.hash;
	else hashSyntax = hashLiteralNode;
	parser.yy.syntax = {
		square: squareSyntax,
		hash: hashSyntax
	};
	return parser.parse(input);
}
function arrayLiteralNode(array, loc) {
	return {
		type: "ArrayLiteral",
		items: array,
		loc
	};
}
function hashLiteralNode(hash, loc) {
	return {
		type: "HashLiteral",
		pairs: hash.pairs,
		loc
	};
}
/** @returns {import("glimmer-ast-types").GlimmerNode} */ function parse(/** @type {string} */ input, options) {
	let ast = parseWithoutProcessing(input, options);
	return new WhitespaceControl(options).accept(ast);
}
//#endregion
export { Exception, PrintVisitor, Visitor, WhitespaceControl, parse, parseWithoutProcessing, parser, print };

