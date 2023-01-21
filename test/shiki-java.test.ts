import { Shiki } from "../mod.ts";
import { assert, assertSnapshot } from "./test-deps.ts";

Deno.test("shiki-java", async (t) => {
  await t.step("defaultHighlighter", async () => {
    const shiki = await Shiki.init();
    const def = await shiki.getDefaultHighlighter();

    const code = await Deno.readTextFile(
      new URL("./__fixtures__/java-file.java", import.meta.url),
    );

    assert(def != null);

    const html = def.codeToHtml(code, { lang: "java" });
    await assertSnapshot(t, html);

    const svgRend = await shiki.getSvgRenderer({ fontFamily: "Fira Code" });

    const tokens = def.codeToThemedTokens(code, "java", "dracula");
    const svg = svgRend.renderToSVG(tokens);

    await assertSnapshot(t, svg);
  });
});
