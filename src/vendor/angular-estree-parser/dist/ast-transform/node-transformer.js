// @nts-check
import { Source } from "../source.js";
import { transformVisitors } from "./visitors.js";
import { ParenthesizedExpression } from "@angular/compiler";
//#region src/ast-transform/node-transformer.ts
var NodeTransformer = class NodeTransformer extends Source {
	/** @type {any} */ node;
	/** @type {any[]} */ ancestors;
	constructor(/** @type {{ node: any, text: string, ancestors?: any[] }} */ { node, text, ancestors = [] }) {
		super(text);
		this.node = node;
		this.ancestors = ancestors;
	}
	/** @returns {import("../source.js").NGNode} */ create(/** @type {import("../source.js").NGNode} */ properties, /** @type {any} */ location, /** @type {any[]} */ ancestors = this.ancestors) {
		if (ancestors[0] instanceof ParenthesizedExpression) properties.extra = {
			...properties.extra,
			parenthesized: true
		};
		return super.createNode(properties, properties.range ?? location ?? this.node);
	}
	/** @returns {import("../source.js").NGNode} */ transformChild(/** @type {any} */ child) {
		return new NodeTransformer({
			node: child,
			ancestors: [this.node, ...this.ancestors],
			text: this.text
		}).transform();
	}
	/** @returns {any[]} */ transformChildren(/** @type {any[]} */ children) {
		return children.map((child) => this.transformChild(child));
	}
	/** @returns {import("../source.js").NGNode} */ transform() {
		const { node } = this;
		const properties = /** @type {import("../source.js").NGNode} */ (node.visit(transformVisitors, this));
		return this.create(properties, this.node);
	}
	/** @returns {import("../source.js").NGNode} */ static transform(/** @type {any} */ node, /** @type {string | undefined} */ text) {
		return new NodeTransformer({
			node,
			text,
			ancestors: []
		}).transform();
	}
};
//#endregion
export { NodeTransformer };
