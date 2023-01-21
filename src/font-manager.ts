import { createCanvas } from "../deps.ts";

export const FIRA_CODE_FONT_URL = "https://fonts.googleapis.com/css2?family=Fira+Code&display=swap";
export const HACK_FONT_URL = "https://cdn.jsdelivr.net/npm/hack-font@3/build/web/hack.css";

export enum FontStyle {
  NotSet = -1,
  None = 0,
  Italic = 1,
  Bold = 2,
  Underline = 4,
}

export const FONT_URL_MAP = {
  "Fira Code": FIRA_CODE_FONT_URL,
  "Hack": HACK_FONT_URL,
} as const;
export type FontNames = keyof typeof FONT_URL_MAP;

export interface FontMeasurerOptions {
  lazyLoadFonts?: Map<FontNames, Promise<ArrayBuffer>>;
}

export class FontManager {
  protected readonly lazyFonts;
  protected readonly loadedFontCache: Map<FontNames, ArrayBuffer>;
  protected readonly measurementCache = new Map<
    { fontName: FontNames; fontSize: number },
    { width: number; height: number }
  >();

  constructor() {
    this.lazyFonts = new Map(
      [
        ["Fira Code", () => this.#fetchFont(FIRA_CODE_FONT_URL)],
        ["Hack", () => this.#fetchFont(HACK_FONT_URL)],
      ] as const,
    );
    this.loadedFontCache = new Map();
  }

  async measureFont(fontName: FontNames, fontSize: number) {
    if (this.measurementCache.has({ fontName, fontSize })) {
      return this.measurementCache.get({ fontName, fontSize })!;
    }
    const fontLoad = await this.loadFont(fontName);

    /**
     * Measure `M` for width
     */
    const c = createCanvas(200, 200);
    c.loadFont(fontLoad, {});
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = c.getContext("2d")!;
    ctx.font = `${fontSize}px "${fontName}"`;

    const capMMeasurement = ctx.measureText("M");

    /**
     * Measure A-Z, a-z for height
     * A - 65
     * Z - 90
     * a - 97
     * z - 122
     */
    const characters = [];
    for (let i = 65; i <= 90; i++) {
      characters.push(String.fromCharCode(i));
    }
    for (let i = 97; i <= 122; i++) {
      characters.push(String.fromCharCode(i));
    }

    let highestAscent = 0;
    let lowestDescent = 0;
    characters.forEach((c) => {
      const m = ctx.measureText(c);
      if (m.actualBoundingBoxAscent > highestAscent) {
        highestAscent = m.actualBoundingBoxAscent;
      }
      if (m.actualBoundingBoxDescent > lowestDescent) {
        lowestDescent = m.actualBoundingBoxDescent;
      }
    });

    const measurement = {
      width: capMMeasurement.width,
      height: highestAscent + lowestDescent,
    };
    this.measurementCache.set({ fontName, fontSize }, measurement);
    return measurement;
  }

  addFont<T extends string>(name: string, cssUrl: string) {
    this.lazyFonts.set(name as FontNames, () => this.#fetchFont(cssUrl));
    return this;
  }

  async loadFont(name: FontNames) {
    const loaded = this.loadedFontCache.get(name);
    if (loaded != null) {
      return loaded;
    }
    const lazy = this.lazyFonts.get(name);
    if (lazy == null) {
      throw new Error(`Font not found, did you add it via add()?`);
    }

    return await lazy().then((buff) => {
      this.loadedFontCache.set(name, buff);
      this.lazyFonts.delete(name);
      return buff;
    });
  }

  #fetchFont(url: string) {
    return fetch(url).then((resp) => resp.arrayBuffer());
  }
}
