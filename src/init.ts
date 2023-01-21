import { setWasm } from "../deps.ts";

export async function init() {
  const wasm = await Deno.readFile(new URL("./onig.wasm", import.meta.url));
  setWasm(wasm.buffer);
}
