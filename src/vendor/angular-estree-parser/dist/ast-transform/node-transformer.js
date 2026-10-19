// @nts-check
import { Source } from "../source.js";
import { transformVisitors } from "./visitors.js";
import { ParenthesizedExpression } from "@angular/compiler";
//#region src/ast-transform/node-transformer.ts
var NodeTransformer = class NodeTransformer extends Source {
	node;
	ancestors;
	constructor({ node, text, ancestors = [] }) {
		super(text);
		this.node = node;
		this.ancestors = ancestors;
	}
	create(properties, location, ancestors = this.ancestors) {
		if (ancestors[0] instanceof ParenthesizedExpression) properties.extra = {
			...properties.extra,
			parenthesized: true
		};
		return super.createNode(properties, properties.range ?? location ?? this.node);
	}
	transformChild(child) {
		return new NodeTransformer({
			node: child,
			ancestors: [this.node, ...this.ancestors],
			text: this.text
		}).transform();
	}
	/** @returns {any[]} */ transformChildren(/** @type {any[]} */ children) {
		return children.map((child) => this.transformChild(child));
	}
	transform() {
		const { node } = this;
		const properties = node.visit(transformVisitors, this);
		return this.create(properties, this.node);
	}
	static transform(node, /** @type {string | undefined} */ text) {
		return new NodeTransformer({
			node,
			text,
			ancestors: []
		}).transform();
	}
};
//#endregion
export { NodeTransformer };
