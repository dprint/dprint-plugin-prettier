// @nts-check
/** @typedef {import("../parse_util.mjs").ParseSourceSpan} ParseSourceSpan */
/** @import {Token} from "angular-html-parser-types" */
/**
 * what the parser makes, and what a visitor visits
 * @typedef {Text | CDATA | Expansion | ExpansionCase | Attribute | StartTagComment | Element | Comment | DocType | Block | Component | Directive | BlockParameter | LetDeclaration} AstNode
 */
//#region ../compiler/src/ml_parser/ast.ts
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
*/
var NodeWithI18n = class {
	/** @type {ParseSourceSpan} */ sourceSpan;
	i18n;
	constructor(/** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan, i18n) {
		this.sourceSpan = sourceSpan;
		this.i18n = i18n;
	}
};
var Text = class extends NodeWithI18n {
	/** @type {string} */ value;
	/** @type {Token[]} */ tokens;
	constructor(/** @type {string} */ value, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan, /** @type {Token[]} */ tokens, i18n) {
		super(sourceSpan, i18n);
		this.value = value;
		this.tokens = tokens;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitText(this, context);
	}
	kind = "text";
};
var CDATA = class extends NodeWithI18n {
	/** @type {string} */ value;
	/** @type {Token[]} */ tokens;
	constructor(/** @type {string} */ value, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan, /** @type {Token[]} */ tokens, i18n) {
		super(sourceSpan, i18n);
		this.value = value;
		this.tokens = tokens;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitCdata(this, context);
	}
	kind = "cdata";
};
var Expansion = class extends NodeWithI18n {
	/** @type {string} */ switchValue;
	/** @type {string} */ type;
	/** @type {ExpansionCase[]} */ cases;
	/** @type {import("../parse_util.mjs").ParseSourceSpan} */ switchValueSourceSpan;
	constructor(/** @type {string} */ switchValue, /** @type {string} */ type, /** @type {ExpansionCase[]} */ cases, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ switchValueSourceSpan, i18n) {
		super(sourceSpan, i18n);
		this.switchValue = switchValue;
		this.type = type;
		this.cases = cases;
		this.switchValueSourceSpan = switchValueSourceSpan;
	}
	/** @returns {any[]} */ visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitExpansion(this, context);
	}
	kind = "expansion";
};
var ExpansionCase = class {
	/** @type {string} */ value;
	/** @type {any[]} */ expression;
	/** @type {ParseSourceSpan} */ sourceSpan;
	/** @type {import("../parse_util.mjs").ParseSourceSpan} */ valueSourceSpan;
	/** @type {import("../parse_util.mjs").ParseSourceSpan} */ expSourceSpan;
	constructor(/** @type {string} */ value, /** @type {any[]} */ expression, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ valueSourceSpan, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ expSourceSpan) {
		this.value = value;
		this.expression = expression;
		this.sourceSpan = sourceSpan;
		this.valueSourceSpan = valueSourceSpan;
		this.expSourceSpan = expSourceSpan;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitExpansionCase(this, context);
	}
	kind = "expansionCase";
};
/**
 * prettier gives attributes their namespace when it parses
 * @property {string | null} [namespace]
 * @property {boolean} [hasExplicitNamespace]
 */
var Attribute = class extends NodeWithI18n {
	/** @type {string} */ name;
	/** @type {string | null} */ value;
	/** @type {ParseSourceSpan} */ keySpan;
	/** @type {ParseSourceSpan | undefined} */ valueSpan;
	/** @type {Token[] | undefined} */ valueTokens;
	constructor(/** @type {string} */ name, /** @type {string} */ value, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ keySpan, /** @type {import("../parse_util.mjs").ParseSourceSpan | undefined} */ valueSpan, /** @type {Token[] | undefined} */ valueTokens, i18n) {
		super(sourceSpan, i18n);
		this.name = name;
		this.value = value;
		this.keySpan = keySpan;
		this.valueSpan = valueSpan;
		this.valueTokens = valueTokens;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitAttribute(this, context);
	}
	kind = "attribute";
	/** @returns {import("../parse_util.mjs").ParseSourceSpan} */ get nameSpan() {
		return this.keySpan;
	}
};
var StartTagComment = class {
	/** @type {string} */ value;
	/** @type {string} */ type;
	/** @type {ParseSourceSpan} */ sourceSpan;
	constructor(/** @type {string} */ value, /** @type {string} */ type, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan) {
		this.value = value;
		this.type = type;
		this.sourceSpan = sourceSpan;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitStartTagComment ? visitor.visitStartTagComment(this, context) : void 0;
	}
	kind = "startTagComment";
};
/**
 * prettier gives elements their namespace and the definition of their tag when it parses
 * @property {string | null} [namespace]
 * @property {boolean} [hasExplicitNamespace]
 * @property {import("./html_tags.mjs").HtmlTagDefinition} [tagDefinition]
 */
var Element = class extends NodeWithI18n {
	/** @type {string} */ name;
	/** @type {Attribute[]} */ attrs;
	/** @type {Directive[]} */ directives;
	/** @type {any[]} */ children;
	/** @type {boolean} */ isSelfClosing;
	/** @type {ParseSourceSpan} */ startSourceSpan;
	/** @type {ParseSourceSpan | null} */ endSourceSpan;
	/** @type {ParseSourceSpan | null} */ nameSpan;
	/** @type {boolean} */ isVoid;
	/** @type {StartTagComment[]} */ comments;
	constructor(/** @type {string} */ name, /** @type {Attribute[]} */ attrs, /** @type {Directive[]} */ directives, /** @type {any[]} */ children, /** @type {boolean} */ isSelfClosing, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ startSourceSpan, endSourceSpan = null, nameSpan = null, /** @type {boolean} */ isVoid, i18n, comments = []) {
		super(sourceSpan, i18n);
		this.name = name;
		this.attrs = attrs;
		this.directives = directives;
		this.children = children;
		this.isSelfClosing = isSelfClosing;
		this.startSourceSpan = startSourceSpan;
		this.endSourceSpan = endSourceSpan;
		this.nameSpan = nameSpan;
		this.isVoid = isVoid;
		this.comments = comments;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitElement(this, context);
	}
	kind = "element";
};
var Comment = class {
	/** @type {string | null} */ value;
	/** @type {ParseSourceSpan} */ sourceSpan;
	constructor(/** @type {string} */ value, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan) {
		this.value = value;
		this.sourceSpan = sourceSpan;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitComment(this, context);
	}
	kind = "comment";
};
var DocType = class {
	/** @type {string | null} */ value;
	/** @type {ParseSourceSpan} */ sourceSpan;
	constructor(/** @type {string} */ value, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan) {
		this.value = value;
		this.sourceSpan = sourceSpan;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitDocType(this, context);
	}
	kind = "docType";
};
var Block = class extends NodeWithI18n {
	/** @type {string} */ name;
	/** @type {BlockParameter[]} */ parameters;
	/** @type {any[]} */ children;
	/** @type {ParseSourceSpan | null} */ nameSpan;
	/** @type {ParseSourceSpan} */ startSourceSpan;
	/** @type {ParseSourceSpan | null} */ endSourceSpan;
	constructor(/** @type {string} */ name, /** @type {BlockParameter[]} */ parameters, /** @type {any[]} */ children, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ nameSpan, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ startSourceSpan, endSourceSpan = null, i18n) {
		super(sourceSpan, i18n);
		this.name = name;
		this.parameters = parameters;
		this.children = children;
		this.nameSpan = nameSpan;
		this.startSourceSpan = startSourceSpan;
		this.endSourceSpan = endSourceSpan;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitBlock(this, context);
	}
	kind = "block";
};
var Component = class extends NodeWithI18n {
	componentName;
	tagName;
	fullName;
	attrs;
	directives;
	children;
	isSelfClosing;
	/** @type {ParseSourceSpan} */ startSourceSpan;
	/** @type {ParseSourceSpan | null} */ endSourceSpan;
	comments;
	constructor(componentName, tagName, fullName, attrs, directives, children, isSelfClosing, sourceSpan, startSourceSpan, endSourceSpan = null, i18n, comments = []) {
		super(sourceSpan, i18n);
		this.componentName = componentName;
		this.tagName = tagName;
		this.fullName = fullName;
		this.attrs = attrs;
		this.directives = directives;
		this.children = children;
		this.isSelfClosing = isSelfClosing;
		this.startSourceSpan = startSourceSpan;
		this.endSourceSpan = endSourceSpan;
		this.comments = comments;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitComponent(this, context);
	}
	kind = "component";
};
var Directive = class {
	name;
	attrs;
	/** @type {ParseSourceSpan} */ sourceSpan;
	/** @type {ParseSourceSpan} */ startSourceSpan;
	/** @type {ParseSourceSpan | null} */ endSourceSpan;
	constructor(name, attrs, sourceSpan, startSourceSpan, endSourceSpan = null) {
		this.name = name;
		this.attrs = attrs;
		this.sourceSpan = sourceSpan;
		this.startSourceSpan = startSourceSpan;
		this.endSourceSpan = endSourceSpan;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitDirective(this, context);
	}
	kind = "directive";
};
var BlockParameter = class {
	/** @type {string} */ expression;
	/** @type {ParseSourceSpan} */ sourceSpan;
	constructor(/** @type {string} */ expression, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan) {
		this.expression = expression;
		this.sourceSpan = sourceSpan;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitBlockParameter(this, context);
	}
	/** @type {string} */ kind = "blockParameter";
	startSourceSpan = null;
	endSourceSpan = null;
};
var LetDeclaration = class {
	/** @type {string} */ name;
	/** @type {string} */ value;
	/** @type {ParseSourceSpan} */ sourceSpan;
	/** @type {ParseSourceSpan | null} */ nameSpan;
	/** @type {ParseSourceSpan | undefined} */ valueSpan;
	constructor(/** @type {string} */ name, /** @type {string} */ value, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ sourceSpan, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ nameSpan, /** @type {import("../parse_util.mjs").ParseSourceSpan} */ valueSpan) {
		this.name = name;
		this.value = value;
		this.sourceSpan = sourceSpan;
		this.nameSpan = nameSpan;
		this.valueSpan = valueSpan;
	}
	visit(/** @type {RecursiveVisitor} */ visitor, context) {
		return visitor.visitLetDeclaration(this, context);
	}
	kind = "letDeclaration";
	startSourceSpan = null;
	endSourceSpan = null;
};
/** @returns {any[]} */ function visitAll(/** @type {RecursiveVisitor} */ visitor, /** @type {any[] | undefined} */ nodes, context = null) {
	const result = [];
	const visit = visitor.visit ? /** @returns {any[] | undefined} */ (/** @type {AstNode} */ ast) => visitor.visit(ast, context) || ast.visit(visitor, context) : /** @returns {any[] | undefined} */ (/** @type {AstNode} */ ast) => ast.visit(visitor, context);
	nodes.forEach((/** @type {AstNode} */ ast) => {
		const astResult = visit(ast);
		if (astResult) result.push(astResult);
	});
	return result;
}
var RecursiveVisitor = class {
	constructor() {}
	visitElement(/** @type {Element} */ ast, context) {
		this.visitChildren(context, (visit) => {
			visit(ast.attrs);
			visit(ast.directives);
			visit(ast.comments);
			visit(ast.children);
		});
	}
	visitAttribute(/** @type {Attribute} */ ast, context) {}
	visitStartTagComment(/** @type {StartTagComment} */ ast, context) {}
	visitText(/** @type {Text} */ ast, context) {}
	visitCdata(/** @type {CDATA} */ ast, context) {}
	visitComment(/** @type {Comment} */ ast, context) {}
	visitDocType(/** @type {DocType} */ ast, context) {}
	/** @returns {any[]} */ visitExpansion(/** @type {Expansion} */ ast, context) {
		return this.visitChildren(context, (visit) => {
			visit(ast.cases);
		});
	}
	visitExpansionCase(ast, context) {}
	visitBlock(/** @type {Block} */ block, context) {
		this.visitChildren(context, (visit) => {
			visit(block.parameters);
			visit(block.children);
		});
	}
	visitBlockParameter(/** @type {BlockParameter} */ ast, context) {}
	visitLetDeclaration(/** @type {LetDeclaration} */ decl, context) {}
	visitComponent(/** @type {Component} */ component, context) {
		this.visitChildren(context, (visit) => {
			visit(component.attrs);
			visit(component.comments);
			visit(component.children);
		});
	}
	visitDirective(/** @type {Directive} */ directive, context) {
		this.visitChildren(context, (visit) => {
			visit(directive.attrs);
		});
	}
	/** @returns {any[]} */ visitChildren(context, /** @type {(visit: (children: any[] | undefined) => void) => void} */ cb) {
		/** @type {any[][]} */ let results = [];
		let t = this;
		function visit(/** @type {any[] | undefined} */ children) {
			if (children) results.push(visitAll(t, children, context));
		}
		cb(visit);
		return Array.prototype.concat.apply([], results);
	}
};
//#endregion
export { Attribute, Block, BlockParameter, CDATA, Comment, Component, Directive, DocType, Element, Expansion, ExpansionCase, LetDeclaration, NodeWithI18n, RecursiveVisitor, StartTagComment, Text, visitAll };
