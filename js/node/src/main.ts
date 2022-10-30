import prettier from "prettier";
import * as prettierPluginAstro from "prettier-plugin-astro";
import * as prettierPluginJsDoc from "prettier-plugin-jsdoc";
import * as prettierPluginSvelte from "prettier-plugin-svelte";
import "timers"
// @ts-ignore
import * as prettierPluginFixPack from "prettier-plugin-fixpack";
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
  prettierPluginAstro,
  prettierPluginSvelte,
  prettierPluginFixPack,
];

(globalThis as any).dprint = {
  getExtensions,
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

interface FormatTextOptions {
  filePath: string;
  fileText: string;
  config: prettier.Options;
  pluginsConfig: PluginsConfig;
}

interface PluginsConfig {
  js_doc: boolean;
}

function formatText({ filePath, fileText, config, pluginsConfig }: FormatTextOptions) {
  const formattedText = prettier.format(fileText, {
    filepath: filePath,
    plugins: getPlugins(pluginsConfig),
    ...config,
  });
  if (formattedText === fileText) {
    return undefined;
  } else {
    return formattedText;
  }
}

function getPlugins(pluginsConfig: PluginsConfig) {
  if (pluginsConfig.js_doc) {
    return [...plugins, prettierPluginJsDoc];
  } else {
    return plugins;
  }
}
