// @nts-check
import { group, indent, join, line, softline } from "../../document/index.js";
import { printClosingTagEnd, printOpeningTagStart } from "./tag.js";

/** @import AstPath from "../../common/ast-path.js" */

/*
  <span i18n>
    Updated {minutes, plural,
      =0 {just now}
      =1 {one minute ago}
      other {{{minutes}} minutes ago}
    }
  </span>
*/

/** @returns {any[]} */ function printAngularIcuExpression(/** @type {AstPath} */ path, options, /** @type {(selector?: any, args?: any) => any} */ print) {
  /** @type {{ node: import("../parse/ast.js").Node }} */ const { node } = path;
  return [
    printOpeningTagStart(node, options),
    group([
      node.switchValue.trim(),
      ", ",
      node.type,
      node.cases.length > 0
        ? [",", indent([line, join(line, path.map(print, "cases"))])]
        : "",
      softline,
    ]),
    printClosingTagEnd(node, options),
  ];
}

/** @returns {any[]} */ function printAngularIcuCase(/** @type {AstPath} */ path, options, /** @type {() => any} */ print) {
  /** @type {{ node: import("../parse/ast.js").Node }} */ const { node } = path;

  return [
    node.value,
    " {",
    group([
      indent([
        softline,
        path.map(({ node, isLast }) => {
          const parts = [print()];

          if (node.kind === "text") {
            if (node.hasLeadingSpaces) {
              parts.unshift(line);
            }

            if (node.hasTrailingSpaces && !isLast) {
              parts.push(line);
            }
          }

          return parts;
        }, "expression"),
      ]),
      softline,
    ]),
    "}",
  ];
}

export { printAngularIcuCase, printAngularIcuExpression };
