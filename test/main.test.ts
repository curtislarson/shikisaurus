import { assert, assertSnapshot } from "./test-deps.ts";

Deno.test("main", { sanitizeExit: false, sanitizeOps: false, sanitizeResources: false }, async (t) => {
  await t.step("run and query urls", async (t) => {
    const res = new Deno.Command(new URL("../server.ts", import.meta.url).pathname, {
      stdout: "piped",
      stderr: "inherit",
    }).spawn();

    const chunk = new TextDecoder().decode((await res.stdout.getReader().read()).value);

    assert(chunk.startsWith("Now serving"));

    const val = await fetch("http://localhost:8000/shikisaurus", {
      method: "POST",
      body: JSON.stringify({ code: "console.log(\"hello world\");" }),
    }).then((r) => r.text());

    await assertSnapshot(t, val);

    const githubVal = await fetch(
      "http://localhost:8000/shikisaurus/github?url=https%3A%2F%2Fgithub.com%2Fquackware%2Fquackware%2Fblob%2Fmaster%2F.editorconfig%23L4-L5",
      {
        method: "GET",
      },
    ).then((r) => r.text());

    await assertSnapshot(t, githubVal);
  });
});
