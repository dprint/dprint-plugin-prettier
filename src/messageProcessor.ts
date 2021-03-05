import * as os from "os";
import prettier from "prettier";
import { MessagePart, StdIoMessenger } from "./messenger/index";

enum MessageKind {
    GetPluginSchemaVersion = 0,
    GetPluginInfo = 1,
    GetLicenseText = 2,
    GetResolvedConfig = 3,
    SetGlobalConfig = 4,
    SetPluginConfig = 5,
    GetConfigDiagnostics = 6,
    FormatText = 7,
    Close = 8,
}

enum ResponseKind {
    Success = 0,
    Error = 1,
}

enum FormatResult {
    NoChange = 0,
    Change = 1,
}
type JsonObject = { [key: string]: string | number | boolean };

const messenger = new StdIoMessenger();

export async function startMessageProcessor() {
    let globalConfig: JsonObject = {};
    let pluginConfig: JsonObject = {};
    let resolvedConfig: prettier.Options | undefined = undefined;

    while (true) {
        const messageKind = await messenger.readCode() as MessageKind;
        try {
            switch (messageKind) {
                case MessageKind.Close:
                    process.exit(0); // need to kill parent process checker
                    return;
                case MessageKind.GetPluginSchemaVersion:
                    await messenger.readZeroPartMessage();
                    await sendSuccess(MessagePart.fromNumber(3));
                    break;
                case MessageKind.GetPluginInfo:
                    await messenger.readZeroPartMessage();
                    await sendSuccess(MessagePart.fromString(JSON.stringify(getPluginInfo())));
                    break;
                case MessageKind.GetLicenseText:
                    await messenger.readZeroPartMessage();
                    await sendSuccess(MessagePart.fromString(getLicenseText()));
                    break;
                case MessageKind.GetResolvedConfig:
                    await messenger.readZeroPartMessage();
                    await sendSuccess(MessagePart.fromString(JSON.stringify(getResolvedConfig())));
                    break;
                case MessageKind.SetGlobalConfig:
                    resolvedConfig = undefined;
                    globalConfig = JSON.parse((await messenger.readSinglePartMessage()).intoString());
                    await sendSuccess();
                    break;
                case MessageKind.SetPluginConfig:
                    resolvedConfig = undefined;
                    pluginConfig = JSON.parse((await messenger.readSinglePartMessage()).intoString());
                    await sendSuccess();
                    break;
                case MessageKind.GetConfigDiagnostics:
                    await messenger.readZeroPartMessage();
                    await sendSuccess(MessagePart.fromString("[]")); // todo
                    break;
                case MessageKind.FormatText:
                    const messageParts = await messenger.readMultiPartMessage(3);
                    const filePath = messageParts[0].intoString();
                    const fileText = messageParts[1].intoString();
                    const overrideConfig = JSON.parse(messageParts[2].intoString()) as JsonObject;
                    const config = Object.keys(overrideConfig).length === 0
                        ? getResolvedConfig()
                        : createResolvedConfig(overrideConfig);
                    const formattedText = formatText(filePath, fileText, config);

                    if (formattedText === fileText) {
                        await sendSuccess(MessagePart.fromNumber(FormatResult.NoChange));
                    } else {
                        await sendSuccess(
                            MessagePart.fromNumber(FormatResult.Change),
                            MessagePart.fromString(formattedText),
                        );
                    }
                    break;
                default:
                    const _assertNever: never = messageKind;
                    throw new Error(`Unhandled message kind: ${messageKind}`);
            }
        } catch (err) {
            const message = `${err.message}\n${err.stack?.toString()}`;
            await sendErrorResponse(message);
        }
    }

    function getResolvedConfig() {
        if (resolvedConfig != null) {
            return resolvedConfig;
        }

        resolvedConfig = createResolvedConfig({});
        return resolvedConfig;
    }

    function createResolvedConfig(overrideConfig: JsonObject) {
        const resolvedConfig: prettier.Options = {};
        updateGlobalPropertiesForConfig(globalConfig);
        updateForPluginConfig(pluginConfig);
        updateForPluginConfig(overrideConfig);

        return resolvedConfig;

        function updateForPluginConfig(pluginConfig: JsonObject) {
            for (const key of Object.keys(pluginConfig)) {
                (resolvedConfig as JsonObject)[key] = pluginConfig[key];
            }

            updateGlobalPropertiesForConfig(pluginConfig);
        }

        function updateGlobalPropertiesForConfig(config: any) {
            if (config.lineWidth != null) {
                resolvedConfig.printWidth = config.lineWidth;
            }
            if (config.indentWidth != null) {
                resolvedConfig.tabWidth = config.indentWidth;
            }
            if (config.useTabs != null) {
                resolvedConfig.useTabs = config.useTabs;
            }
            if (config.newLineKind != null) {
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
                    switch (os.EOL) {
                        case "\r\n":
                            return "crlf";
                        case "\n":
                            return "lf";
                    }
            }
            return undefined;
        }
    }
}

function sendSuccess(...parts: MessagePart[]) {
    return messenger.sendMessage(ResponseKind.Success, ...parts);
}

function sendErrorResponse(message: string) {
    return messenger.sendMessage(ResponseKind.Error, MessagePart.fromString(message));
}

function getPluginInfo() {
    return {
        name: "dprint-plugin-prettier",
        version: "0.2.2",
        configKey: "prettier",
        fileExtensions: getExtensions(),
        helpUrl: "https://dprint.dev/plugins/prettier",
        configSchemaUrl: "",
    };
}

function getLicenseText() {
    return `prettier: Copyright (c) James Long and contributors (MIT License)

The MIT License (MIT)

Copyright (c) 2020 David Sherret

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

function formatText(filePath: string, fileText: string, config: prettier.Options) {
    return prettier.format(fileText, {
        filepath: filePath,
        ...config,
    });
}

function getExtensions() {
    const set = new Set<string>();
    for (const language of prettier.getSupportInfo().languages) {
        for (const ext of language.extensions ?? []) {
            set.add(ext.replace(/^\./, ""));
        }
    }
    return Array.from(set.values());
}
