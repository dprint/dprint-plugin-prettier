// @nts-check
/** @typedef {import("../parse_util.mjs").ParseSourceSpan} ParseSourceSpan */
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
	constructor(sourceSpan, i18n) {
		this.sourceSpan = sourceSpan;
		this.i18n = i18n;
	}
};
var Text = class extends NodeWithI18n {
	/** @type {string} */ value;
	tokens;
	constructor(/** @type {string} */ value, sourceSpan, /** @type {any[]} */ tokens, i18n) {
		super(sourceSpan, i18n);
		this.value = value;
		this.tokens = tokens;
	}
	visit(visitor, context) {
		return visitor.visitText(this, context);
	}
	kind = "text";
};
var CDATA = class extends NodeWithI18n {
	/** @type {string} */ value;
	tokens;
	constructor(/** @type {string} */ value, sourceSpan, /** @type {any[]} */ tokens, i18n) {
		super(sourceSpan, i18n);
		this.value = value;
		this.tokens = tokens;
	}
	visit(visitor, context) {
		return visitor.visitCdata(this, context);
	}
	kind = "cdata";
};
var Expansion = class extends NodeWithI18n {
	switchValue;
	type;
	cases;
	switchValueSourceSpan;
	constructor(/** @type {string} */ switchValue, /** @type {string} */ type, /** @type {any[]} */ cases, sourceSpan, switchValueSourceSpan, i18n) {
		super(sourceSpan, i18n);
		this.switchValue = switchValue;
		this.type = type;
		this.cases = cases;
		this.switchValueSourceSpan = switchValueSourceSpan;
	}
	/** @returns {any[]} */ visit(visitor, context) {
		return visitor.visitExpansion(this, context);
	}
	kind = "expansion";
};
var ExpansionCase = class {
	value;
	expression;
	/** @type {ParseSourceSpan} */ sourceSpan;
	valueSourceSpan;
	expSourceSpan;
	constructor(/** @type {string} */ value, /** @type {any[]} */ expression, sourceSpan, valueSourceSpan, expSourceSpan) {
		this.value = value;
		this.expression = expression;
		this.sourceSpan = sourceSpan;
		this.valueSourceSpan = valueSourceSpan;
		this.expSourceSpan = expSourceSpan;
	}
	visit(visitor, context) {
		return visitor.visitExpansionCase(this, context);
	}
	kind = "expansionCase";
};
var Attribute = class extends NodeWithI18n {
	/** @type {string} */ name;
	/** @type {string | null} */ value;
	/** @type {ParseSourceSpan} */ keySpan;
	/** @type {ParseSourceSpan | undefined} */ valueSpan;
	valueTokens;
	constructor(/** @type {string} */ name, /** @type {string} */ value, sourceSpan, keySpan, valueSpan, /** @type {any[] | undefined} */ valueTokens, i18n) {
		super(sourceSpan, i18n);
		this.name = name;
		this.value = value;
		this.keySpan = keySpan;
		this.valueSpan = valueSpan;
		this.valueTokens = valueTokens;
	}
	visit(visitor, context) {
		return visitor.visitAttribute(this, context);
	}
	kind = "attribute";
	get nameSpan() {
		return this.keySpan;
	}
};
var StartTagComment = class {
	value;
	type;
	/** @type {ParseSourceSpan} */ sourceSpan;
	constructor(/** @type {string} */ value, /** @type {string} */ type, sourceSpan) {
		this.value = value;
		this.type = type;
		this.sourceSpan = sourceSpan;
	}
	visit(visitor, context) {
		return visitor.visitStartTagComment ? visitor.visitStartTagComment(this, context) : void 0;
	}
	kind = "startTagComment";
};
var Element = class extends NodeWithI18n {
	/** @type {string} */ name;
	attrs;
	directives;
	children;
	/** @type {boolean} */ isSelfClosing;
	/** @type {ParseSourceSpan} */ startSourceSpan;
	/** @type {ParseSourceSpan | null} */ endSourceSpan;
	/** @type {ParseSourceSpan | null} */ nameSpan;
	/** @type {boolean} */ isVoid;
	comments;
	constructor(/** @type {string} */ name, /** @type {any[]} */ attrs, /** @type {any[]} */ directives, /** @type {any[]} */ children, /** @type {boolean} */ isSelfClosing, sourceSpan, startSourceSpan, endSourceSpan = null, nameSpan = null, /** @type {boolean} */ isVoid, i18n, comments = []) {
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
	visit(visitor, context) {
		return visitor.visitElement(this, context);
	}
	kind = "element";
};
var Comment = class {
	/** @type {string | null} */ value;
	/** @type {ParseSourceSpan} */ sourceSpan;
	constructor(/** @type {string} */ value, sourceSpan) {
		this.value = value;
		this.sourceSpan = sourceSpan;
	}
	visit(visitor, context) {
		return visitor.visitComment(this, context);
	}
	kind = "comment";
};
var DocType = class {
	/** @type {string | null} */ value;
	/** @type {ParseSourceSpan} */ sourceSpan;
	constructor(/** @type {string} */ value, sourceSpan) {
		this.value = value;
		this.sourceSpan = sourceSpan;
	}
	visit(visitor, context) {
		return visitor.visitDocType(this, context);
	}
	kind = "docType";
};
var Block = class extends NodeWithI18n {
	name;
	parameters;
	children;
	/** @type {ParseSourceSpan | null} */ nameSpan;
	/** @type {ParseSourceSpan} */ startSourceSpan;
	/** @type {ParseSourceSpan | null} */ endSourceSpan;
	constructor(/** @type {string} */ name, /** @type {any[]} */ parameters, /** @type {any[]} */ children, sourceSpan, nameSpan, startSourceSpan, endSourceSpan = null, i18n) {
		super(sourceSpan, i18n);
		this.name = name;
		this.parameters = parameters;
		this.children = children;
		this.nameSpan = nameSpan;
		this.startSourceSpan = startSourceSpan;
		this.endSourceSpan = endSourceSpan;
	}
	visit(visitor, context) {
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
	visit(visitor, context) {
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
	visit(visitor, context) {
		return visitor.visitDirective(this, context);
	}
	kind = "directive";
};
var BlockParameter = class {
	expression;
	/** @type {ParseSourceSpan} */ sourceSpan;
	constructor(/** @type {string} */ expression, sourceSpan) {
		this.expression = expression;
		this.sourceSpan = sourceSpan;
	}
	visit(visitor, context) {
		return visitor.visitBlockParameter(this, context);
	}
	kind = "blockParameter";
	startSourceSpan = null;
	endSourceSpan = null;
};
var LetDeclaration = class {
	name;
	value;
	/** @type {ParseSourceSpan} */ sourceSpan;
	/** @type {ParseSourceSpan | null} */ nameSpan;
	/** @type {ParseSourceSpan | undefined} */ valueSpan;
	constructor(/** @type {string} */ name, /** @type {string} */ value, sourceSpan, nameSpan, valueSpan) {
		this.name = name;
		this.value = value;
		this.sourceSpan = sourceSpan;
		this.nameSpan = nameSpan;
		this.valueSpan = valueSpan;
	}
	visit(visitor, context) {
		return visitor.visitLetDeclaration(this, context);
	}
	kind = "letDeclaration";
	startSourceSpan = null;
	endSourceSpan = null;
};
/** @returns {any[]} */ function visitAll(visitor, /** @type {any[] | undefined} */ nodes, context = null) {
	const result = [];
	const visit = visitor.visit ? /** @returns {any[] | undefined} */ (ast) => visitor.visit(ast, context) || ast.visit(visitor, context) : (ast) => ast.visit(visitor, context);
	nodes.forEach((ast) => {
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
	visitStartTagComment(ast, context) {}
	visitText(/** @type {Text} */ ast, context) {}
	visitCdata(/** @type {CDATA} */ ast, context) {}
	visitComment(/** @type {Comment} */ ast, context) {}
	visitDocType(/** @type {DocType} */ ast, context) {}
	/** @returns {any[]} */ visitExpansion(ast, context) {
		return this.visitChildren(context, (visit) => {
			visit(ast.cases);
		});
	}
	visitExpansionCase(ast, context) {}
	visitBlock(block, context) {
		this.visitChildren(context, (visit) => {
			visit(block.parameters);
			visit(block.children);
		});
	}
	visitBlockParameter(ast, context) {}
	visitLetDeclaration(decl, context) {}
	visitComponent(component, context) {
		this.visitChildren(context, (visit) => {
			visit(component.attrs);
			visit(component.comments);
			visit(component.children);
		});
	}
	visitDirective(directive, context) {
		this.visitChildren(context, (visit) => {
			visit(directive.attrs);
		});
	}
	/** @returns {any[]} */ visitChildren(context, cb) {
		let results = [];
		let t = this;
		function visit(/** @type {any[]} */ children) {
			if (children) results.push(visitAll(t, children, context));
		}
		cb(visit);
		return Array.prototype.concat.apply([], results);
	}
};
//#endregion
export { Attribute, Block, BlockParameter, CDATA, Comment, Component, Directive, DocType, Element, Expansion, ExpansionCase, LetDeclaration, NodeWithI18n, RecursiveVisitor, StartTagComment, Text, visitAll };
