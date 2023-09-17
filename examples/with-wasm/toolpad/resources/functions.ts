import * as fs from 'fs';

const wasmBuffer = fs.readFileSync('./my-wasm-module.wasm');
let wasmModulePromise: Promise<WebAssembly.WebAssemblyInstantiatedSource> | undefined;

export async function add(a: number, b: number) {
  wasmModulePromise ??= WebAssembly.instantiate(wasmBuffer);
  const wasmModule = await wasmModulePromise;
  const addFunction = wasmModule.instance.exports.add as (a: number, b: number) => number;
  return addFunction(a, b);
}
