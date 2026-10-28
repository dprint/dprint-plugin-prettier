// @nts-check
import coreOptions from "./core-options.evaluate.js";

/**
 * @import {OptionInfo} from "./core-options.evaluate.js"
 * @typedef {{ name: string; pluginDefaults: Array<any> } & OptionInfo} NamedOptionInfoOfPlugins
 *
 * an option with its name, as the core reads it from the options of the plugins and its own
 * @typedef {{
 *   name: string,
 *   pluginDefaults?: any,
 *   category?: string,
 *   type?: string,
 *   array?: boolean,
 *   default?: any,
 *   range?: any,
 *   description?: string,
 *   oppositeDescription?: string,
 *   deprecated?: any,
 *   redirect?: any,
 *   exception?: any,
 *   choices?: any[],
 *   alias?: string,
 *   cliName?: string,
 *   cliCategory?: string,
 *   cliDescription?: string,
 * }} NamedOptionInfo
 */

/**
 * Strings in `plugins` are handled by a wrapped version
 * of this function created by `withPlugins`. Don't pass them here directly.
 * @param {object} param0
 * @param {(string | object)[]=} param0.plugins Strings are resolved by `withPlugins`.
 * @param {boolean=} param0.showDeprecated
 * @return {{ languages: Array<any>, options: Array<NamedOptionInfo> }}
 */
function getSupportInfo({ plugins = [], showDeprecated = false } = {}) {
  const languages = plugins.flatMap(/** @returns {any[]} */ (plugin) => plugin.languages ?? []);

  /** @type {NamedOptionInfo[]} */
  const options = [];
  for (const option of normalizeOptionSettings(
    Object.assign({}, ...plugins.map(({ options }) => options), coreOptions),
  )) {
    if (!showDeprecated && option.deprecated) {
      continue;
    }

    if (Array.isArray(option.choices)) {
      if (!showDeprecated) {
        option.choices = option.choices.filter((/** @type {any} */ choice) => !choice.deprecated);
      }

      if (option.name === "parser") {
        option.choices = [
          ...option.choices,
          ...collectParsersFromLanguages(option.choices, languages, plugins),
        ];
      }
    }

    option.pluginDefaults = Object.fromEntries(
      plugins
        .filter(/** @returns {boolean} */ (plugin) => plugin.defaultOptions?.[option.name] !== undefined)
        .map((/** @type {any} */ plugin) => [plugin.name, plugin.defaultOptions[option.name]]),
    );

    options.push(option);
  }

  return { languages, options };
}

function* collectParsersFromLanguages(/** @type {any[]} */ parserChoices, /** @type {any[]} */ languages, /** @type {any[]} */ plugins) {
  /** @type {Set<string>} */
  const existingParsers = new Set(parserChoices.map(/** @returns {string} */ (choice) => choice.value));

  for (const language of languages) {
    if (language.parsers) {
      for (const parserName of language.parsers) {
        if (!existingParsers.has(parserName)) {
          existingParsers.add(parserName);
          const plugin = plugins.find(
            /** @returns {boolean} */ (plugin) =>
              plugin.parsers && Object.hasOwn(plugin.parsers, parserName),
          );

          /** @type {string} */
          let description = language.name;
          if (plugin?.name) {
            description += ` (plugin: ${plugin.name})`;
          }
          yield { value: parserName, description };
        }
      }
    }
  }
}

/** @returns {NamedOptionInfo[]} */ function normalizeOptionSettings(settings) {
  /** @type {NamedOptionInfo[]} */
  const options = [];
  for (const [name, originalOption] of Object.entries(settings)) {
    /** @type {NamedOptionInfo} */
    const option = { name, ...originalOption };

    // This work this way because we used support `[{value: [], since: '0.0.0'}]`
    if (Array.isArray(option.default)) {
      option.default = option.default.at(-1).value;
    }

    options.push(option);
  }

  return options;
}

export { getSupportInfo, normalizeOptionSettings };
