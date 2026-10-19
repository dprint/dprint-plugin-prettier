// @nts-check
import { lowercaseFirst } from "../utilities.js";
import { Source } from "../source.js";
import { transformAstNode } from "../ast-transform/index.js";
import { ExpressionBinding, VariableBinding } from "@angular/compiler";
//#region src/microsyntax/transform-template-binding.ts
/** @returns {boolean} */ function isExpressionBinding(templateBinding) {
	return templateBinding instanceof ExpressionBinding;
}
/** @returns {boolean} */ function isVariableBinding(templateBinding) {
	return templateBinding instanceof VariableBinding;
}
var TemplateBindingTransformer = class extends Source {
	#rawTemplateBindings;
	#text;
	constructor(/** @type {any[]} */ rawTemplateBindings, /** @type {string} */ text) {
		super(text);
		this.#rawTemplateBindings = rawTemplateBindings;
		this.#text = text;
		for (const expression of rawTemplateBindings) this.#fixTemplateBindingSpan(expression);
	}
	get expressions() {
		return this.#transformTemplateBindings();
	}
	get #prefix() {
		return this.#rawTemplateBindings[0].key;
	}
	#create(properties, location) {
		return super.createNode(properties, location);
	}
	#transform(node) {
		return transformAstNode(node, this.text);
	}
	#removePrefix(string) {
		return lowercaseFirst(string.slice(this.#prefix.source.length));
	}
	/**
	* - "a"  (start=0 end=1) -> (start=0 end=3)
	* - '\'' (start=0 end=1) -> (start=0 end=4)
	*/
	#fixSpan(span) {
		const text = this.#text;
		if (text[span.start] !== "\"" && text[span.start] !== "'") return;
		const quote = text[span.start];
		let hasBackSlash = false;
		for (let i = span.start + 1; i < text.length; i++) switch (text[i]) {
			case quote: if (!hasBackSlash) {
				span.end = i + 1;
				return;
			}
			default:
				hasBackSlash = false;
				break;
			case "\\":
				hasBackSlash = !hasBackSlash;
				break;
		}
	}
	#fixTemplateBindingSpan(templateBinding) {
		this.#fixSpan(templateBinding.key.span);
		if (isVariableBinding(templateBinding) && templateBinding.value) this.#fixSpan(templateBinding.value.span);
	}
	/**
	* - "as b" (value="NgEstreeParser" key="b") -> (value="$implicit" key="b")
	*/
	#getAsVariableBindingValue(variableBinding) {
		if (!variableBinding.value || variableBinding.value.source) return variableBinding.value;
		const index = this.getCharacterIndex(/\S/, variableBinding.sourceSpan.start);
		return {
			source: "$implicit",
			span: {
				start: index,
				end: index
			}
		};
	}
	#transformTemplateBindings() {
		const rawTemplateBindings = this.#rawTemplateBindings;
		const [firstTemplateBinding] = rawTemplateBindings;
		const templateBindings = this.#text.slice(firstTemplateBinding.sourceSpan.start, firstTemplateBinding.sourceSpan.end).trim().length === 0 ? rawTemplateBindings.slice(1) : rawTemplateBindings;
		const body = [];
		let lastTemplateBinding = null;
		for (const [index, templateBinding] of templateBindings.entries()) {
			if (lastTemplateBinding && isExpressionBinding(lastTemplateBinding) && isVariableBinding(templateBinding) && templateBinding.value && templateBinding.value.source === lastTemplateBinding.key.source) {
				const alias = this.#create({
					type: "NGMicrosyntaxKey",
					name: templateBinding.key.source
				}, templateBinding.key.span);
				const updateSpanEnd = (node, /** @type {number} */ end) => ({
					...node,
					...this.transformSpan({
						start: node.start,
						end
					})
				});
				const updateExpressionAlias = (expression) => ({
					...updateSpanEnd(expression, alias.end),
					alias
				});
				const lastNode = body.pop();
				if (lastNode.type === "NGMicrosyntaxExpression") body.push(updateExpressionAlias(lastNode));
				else if (lastNode.type === "NGMicrosyntaxKeyedExpression") {
					const expression = updateExpressionAlias(lastNode.expression);
					body.push(updateSpanEnd({
						...lastNode,
						expression
					}, expression.end));
				} else
 /* c8 ignore next 2 @preserve */
				throw new Error(`Unexpected type ${lastNode.type}`);
			} else body.push(this.#transformTemplateBinding(templateBinding, index));
			lastTemplateBinding = templateBinding;
		}
		return this.#create({
			type: "NGMicrosyntax",
			body
		}, body.length === 0 ? rawTemplateBindings[0].sourceSpan : {
			start: body[0].start,
			end: body.at(-1).end
		});
	}
	#transformTemplateBinding(templateBinding, index) {
		if (isExpressionBinding(templateBinding)) {
			const { key, value } = templateBinding;
			if (!value) return this.#create({
				type: "NGMicrosyntaxKey",
				name: this.#removePrefix(key.source)
			}, key.span);
			else if (index === 0) return this.#create({
				type: "NGMicrosyntaxExpression",
				expression: this.#transform(value.ast),
				alias: null
			}, value);
			else return this.#create({
				type: "NGMicrosyntaxKeyedExpression",
				key: this.#create({
					type: "NGMicrosyntaxKey",
					name: this.#removePrefix(key.source)
				}, key.span),
				expression: this.#create({
					type: "NGMicrosyntaxExpression",
					expression: this.#transform(value.ast),
					alias: null
				}, value)
			}, [key.span.start, value.sourceSpan.end]);
		} else {
			const { key, sourceSpan } = templateBinding;
			if (/^let\s$/.test(this.#text.slice(sourceSpan.start, sourceSpan.start + 4))) {
				const { value } = templateBinding;
				return this.#create({
					type: "NGMicrosyntaxLet",
					key: this.#create({
						type: "NGMicrosyntaxKey",
						name: key.source
					}, key.span),
					value: !value ? null : this.#create({
						type: "NGMicrosyntaxKey",
						name: value.source
					}, value.span)
				}, [sourceSpan.start, value ? value.span.end : key.span.end]);
			} else {
				const value = this.#getAsVariableBindingValue(templateBinding);
				return this.#create({
					type: "NGMicrosyntaxAs",
					key: this.#create({
						type: "NGMicrosyntaxKey",
						name: value.source
					}, value.span),
					alias: this.#create({
						type: "NGMicrosyntaxKey",
						name: key.source
					}, key.span)
				}, [value.span.start, key.span.end]);
			}
		}
	}
};
function transformTemplateBindings(/** @type {any[]} */ rawTemplateBindings, /** @type {string} */ text) {
	return new TemplateBindingTransformer(rawTemplateBindings, text).expressions;
}
//#endregion
export { transformTemplateBindings };
