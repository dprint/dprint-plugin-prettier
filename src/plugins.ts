/// <reference path="../nts/lib.d.ts" />
// the plugins that the plugin formats with: prettier's own and the Prettier plugins that the plugin includes, after
// prettier's as they would be given to it
import * as jsDocPlugin from "./vendor/prettier-plugin-jsdoc/index.js";
import * as sveltePlugin from "./vendor/prettier-plugin-svelte/browser.js";
import { builtinPlugins } from "./builtin-plugins.ts";

export const plugins: any[] = [...builtinPlugins, sveltePlugin];

/** The plugins with prettier-plugin-jsdoc, which `"plugin.jsDoc": true` turns on, last so that its parsers are used. */
export const jsDocPlugins: any[] = [...plugins, jsDocPlugin];
