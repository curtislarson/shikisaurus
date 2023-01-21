import { GithubPermalinkParser } from "../api/mod.ts";
import { assert, assertEquals, assertExists, assertSnapshot } from "./test-deps.ts";

Deno.test("GithubPermalinkParser", async (t) => {
  const helper = await GithubPermalinkParser.init();

  await t.step("parseHash single line number", () => {
    const parsed = helper.parseLineNumbersHash(new URL("http://foo.local/#L1"));
    assertExists(parsed);
    assertEquals(parsed.start, 1);
    assertEquals(parsed.end, undefined);
  });

  await t.step("parseHash line number range", () => {
    const parsed = helper.parseLineNumbersHash(new URL("http://foo.local/#L2-L3"));
    assertExists(parsed);
    assertEquals(parsed.start, 2);
    assertEquals(parsed.end, 3);
  });

  await t.step("processUrl public repo blob entire file", async () => {
    const { content } = await helper.processUrl(
      new URL(
        "https://github.com/shikijs/shiki/blob/154db14d584c61bc86d5163f217d4609b662b5d6/packages/shiki/src/highlighter.ts",
      ),
    );

    assert(content.split("\n").length > 200, "Is a decently sized file so likely correct");
  });

  await t.step("processUrl public repo blob with line numbers", async () => {
    const { content } = await helper.processUrl(
      new URL(
        "https://github.com/shikijs/shiki/blob/154db14d584c61bc86d5163f217d4609b662b5d6/packages/shiki/src/highlighter.ts#L6-L11",
      ),
    );

    await assertSnapshot(t, content);
  });
});
