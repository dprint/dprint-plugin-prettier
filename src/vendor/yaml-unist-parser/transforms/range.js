import { createPosition } from "../factories/position.js";
export function transformRange(range, context) {
    return createPosition(context.transformOffset(range.origStart), context.transformOffset(range.origEnd));
}
