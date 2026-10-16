export function createBlockFolded(blockValue) {
    return {
        ...blockValue,
        type: "blockFolded",
    };
}
