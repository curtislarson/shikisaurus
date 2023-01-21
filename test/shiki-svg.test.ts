import { Shiki } from "../mod.ts";
import { assert, assertSnapshot } from "./test-deps.ts";

Deno.test("shiki-svg", async (t) => {
  await t.step("render svg", async () => {
    const shiki = await Shiki.init();

    const [highlighter, renderer] = await Promise.all([
      shiki.getDefaultHighlighter(),
      shiki.getSvgRenderer({ fontFamily: "Hack" }),
    ]);

    const svg = renderer.renderToSVG(
      highlighter.codeToThemedTokens("const foo: string = \"bar\"", "typescript"),
    );

    assert(svg != "");

    await assertSnapshot(t, svg);
  });
});
