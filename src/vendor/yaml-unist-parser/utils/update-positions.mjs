// @nts-check
/** @import { YamlNode, Position, Point } from "../transforms/context.mjs" */
import { getLast } from "./get-last.mjs";
import { createUpdater } from "./create-updater.mjs";
//#region src/utils/update-positions.ts
function updatePositions(/** @type {YamlNode | null} */ node) {
	if (node === null || !("children" in node)) return;
	const children = node.children;
	children.forEach(updatePositions);
	if (node.type === "document") {
		const [head, body] = node.children;
		if (head.position.start.offset === head.position.end.offset) head.position.start = head.position.end = body.position.start;
		else if (body.position.start.offset === body.position.end.offset) body.position.start = body.position.end = head.position.end;
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
		if ("leadingComments" in firstChild && firstChild.leadingComments.length !== 0) updateStartPoint(firstChild.leadingComments[0].position.start);
		if ("tag" in firstChild && firstChild.tag) updateStartPoint(firstChild.tag.position.start);
		if ("anchor" in firstChild && firstChild.anchor) updateStartPoint(firstChild.anchor.position.start);
		if ("trailingComment" in lastChild && lastChild.trailingComment) updateEndPoint(lastChild.trailingComment.position.end);
	}
}
/** @returns {Point} */ function startPointGetter(/** @type {Position} */ position) {
	return position.start;
}
function startPointSetter(/** @type {Position} */ position, /** @type {Point} */ point) {
	position.start = point;
}
/** @returns {Point} */ function endPointGetter(/** @type {Position} */ position) {
	return position.end;
}
function endPointSetter(/** @type {Position} */ position, /** @type {Point} */ point) {
	position.end = point;
}
/** @returns {boolean} */ function shouldUpdateStartPoint(/** @type {Point} */ reduced, /** @type {Point} */ value) {
	return value.offset < reduced.offset;
}
/** @returns {boolean} */ function shouldUpdateEndPoint(/** @type {Point} */ reduced, /** @type {Point} */ value) {
	return value.offset > reduced.offset;
}
//#endregion
export { updatePositions };
