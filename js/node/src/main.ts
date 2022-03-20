import prettier from "prettier";
import * as prettierPluginAstro from "prettier-plugin-astro";
import * as prettierPluginSvelte from "prettier-plugin-svelte";
import * as parserAngular from "prettier/parser-angular";
import * as parserBabel from "prettier/parser-babel";
import * as parserEspree from "prettier/parser-espree";
import * as parserFlow from "prettier/parser-flow";
import * as parserGlimmer from "prettier/parser-glimmer";
import * as parserGraphQl from "prettier/parser-graphql";
import * as parserHtml from "prettier/parser-html";
import * as parserMarkdown from "prettier/parser-markdown";
import * as parserMeriyah from "prettier/parser-meriyah";
import * as parserPostCss from "prettier/parser-postcss";
import * as parserTypeScript from "prettier/parser-typescript";
import * as parserYaml from "prettier/parser-yaml";

type JsonObject = { [key: string]: string | number | boolean };

const plugins: prettier.Plugin[] = [
  parserTypeScript,
  parserBabel,
  parserAngular,
  parserEspree,
  parserFlow,
  parserGlimmer,
  parserGraphQl,
  parserHtml,
  parserMarkdown,
  parserMeriyah,
  parserPostCss,
  parserYaml,
  prettierPluginSvelte,
  prettierPluginAstro,
];

let globalConfig: { [id: number]: JsonObject | undefined } = {};
let pluginConfig: { [id: number]: JsonObject | undefined } = {};
let resolvedConfig: { [id: number]: prettier.Options | undefined } = {};

globalThis.dprint = {
  getExtensions,
  getResolvedConfig,
  formatText,
};

function getExtensions() {
  const set = new Set<string>();
  for (const language of prettier.getSupportInfo().languages) {
    addForLanguage(language);
  }
  for (const plugin of plugins) {
    for (const language of plugin.languages ?? []) {
      addForLanguage(language);
    }
  }
  return Array.from(set.values());

  function addForLanguage(language: prettier.SupportLanguage) {
    for (const ext of language.extensions ?? []) {
      set.add(ext.replace(/^\./, ""));
    }
  }
}

function getResolvedConfig(configId: number) {
  let config = resolvedConfig[configId];
  if (config == null) {
    config = createResolvedConfig(configId, {});
    resolvedConfig[configId] = config;
  }
  return config;
}

function formatText(filePath: string, fileText: string, configId: number, overrideConfig: JsonObject) {
  const config = Object.keys(overrideConfig).length === 0
    ? getResolvedConfig(configId)
    : createResolvedConfig(configId, overrideConfig);
  const formattedText = formatTextWithPrettierConfig(filePath, fileText, config);
  if (formattedText === fileText) {
    return undefined;
  } else {
    return formattedText;
  }
}

function formatTextWithPrettierConfig(filePath: string, fileText: string, config: prettier.Options) {
  return prettier.format(fileText, {
    filepath: filePath,
    plugins,
    ...config,
  });
}

function createResolvedConfig(configId: number, overrideConfig: JsonObject) {
  const resolvedConfig: prettier.Options = {};
  updateGlobalPropertiesForConfig(globalConfig[configId]);
  updateForPluginConfig(pluginConfig[configId]);
  updateForPluginConfig(overrideConfig);
  return resolvedConfig;

  function updateForPluginConfig(pluginConfig: JsonObject | undefined) {
    if (pluginConfig == null) {
      return;
    }
    for (const key of Object.keys(pluginConfig)) {
      (resolvedConfig as JsonObject)[key] = pluginConfig[key];
    }

    updateGlobalPropertiesForConfig(pluginConfig);
  }

  function updateGlobalPropertiesForConfig(config: JsonObject | undefined) {
    if (config == null) {
      return;
    }
    if (typeof config.lineWidth === "number") {
      resolvedConfig.printWidth = config.lineWidth;
    }
    if (typeof config.indentWidth === "number") {
      resolvedConfig.tabWidth = config.indentWidth;
    }
    if (typeof config.useTabs === "boolean") {
      resolvedConfig.useTabs = config.useTabs;
    }
    if (typeof config.newLineKind === "string") {
      resolvedConfig.endOfLine = getEndOfLine(config.newLineKind);
    }
  }

  function getEndOfLine(newLineKind: string): prettier.Options["endOfLine"] {
    if (newLineKind == null) {
      return undefined;
    }
    switch (newLineKind) {
      case "auto":
        return "auto";
      case "lf":
        return "lf";
      case "crlf":
        return "crlf";
      case "system":
        if ((Deno as any).core.opSync("op_is_windows")) {
          return "crlf";
        } else {
          return "lf";
        }
    }
    return undefined;
  }
}
