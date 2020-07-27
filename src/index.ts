import * as os from "os";
import prettier from "prettier";
import { StdInOutReaderWriter } from "./StdInOutReaderWriter";

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

const textEncoder = new TextEncoder();
const stdInOut = new StdInOutReaderWriter();

main();

function main() {
    let globalConfig: any = {};
    let pluginConfig: any = {};
    let resolvedConfig: prettier.Options | undefined = undefined;
    while (true) {
        const messageKind = stdInOut.readMessageKind() as MessageKind;
        try {
            switch (messageKind) {
                case MessageKind.Close:
                    return;
                case MessageKind.GetPluginSchemaVersion:
                    sendInt(1);
                    break;
                case MessageKind.GetPluginInfo:
                    sendString(JSON.stringify(getPluginInfo()));
                    break;
                case MessageKind.GetLicenseText:
                    sendString(getLicenseText());
                    break;
                case MessageKind.GetResolvedConfig:
                    sendString(JSON.stringify(getResolvedConfig()));
                    break;
                case MessageKind.SetGlobalConfig:
                    resolvedConfig = undefined;
                    globalConfig = JSON.parse(stdInOut.readMessagePartAsString());
                    sendSuccess();
                    break;
                case MessageKind.SetPluginConfig:
                    resolvedConfig = undefined;
                    pluginConfig = JSON.parse(stdInOut.readMessagePartAsString());
                    sendSuccess();
                    break;
                case MessageKind.GetConfigDiagnostics:
                    sendString("[]"); // todo
                    break;
                case MessageKind.FormatText:
                    const filePath = stdInOut.readMessagePartAsString();
                    const fileText = stdInOut.readMessagePartAsString();
                    const formattedText = formatText(filePath, fileText, getResolvedConfig());

                    if (formattedText === fileText) {
                        sendResponse([FormatResult.NoChange]);
                    } else {
                        sendResponse([FormatResult.Change, formattedText]);
                    }
                    break;
                default:
                    const _assertNever: never = messageKind;
                    throw new Error(`Unhandled message kind: ${messageKind}`);
            }
        } catch (err) {
            const message = `${err.message}\n${err.stack?.toString()}`;
            sendErrorResponse(message);
        }
    }

    function getResolvedConfig() {
        if (resolvedConfig != null) {
            return resolvedConfig;
        }

        resolvedConfig = {};
        resolvedConfig.printWidth = globalConfig.lineWidth;
        resolvedConfig.tabWidth = globalConfig.indentWidth;
        resolvedConfig.useTabs = globalConfig.useTabs;
        resolvedConfig.endOfLine = getEndOfLine();

        for (const key of Object.keys(pluginConfig)) {
            (resolvedConfig as any)[key] = pluginConfig[key];
        }

        return resolvedConfig;

        function getEndOfLine(): prettier.Options["endOfLine"] {
            if (globalConfig.newLineKind == null) {
                return undefined;
            }
            switch (globalConfig.newLineKind) {
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

function sendInt(value: number) {
    sendResponse([value]);
}

function sendString(value: string) {
    sendResponse([value]);
}

function sendSuccess() {
    sendResponse([]);
}

function sendResponse(parts: (Buffer | string | number)[]) {
    const buffers = getBuffers(); // do this before setting a success message kind
    stdInOut.sendMessageKind(ResponseKind.Success);
    for (const buffer of buffers) {
        stdInOut.sendMessagePart(buffer);
    }

    function getBuffers() {
        const buffers: Buffer[] = [];
        for (const part of parts) {
            if (typeof part === "string") {
                buffers.push(new Buffer(textEncoder.encode(part)));
            } else if (typeof part === "number") {
                const buf = new Buffer(4);
                buf.writeUInt32BE(part);
                buffers.push(buf);
            } else {
                buffers.push(part);
            }
        }
        return buffers;
    }
}

function sendErrorResponse(message: string) {
    stdInOut.sendMessageKind(ResponseKind.Error);
    stdInOut.sendMessagePart(new Buffer(textEncoder.encode(message)));
}

function getPluginInfo() {
    return {
        name: "dprint-plugin-prettier",
        version: "2.0.5",
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
