import { format, getSupportInfo, type Options, type Plugin, type SupportLanguage } from "prettier";
import * as pluginAcorn from "prettier/plugins/acorn";
import * as pluginAngular from "prettier/plugins/angular";
import * as pluginBabel from "prettier/plugins/babel";
import * as pluginEstree from "prettier/plugins/estree";
import * as pluginFlow from "prettier/plugins/flow";
import * as pluginGlimmer from "prettier/plugins/glimmer";
import * as pluginGraphQl from "prettier/plugins/graphql";
import * as pluginHtml from "prettier/plugins/html";
import * as pluginMarkdown from "prettier/plugins/markdown";
import * as pluginMeriyah from "prettier/plugins/meriyah";
import * as pluginPostCss from "prettier/plugins/postcss";
import * as pluginTypeScript from "prettier/plugins/typescript";
import * as pluginYaml from "prettier/plugins/yaml";

const plugins: Plugin[] = [
  pluginTypeScript,
  pluginBabel,
  pluginAcorn,
  pluginAngular,
  pluginEstree,
  pluginFlow,
  pluginGlimmer,
  pluginGraphQl,
  pluginHtml,
  pluginMarkdown,
  pluginMeriyah,
  pluginPostCss,
  pluginYaml,
];

(globalThis as any).dprint = {
  getExtensions,
  formatText,
};

async function getExtensions() {
  const set = new Set<string>();
  const supportInfo = await getSupportInfo();
  for (const language of supportInfo.languages) {
    addForLanguage(language);
  }
  for (const plugin of plugins) {
    for (const language of plugin.languages ?? []) {
      addForLanguage(language);
    }
  }
  return Array.from(set.values());

  function addForLanguage(language: SupportLanguage) {
    for (const ext of language.extensions ?? []) {
      set.add(ext.replace(/^\./, ""));
    }
  }
}

interface FormatTextOptions {
  filePath: string;
  fileText: string;
  config: Options;
}

async function formatText({ filePath, fileText, config }: FormatTextOptions) {
  const formattedText = await format(fileText, {
    filepath: filePath,
    plugins,
    ...config,
  });
  if (formattedText === fileText) {
    return undefined;
  } else {
    return formattedText;
  }
}
