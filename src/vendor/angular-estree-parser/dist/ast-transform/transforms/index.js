import { __exportAll } from "../../_virtual/_rolldown/runtime.js";
import { visitLiteralArray } from "./transform-array-expression.js";
import { visitArrowFunction } from "./transform-arrow-function-expression.js";
import { visitASTWithSource } from "./transform-ast-with-source.js";
import { visitBinary } from "./transform-binary-expression.js";
import { visitCall, visitSafeCall } from "./transform-call-expression.js";
import { visitChain } from "./transform-chained-expression.js";
import { visitConditional } from "./transform-conditional-expression.js";
import { visitEmptyExpr } from "./transform-empty-expression.js";
import { visitInterpolation } from "./transform-interpolation.js";
import { visitLiteralPrimitive, visitRegularExpressionLiteral } from "./transform-literal.js";
import { visitKeyedRead, visitPropertyRead, visitSafeKeyedRead, visitSafePropertyRead } from "./transform-member-expression.js";
import { visitNonNullAssert } from "./transform-non-null-expression.js";
import { visitLiteralMap } from "./transform-object-expression.js";
import { visitParenthesizedExpression } from "./transform-parenthesized-expression.js";
import { visitPipe } from "./transform-pipe-expression.js";
import { visitSpreadElement } from "./transform-spread-element.js";
import { visitTaggedTemplateLiteral, visitTemplateLiteral, visitTemplateLiteralElement } from "./transform-template-literal.js";
import { visitThisReceiver } from "./transform-this-expression.js";
import { visitPrefixNot, visitTypeofExpression, visitUnary, visitVoidExpression } from "./transform-unary-expression.js";
import { visitImplicitReceiver } from "./transform-unexpected-node.js";
//#region src/ast-transform/transforms/index.ts
var transforms_exports = /* @__PURE__ */ __exportAll({
	visitASTWithSource: () => visitASTWithSource,
	visitArrowFunction: () => visitArrowFunction,
	visitBinary: () => visitBinary,
	visitCall: () => visitCall,
	visitChain: () => visitChain,
	visitConditional: () => visitConditional,
	visitEmptyExpr: () => visitEmptyExpr,
	visitImplicitReceiver: () => visitImplicitReceiver,
	visitInterpolation: () => visitInterpolation,
	visitKeyedRead: () => visitKeyedRead,
	visitLiteralArray: () => visitLiteralArray,
	visitLiteralMap: () => visitLiteralMap,
	visitLiteralPrimitive: () => visitLiteralPrimitive,
	visitNonNullAssert: () => visitNonNullAssert,
	visitParenthesizedExpression: () => visitParenthesizedExpression,
	visitPipe: () => visitPipe,
	visitPrefixNot: () => visitPrefixNot,
	visitPropertyRead: () => visitPropertyRead,
	visitRegularExpressionLiteral: () => visitRegularExpressionLiteral,
	visitSafeCall: () => visitSafeCall,
	visitSafeKeyedRead: () => visitSafeKeyedRead,
	visitSafePropertyRead: () => visitSafePropertyRead,
	visitSpreadElement: () => visitSpreadElement,
	visitTaggedTemplateLiteral: () => visitTaggedTemplateLiteral,
	visitTemplateLiteral: () => visitTemplateLiteral,
	visitTemplateLiteralElement: () => visitTemplateLiteralElement,
	visitThisReceiver: () => visitThisReceiver,
	visitTypeofExpression: () => visitTypeofExpression,
	visitUnary: () => visitUnary,
	visitVoidExpression: () => visitVoidExpression
});
//#endregion
export { transforms_exports };
