import { group, indent, line } from "../../document/index.js";
import { hasLeadingOwnLineComment } from "../utilities/has-leading-own-line-comment.js";
import { isObjectType } from "../utilities/node-types.js";

/** @import AstPath from "../../common/ast-path.js" */

// `TSIntersectionType` and `IntersectionTypeAnnotation`
function printIntersectionType(/** @type {AstPath} */ path, options, /** @type {() => any} */ print) {
  /** @type {boolean} */ let wasIndented = false;
  return group(
    path.map(({ isFirst, previous, node, index }) => {
      const doc = print();
      if (isFirst) {
        return doc;
      }

      /** @type {boolean} */ const currentIsObjectType = isObjectType(node);
      /** @type {boolean} */ const previousIsObjectType = isObjectType(previous);

      // If both are objects, don't indent
      if (previousIsObjectType && currentIsObjectType) {
        return [" & ", wasIndented ? indent(doc) : doc];
      }

      if (
        // If no object is involved, go to the next line if it breaks
        (!previousIsObjectType && !currentIsObjectType) ||
        hasLeadingOwnLineComment(options.originalText, node)
      ) {
        if (options.experimentalOperatorPosition === "start") {
          return indent([line, "& ", doc]);
        }
        return indent([" &", line, doc]);
      }

      // If you go from object to non-object or vis-versa, then inline it
      if (index > 1) {
        wasIndented = true;
      }

      return [" & ", index > 1 ? indent(doc) : doc];
    }, "types"),
  );
}

export { printIntersectionType };
