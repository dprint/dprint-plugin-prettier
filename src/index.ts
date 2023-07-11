import {
  FormatRequest,
  JsonObject,
  parseCliArgs,
  PluginHandler,
  ResolveConfigResult,
  startMessageProcessor,
  startParentProcessChecker,
} from "@dprint/node-plugin-base";
import os from "os";
import prettier from "prettier";
import * as prettierPluginAstro from "prettier-plugin-astro";
import * as prettierPluginJsDoc from "prettier-plugin-jsdoc";
import * as prettierPluginSvelte from "prettier-plugin-svelte";
import { VERSION } from "./version.js";

interface ResolvedConfig {
  prettier: prettier.Options;
  jsDocPlugin: boolean;
}

const cliArgs = parseCliArgs();
startParentProcessChecker(cliArgs.parentProcessId);

if (cliArgs.isInit) {
  throw new Error("Not implemented");
}

const plugins: prettier.Plugin[] = [
  prettierPluginSvelte,
  prettierPluginAstro,
];

const plugin: PluginHandler<ResolvedConfig> = {
  pluginInfo() {
    return {
      name: "dprint-plugin-prettier",
      version: VERSION,
      configKey: "prettier",
      fileExtensions: getExtensions(),
      helpUrl: "https://dprint.dev/plugins/prettier",
      configSchemaUrl: "",
      updateUrl: "https://plugins.dprint.dev/dprint/dprint-plugin-prettier/latest.json",
    };
  },
  licenseText() {
    return getLicenseText();
  },
  resolveConfig(pluginConfig: JsonObject, globalConfig: JsonObject): ResolveConfigResult<ResolvedConfig> {
    const resolvedConfig: ResolvedConfig = {
      prettier: {},
      jsDocPlugin: false,
    };
    updateGlobalPropertiesForConfig(globalConfig);
    updateForPluginConfig(pluginConfig);

    return {
      config: resolvedConfig,
      diagnostics: [], // todo
    };

    function updateForPluginConfig(pluginConfig: JsonObject) {
      for (const key of Object.keys(pluginConfig)) {
        if (key === "plugin.jsDoc") {
          resolvedConfig.jsDocPlugin = !!pluginConfig[key];
          continue;
        }
        (resolvedConfig.prettier as JsonObject)[key] = pluginConfig[key];
      }

      updateGlobalPropertiesForConfig(pluginConfig);
    }

    function updateGlobalPropertiesForConfig(config: any) {
      if (config.lineWidth != null) {
        resolvedConfig.prettier.printWidth = config.lineWidth;
      }
      if (config.indentWidth != null) {
        resolvedConfig.prettier.tabWidth = config.indentWidth;
      }
      if (config.useTabs != null) {
        resolvedConfig.prettier.useTabs = config.useTabs;
      }
      if (config.newLineKind != null) {
        resolvedConfig.prettier.endOfLine = getEndOfLine(config.newLineKind);
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
          switch (os.EOL) {
            case "\r\n":
              return "crlf";
            case "\n":
              return "lf";
          }
      }
      return undefined;
    }
  },
  formatText(request: FormatRequest<ResolvedConfig>) {
    return Promise.resolve(prettier.format(request.fileText, {
      filepath: request.filePath,
      plugins: request.config.jsDocPlugin ? [prettierPluginJsDoc, ...plugins] : plugins,
      ...request.config.prettier,
    }));
  },
};

startMessageProcessor(plugin);

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

function getLicenseText() {
  return `prettier: Copyright (c) James Long and contributors (MIT License)

The MIT License (MIT)

Copyright (c) 2020-2023 David Sherret

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}
