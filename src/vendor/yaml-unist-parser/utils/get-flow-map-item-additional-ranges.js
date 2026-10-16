// @nts-check
export function getFlowMapItemAdditionalRanges(/** @type {any[]} */ cstNodes) {
    const [questionMarkRange, colonRange] = ["?", ":"].map(char => {
        const flowChar = cstNodes.find(/** @returns {boolean} */ (cstNode) => "char" in cstNode && cstNode.char === char);
        return flowChar
            ? { origStart: flowChar.origOffset, origEnd: flowChar.origOffset + 1 }
            : null;
    });
    return {
        additionalKeyRange: questionMarkRange,
        additionalValueRange: colonRange,
    };
}
