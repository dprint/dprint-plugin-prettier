import { assertEquals } from "https://deno.land/std@0.130.0/testing/asserts.ts";
// running cargo build will generate this file
import "./startup.js";

const { formatText } = (globalThis as any).dprint;

Deno.test("should format typescript", () => {
  assertEquals(
    formatText(
      {
        filePath: "test.ts",
        fileText: "const t   = {   }",
      },
      1,
      {},
    ),
    "const t = {};\n",
  );
});

Deno.test("should format svelte", () => {
  assertEquals(
    formatText(
      {
        filePath: "app.svelte",
        fileText: `<script>
  let files;
</script>

<input type="file" bind:files>

{#if files && files[0]}
    <p>
    {files[0].name}
      </p>
{/if}`,
      },
      1,
      {},
    ),
    `<script>
  let files;
</script>

<input type="file" bind:files />

{#if files && files[0]}
  <p>
    {files[0].name}
  </p>
{/if}
`,
  );
});
