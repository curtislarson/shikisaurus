import { Highlighter } from "../deps.ts";
import { SvgRendererService } from "../src/shiki.ts";
import { Hono } from "./deps.ts";
import { GithubPermalinkParser } from "./github-permalink-parser.ts";

export interface ShikisaurusServices {
  readonly highlighter: Highlighter;
  readonly svg: SvgRendererService;
  readonly githubParser: GithubPermalinkParser;
}

const RESPONSE_HEADERS = {
  "cache-control": "s-maxage=1, stale-while-revalidate",
  "content-type": "image/svg+xml",
};

function ignorePath(pathname: string) {
  return ["/", ""].includes(pathname) || (pathname.indexOf("github.com") === -1);
}

export function createShikisaurusApi({ svg, highlighter, githubParser }: ShikisaurusServices) {
  const app = new Hono();

  app.get("/favicon.ico", async (c) => {
    const icon = await Deno.readFile(new URL("../public/favicon.ico", import.meta.url));
    return c.body(icon);
  });

  app.get("/*", async (c) => {
    console.log("Request URL:", c.req.url);
    const { pathname, searchParams } = new URL(c.req.url);
    if (ignorePath(pathname)) {
      return c.status(404);
    }
    const codeUrl = decodeURIComponent(pathname.slice(1));

    const lang = searchParams.get("lang") ?? "ts";
    const theme = searchParams.get("theme") ?? "dracula";

    const parsed = await githubParser.processUrl(new URL(codeUrl));
    await highlighter.loadTheme(theme);
    const registeredTheme = highlighter.getTheme(theme);
    const tokens = highlighter.codeToThemedTokens(parsed.content, lang, theme);
    const body = svg.renderToSVG(tokens, { bg: registeredTheme.bg });

    return c.body(body, 200, RESPONSE_HEADERS);
  });

  app.showRoutes();

  return app;
}
