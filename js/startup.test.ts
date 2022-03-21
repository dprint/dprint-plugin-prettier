import { assertEquals } from "https://deno.land/std@0.130.0/testing/asserts.ts";
import "./startup.js";

Deno.test("should format typescript", () => {
  assertEquals((globalThis as any).dprint.formatText("test.ts", "const t   = {   }", 1, {}), "const t = {};\n");
});
