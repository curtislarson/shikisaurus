import type { Lang, Theme } from "../deps.ts";

export const DEFAULT_LANGS: Lang[] = [
  "typescript",
  "javascript",
  "html",
  "css",
  "java",
  "markdown",
  "python",
  "c",
  "c#",
  "go",
  "rust",
  "ruby",
  "sh",
];

export const DEFAULT_EXTENSION_TO_LANG_MAP: Record<string, Lang> = {
  ts: "typescript",
  js: "javascript",
  html: "html",
  sh: "sh",
};

export const DEFAULT_THEMES: Theme[] = ["dracula", "solarized-dark", "poimandres", "nord", "monokai"];
