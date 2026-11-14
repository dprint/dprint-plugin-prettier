// @nts-check
import tokenize from 'postcss/lib/tokenize';

/** @type {RegExp} */ const urlPattern = /^url\((.+)\)/;

export function convertImport(/** @type {import("postcss/lib/node")} */ node) {
  const { name, params = '' } = node;

  if (name === 'import' && params.length) {
    node.import = true;

    /** @type {import("postcss/lib/parser").Tokenizer} */ const tokenizer = tokenize({ css: params });

    node.filename = params.replace(urlPattern, '$1');

    while (!tokenizer.endOfFile()) {
      const [type, content] = tokenizer.nextToken();

      if (type === 'word' && content === 'url') {
        return;
      } else if (type === 'brackets') {
        node.options = content;
        node.filename = params.replace(content, '').trim();
        break;
      }
    }
  }
}
