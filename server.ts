#!/usr/bin/env -S deno run -A --unstable --no-check --no-config

import { createShikisaurusApi, GithubPermalinkParser, serve } from "./api/mod.ts";
import { Shiki } from "./mod.ts";

const shiki = await Shiki.init();
const highlighter = await shiki.getDefaultHighlighter();
const svg = await shiki.getSvgRenderer({ fontFamily: "Hack", bgVerticalCharPadding: 1 });
const githubParser = await GithubPermalinkParser.init();
const app = createShikisaurusApi({ svg, highlighter, githubParser });

serve(app.fetch, {
  onListen(params) {
    console.log(`Now serving on ${params.hostname}:${params.port}`);
  },
  onError(error) {
    console.error("Error", error);
    return Response.error();
  },
});
