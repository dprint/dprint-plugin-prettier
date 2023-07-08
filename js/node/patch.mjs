import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import * as url from "url";

const startupPath = new URL("../startup.js", import.meta.url);
let startupText = fs.readFileSync(startupPath, { encoding: "utf8" });
startupText = stripComments(startupText.replaceAll("✂", "\\u2702"));
fs.writeFileSync(startupPath, startupText);

function stripComments(text) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, /*skipTrivia*/ false);
  scanner.setText(text);
  let token = scanner.scan();
  let finalText = [];
  while (token != ts.SyntaxKind.EndOfFileToken) {
    if (token !== ts.SyntaxKind.SingleLineCommentTrivia && token !== ts.SyntaxKind.MultiLineCommentTrivia) {
      const tokenText = text.substring(scanner.getStartPos(), scanner.getTokenEnd());
      if (tokenText.includes("//")) {
        console.log(tokenText);
      }
      finalText.push(tokenText);
    }
    token = scanner.scan();
  }
  return finalText.join("");
}
