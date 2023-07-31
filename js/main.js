import * as console from "ext:deno_console/01_console.js";
import * as url from "ext:deno_url/00_url.js";
import * as urlPattern from "ext:deno_url/01_urlpattern.js";

globalThis.URL = url.URL;
globalThis.URLPattern = urlPattern.URLPattern;
globalThis.URLSearchParams = urlPattern.URLSearchParams;
const core = globalThis.Deno.core;
// always print to stderr because we use stdout for communication
globalThis.console = new console.Console((msg, _level) => core.print(msg, true));
