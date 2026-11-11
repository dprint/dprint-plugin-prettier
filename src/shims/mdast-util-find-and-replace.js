// what mdast-util-gfm-autolink-literal imports for its transform of literal autolinks, which prettier's markdown
// parser takes out (`autolinkExtension.transforms = []`), so it is never called, as prettier's own build leaves it out
export function findAndReplace() {
  throw new Error("mdast-util-find-and-replace is not included");
}
