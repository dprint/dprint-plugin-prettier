export function createBlockLiteral(blockValue) {
    return {
        ...blockValue,
        type: "blockLiteral",
    };
}
