import { format, getSupportInfo } from "npm:prettier@^3.8.1";
import * as prettierPluginSvelte from "npm:prettier-plugin-svelte@^3.5.1";
import * as prettierPluginJsdoc from "npm:prettier-plugin-jsdoc@^1.8.0";

const PLUGIN_SCHEMA_VERSION = 5;
const SUCCESS_BYTES = new Uint8Array([255, 255, 255, 255]);

// message ids
const SUCCESS_ID = 0;
const DATA_RESPONSE_ID = 1;
const ERROR_ID = 2;
const CLOSE_ID = 3;
const IS_ALIVE_ID = 4;
const GET_PLUGIN_INFO_ID = 5;
const GET_LICENSE_TEXT_ID = 6;
const REGISTER_CONFIG_ID = 7;
const RELEASE_CONFIG_ID = 8;
const GET_CONFIG_DIAGNOSTICS_ID = 9;
const GET_FILE_MATCHING_INFO_ID = 10;
const GET_RESOLVED_CONFIG_ID = 11;
const _CHECK_CONFIG_UPDATES_ID = 12;
const FORMAT_ID = 13;
const FORMAT_RESPONSE_ID = 14;
const _CANCEL_FORMAT_ID = 15;
const _HOST_FORMAT_ID = 16;

interface ResolvedConfig {
  prettierOptions: Record<string, unknown>;
  jsDocPlugin: boolean;
}

const configs = new Map<number, ResolvedConfig>();

// --- binary protocol helpers ---

const stdin = Deno.stdin;
const stdout = Deno.stdout;

async function readExact(n: number): Promise<Uint8Array> {
  const buf = new Uint8Array(n);
  let offset = 0;
  while (offset < n) {
    const read = await stdin.read(buf.subarray(offset));
    if (read === null) throw new Error("stdin closed");
    offset += read;
  }
  return buf;
}

async function readU32(): Promise<number> {
  const buf = await readExact(4);
  return new DataView(buf.buffer).getUint32(0, false); // big-endian
}

async function readSizedBytes(): Promise<Uint8Array> {
  const len = await readU32();
  if (len === 0) return new Uint8Array(0);
  return await readExact(len);
}

async function readSuccessBytes(): Promise<void> {
  const buf = await readExact(4);
  if (buf[0] !== 255 || buf[1] !== 255 || buf[2] !== 255 || buf[3] !== 255) {
    throw new Error(`Did not receive success bytes: ${buf}`);
  }
}

function writeU32(value: number): Uint8Array {
  const buf = new Uint8Array(4);
  new DataView(buf.buffer).setUint32(0, value, false); // big-endian
  return buf;
}

function writeSizedBytes(data: Uint8Array): Uint8Array {
  const lenBuf = writeU32(data.length);
  const result = new Uint8Array(4 + data.length);
  result.set(lenBuf, 0);
  result.set(data, 4);
  return result;
}

async function sendMessage(parts: Uint8Array[]): Promise<void> {
  let totalLen = 0;
  for (const p of parts) totalLen += p.length;
  totalLen += SUCCESS_BYTES.length;
  const buf = new Uint8Array(totalLen);
  let offset = 0;
  for (const p of parts) {
    buf.set(p, offset);
    offset += p.length;
  }
  buf.set(SUCCESS_BYTES, offset);
  await stdout.write(buf);
}

async function sendSuccess(msgId: number, originalMsgId: number): Promise<void> {
  await sendMessage([writeU32(msgId), writeU32(SUCCESS_ID), writeU32(originalMsgId)]);
}

async function sendDataResponse(msgId: number, originalMsgId: number, data: Uint8Array): Promise<void> {
  await sendMessage([writeU32(msgId), writeU32(DATA_RESPONSE_ID), writeU32(originalMsgId), writeSizedBytes(data)]);
}

async function sendError(msgId: number, originalMsgId: number, error: string): Promise<void> {
  const data = new TextEncoder().encode(error);
  await sendMessage([writeU32(msgId), writeU32(ERROR_ID), writeU32(originalMsgId), writeSizedBytes(data)]);
}

async function sendFormatResponse(msgId: number, originalMsgId: number, data: Uint8Array | null): Promise<void> {
  if (data === null) {
    await sendMessage([writeU32(msgId), writeU32(FORMAT_RESPONSE_ID), writeU32(originalMsgId), writeU32(0)]);
  } else {
    await sendMessage([writeU32(msgId), writeU32(FORMAT_RESPONSE_ID), writeU32(originalMsgId), writeU32(1), writeSizedBytes(data)]);
  }
}

// --- plugin logic ---

let nextMsgId = 1;

function getPluginInfo(): Record<string, unknown> {
  return {
    name: "dprint-plugin-prettier",
    version: "0.68.0",
    configKey: "prettier",
    helpUrl: "https://dprint.dev/plugins/prettier",
    configSchemaUrl: "",
  };
}

function getLicenseText(): string {
  return "MIT License - Copyright 2020-2026 David Sherret";
}

let cachedExtensions: string[] | null = null;

async function getSupportedExtensions(): Promise<string[]> {
  if (cachedExtensions !== null) return cachedExtensions;
  const info = await getSupportInfo();
  const exts = new Set<string>();
  for (const lang of info.languages) {
    if (lang.extensions) {
      for (const ext of lang.extensions) {
        exts.add(ext.startsWith(".") ? ext.slice(1) : ext);
      }
    }
  }
  // add svelte
  exts.add("svelte");
  cachedExtensions = [...exts].sort();
  return cachedExtensions;
}

function resolveConfig(globalConfig: Record<string, unknown>, pluginConfig: Record<string, unknown>): ResolvedConfig {
  const prettierOptions: Record<string, unknown> = {};

  // map dprint global config to prettier
  if (globalConfig.lineWidth != null) prettierOptions.printWidth = globalConfig.lineWidth;
  if (globalConfig.indentWidth != null) prettierOptions.tabWidth = globalConfig.indentWidth;
  if (globalConfig.useTabs != null) prettierOptions.useTabs = globalConfig.useTabs;
  if (globalConfig.newLineKind != null) {
    const nlk = globalConfig.newLineKind as string;
    if (nlk === "lf") prettierOptions.endOfLine = "lf";
    else if (nlk === "crlf") prettierOptions.endOfLine = "crlf";
    else if (nlk === "auto") prettierOptions.endOfLine = "auto";
  }

  // copy prettier-specific options
  let jsDocPlugin = false;
  for (const [key, value] of Object.entries(pluginConfig)) {
    if (key === "plugin.jsDoc") {
      jsDocPlugin = value === true || value === "true";
    } else if (key === "permissions") {
      // skip - this is consumed by dprint CLI for deno permissions
    } else {
      prettierOptions[key] = value;
    }
  }

  return { prettierOptions, jsDocPlugin };
}

async function formatText(filePath: string, fileText: string, config: ResolvedConfig): Promise<string | null> {
  const plugins: unknown[] = [prettierPluginSvelte];
  if (config.jsDocPlugin) {
    plugins.push(prettierPluginJsdoc);
  }

  try {
    const result = await format(fileText, {
      filepath: filePath,
      plugins,
      ...config.prettierOptions,
    });
    if (result === fileText) return null;
    return result;
  } catch (err) {
    throw new Error(`Error formatting ${filePath}: ${err}`);
  }
}

// --- schema establishment ---

async function establishSchema(): Promise<void> {
  const request = await readU32();
  if (request !== 0) throw new Error(`Expected schema version request of 0, got ${request}`);
  await stdout.write(writeU32(0)); // success
  await stdout.write(writeU32(PLUGIN_SCHEMA_VERSION));
}

// --- parent process checker ---

function startParentProcessChecker(): void {
  const args = Deno.args;
  const pidIdx = args.indexOf("--parent-pid");
  if (pidIdx === -1 || pidIdx + 1 >= args.length) return;

  const parentPid = parseInt(args[pidIdx + 1], 10);
  if (isNaN(parentPid)) return;

  setInterval(() => {
    try {
      // Deno.kill with signal 0 checks if process exists without killing it
      Deno.kill(parentPid, "SIGCONT");
    } catch {
      // parent is gone, exit
      Deno.exit(0);
    }
  }, 2000);
}

// --- main message loop ---

async function main(): Promise<void> {
  startParentProcessChecker();
  await establishSchema();

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  while (true) {
    const messageId = await readU32();
    const messageKind = await readU32();

    try {
      switch (messageKind) {
        case CLOSE_ID: {
          await readSuccessBytes();
          await sendSuccess(nextMsgId++, messageId);
          Deno.exit(0);
          break;
        }
        case IS_ALIVE_ID: {
          await readSuccessBytes();
          await sendSuccess(nextMsgId++, messageId);
          break;
        }
        case GET_PLUGIN_INFO_ID: {
          await readSuccessBytes();
          const data = encoder.encode(JSON.stringify(getPluginInfo()));
          await sendDataResponse(nextMsgId++, messageId, data);
          break;
        }
        case GET_LICENSE_TEXT_ID: {
          await readSuccessBytes();
          const data = encoder.encode(getLicenseText());
          await sendDataResponse(nextMsgId++, messageId, data);
          break;
        }
        case REGISTER_CONFIG_ID: {
          const configId = await readU32();
          const globalConfigBytes = await readSizedBytes();
          const pluginConfigBytes = await readSizedBytes();
          await readSuccessBytes();

          const globalConfig = JSON.parse(decoder.decode(globalConfigBytes));
          const pluginConfig = JSON.parse(decoder.decode(pluginConfigBytes));
          const resolved = resolveConfig(globalConfig, pluginConfig);
          configs.set(configId, resolved);
          await sendSuccess(nextMsgId++, messageId);
          break;
        }
        case RELEASE_CONFIG_ID: {
          const configId = await readU32();
          await readSuccessBytes();
          configs.delete(configId);
          await sendSuccess(nextMsgId++, messageId);
          break;
        }
        case GET_CONFIG_DIAGNOSTICS_ID: {
          await readU32(); // configId
          await readSuccessBytes();
          await sendDataResponse(nextMsgId++, messageId, encoder.encode("[]"));
          break;
        }
        case GET_FILE_MATCHING_INFO_ID: {
          await readU32(); // configId
          await readSuccessBytes();
          const extensions = await getSupportedExtensions();
          const fileMatching = { fileExtensions: extensions, fileNames: [] };
          await sendDataResponse(nextMsgId++, messageId, encoder.encode(JSON.stringify(fileMatching)));
          break;
        }
        case GET_RESOLVED_CONFIG_ID: {
          const configId = await readU32();
          await readSuccessBytes();
          const config = configs.get(configId);
          const data = config ? JSON.stringify(config.prettierOptions) : "{}";
          await sendDataResponse(nextMsgId++, messageId, encoder.encode(data));
          break;
        }
        case FORMAT_ID: {
          const filePathBytes = await readSizedBytes();
          const _startByteIndex = await readU32();
          const _endByteIndex = await readU32();
          const configId = await readU32();
          const _overrideConfigBytes = await readSizedBytes();
          const fileTextBytes = await readSizedBytes();
          await readSuccessBytes();

          const filePath = decoder.decode(filePathBytes);
          const fileText = decoder.decode(fileTextBytes);
          const config = configs.get(configId);
          if (!config) {
            await sendError(nextMsgId++, messageId, `Config not found for id: ${configId}`);
            break;
          }

          const result = await formatText(filePath, fileText, config);
          if (result === null) {
            await sendFormatResponse(nextMsgId++, messageId, null);
          } else {
            await sendFormatResponse(nextMsgId++, messageId, encoder.encode(result));
          }
          break;
        }
        default: {
          // unknown message - read success bytes and ignore
          // (or it might be a message with extra data)
          console.error(`Unknown message kind: ${messageKind}`);
          Deno.exit(1);
        }
      }
    } catch (err) {
      try {
        await sendError(nextMsgId++, messageId, `${err}`);
      } catch {
        // if we can't send the error, exit
        Deno.exit(1);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
