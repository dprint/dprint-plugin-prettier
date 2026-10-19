//#region src/ast-transform/transforms/transform-unexpected-node.ts
/* c8 ignore next @preserve */
const transformUnexpectedNode = (node) => {
	throw new Error(`Unexpected node type '${node.constructor.name}'`);
};
const visitImplicitReceiver = transformUnexpectedNode;
//#endregion
export { visitImplicitReceiver };
