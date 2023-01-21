import { getHighlighter, Highlighter, Lang, renderToHtml } from "../deps.ts";
import { DEFAULT_LANGS, DEFAULT_THEMES } from "./defaults.ts";
import { FontManager } from "./font-manager.ts";
import { init as initWasm } from "./init.ts";
import { SvgRenderer } from "./svg.ts";

export type SvgRendererService = Awaited<ReturnType<typeof Shiki["prototype"]["getSvgRenderer"]>>;

export interface ShikiOptions {
  /** See {@link DEFAULT_LANGS } for defaults */
  defaultLangs?: Lang[];
  /** See {@link DEFAULT_THEMES } for defaults */
  defaultThemes?: string[];
}

export class Shiki {
  static #instance: Shiki;

  static async init(): Promise<Shiki> {
    if (Shiki.#instance != null) {
      return Shiki.#instance;
    } else {
      return await initWasm().then(() => {
        Shiki.#instance = new Shiki();
        return Shiki.#instance;
      });
    }
  }

  protected svg;
  protected font;

  readonly getSvgRenderer;
  readonly addFont;
  readonly getHighlighter;
  readonly renderToHtml;

  #defaultHighlighter: Promise<Highlighter> | Highlighter;

  private constructor(options: ShikiOptions = {}) {
    this.font = new FontManager();
    this.svg = new SvgRenderer({ fonts: this.font });

    this.addFont = this.font.addFont.bind(this.font);
    this.getSvgRenderer = this.svg.getRenderer.bind(this.svg);
    this.getHighlighter = getHighlighter.bind(this);
    this.renderToHtml = renderToHtml.bind(this);

    this.#defaultHighlighter = this.getHighlighter({
      langs: options.defaultLangs ?? DEFAULT_LANGS,
      themes: options.defaultThemes ?? DEFAULT_THEMES,
    });
  }

  getDefaultHighlighter() {
    if ("then" in this.#defaultHighlighter) {
      return this.#defaultHighlighter.then((val) => {
        this.#defaultHighlighter = val;
        return val;
      });
    } else {
      return this.#defaultHighlighter;
    }
  }
}

export const init = Shiki.init;
