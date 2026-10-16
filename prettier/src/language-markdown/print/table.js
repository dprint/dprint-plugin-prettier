// @nts-check
/** @import AstPath from "../../common/ast-path.js" */
import {
  breakParent,
  group,
  hardlineWithoutBreakParent,
  ifBreak,
  join,
} from "../../document/builders.js";
import { printDocToString } from "../../document/printer.js";
import getStringWidth from "../../utils/get-string-width.js";

function printTable(/** @type {AstPath} */ path, options, /** @type {() => any} */ print) {
  const { node } = path;

  const columnMaxWidths = [];
  // { [rowIndex: number]: { [columnIndex: number]: {text: string, width: number} } }
  const contents = path.map(
    () =>
      path.map(({ index: columnIndex }) => {
        /** @type {string} */ const text = printDocToString(print(), options).formatted;
        /** @type {number} */ const width = getStringWidth(text);
        columnMaxWidths[columnIndex] = Math.max(
          columnMaxWidths[columnIndex] ?? 3, // minimum width = 3 (---, :--, :-:, --:)
          width,
        );
        return { text, width };
      }, "children"),
    "children",
  );

  const alignedTable = printTableContents(/* isCompact */ false);
  if (options.proseWrap !== "never") {
    return [breakParent, alignedTable];
  }

  // Only if the --prose-wrap never is set and it exceeds the print width.
  const compactTable = printTableContents(/* isCompact */ true);
  return [breakParent, group(ifBreak(compactTable, alignedTable))];

  function printTableContents(/** @type {boolean} */ isCompact) {
    return join(
      hardlineWithoutBreakParent,
      [
        printRow(contents[0], isCompact),
        printAlign(isCompact),
        ...contents
          .slice(1)
          .map((rowContents) => printRow(rowContents, isCompact)),
      ].map(/** @returns {string} */ (columns) => `| ${columns.join(" | ")} |`),
    );
  }

  function printAlign(/** @type {boolean} */ isCompact) {
    return columnMaxWidths.map(/** @returns {string} */ (width, index) => {
      /** @type {string | undefined | null} */ const align = node.align[index];
      /** @type {string} */ const first = align === "center" || align === "left" ? ":" : "-";
      /** @type {string} */ const last = align === "center" || align === "right" ? ":" : "-";
      /** @type {string} */ const middle = isCompact ? "-" : "-".repeat(width - 2);
      return `${first}${middle}${last}`;
    });
  }

  function printRow(columns, /** @type {boolean} */ isCompact) {
    return columns.map(/** @returns {string} */ ({ text, width }, columnIndex) => {
      if (isCompact) {
        return text;
      }
      /** @type {number} */ const spaces = columnMaxWidths[columnIndex] - width;
      /** @type {string | undefined | null} */ const align = node.align[columnIndex];
      /** @type {number} */ let before = 0;
      if (align === "right") {
        before = spaces;
      } else if (align === "center") {
        before = Math.floor(spaces / 2);
      }
      /** @type {number} */ const after = spaces - before;
      return `${" ".repeat(before)}${text}${" ".repeat(after)}`;
    });
  }
}

export { printTable };
