// @nts-check
import { createUpdater } from "./create-updater.js";
import { getLast } from "./get-last.js";
export function updatePositions(node) {
    if (node === null || !("children" in node)) {
        return;
    }
    const children = node.children;
    children.forEach(updatePositions);
    if (node.type === "document") {
        const [head, body] = node.children;
        if (head.position.start.offset === head.position.end.offset) {
            head.position.start = head.position.end = body.position.start;
        }
        else if (body.position.start.offset === body.position.end.offset) {
            body.position.start = body.position.end = head.position.end;
        }
    }
    const updateStartPoint = createUpdater(node.position, startPointGetter, startPointSetter, shouldUpdateStartPoint);
    const updateEndPoint = createUpdater(node.position, endPointGetter, endPointSetter, shouldUpdateEndPoint);
    if ("endComments" in node && node.endComments.length !== 0) {
        updateStartPoint(node.endComments[0].position.start);
        updateEndPoint(getLast(node.endComments).position.end);
    }
    const nonNullChildren = children.filter(/** @returns {boolean} */ (child) => child !== null);
    if (nonNullChildren.length !== 0) {
        const firstChild = nonNullChildren[0];
        const lastChild = getLast(nonNullChildren);
        updateStartPoint(firstChild.position.start);
        updateEndPoint(lastChild.position.end);
        if ("leadingComments" in firstChild &&
            firstChild.leadingComments.length !== 0) {
            updateStartPoint(firstChild.leadingComments[0].position.start);
        }
        if ("tag" in firstChild && firstChild.tag) {
            updateStartPoint(firstChild.tag.position.start);
        }
        if ("anchor" in firstChild && firstChild.anchor) {
            updateStartPoint(firstChild.anchor.position.start);
        }
        if ("trailingComment" in lastChild && lastChild.trailingComment) {
            updateEndPoint(lastChild.trailingComment.position.end);
        }
    }
}
function startPointGetter(position) {
    return position.start;
}
function startPointSetter(position, point) {
    position.start = point;
}
function endPointGetter(position) {
    return position.end;
}
function endPointSetter(position, point) {
    position.end = point;
}
/** @returns {boolean} */ function shouldUpdateStartPoint(reduced, value) {
    return value.offset < reduced.offset;
}
/** @returns {boolean} */ function shouldUpdateEndPoint(reduced, value) {
    return value.offset > reduced.offset;
}
