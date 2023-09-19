import * as fs from 'fs/promises';

const WASM_FILE_PATH = './my-wasm-module.wasm';

let wasmModulePromise: Promise<WebAssembly.WebAssemblyInstantiatedSource> | undefined;

export async function add(a: number, b: number) {
  wasmModulePromise ??= fs
    .readFile(WASM_FILE_PATH)
    .then((wasmBuffer) => WebAssembly.instantiate(wasmBuffer));

  const wasmModule = await wasmModulePromise;
  const addFunction = wasmModule.instance.exports.add as (a: number, b: number) => number;
  return addFunction(a, b);
}
