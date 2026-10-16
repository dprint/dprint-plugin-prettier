// @nts-check
export function createContent(tag, anchor, /** @type {any[]} */ middleComments) {
    return {
        anchor,
        tag,
        middleComments,
    };
}
