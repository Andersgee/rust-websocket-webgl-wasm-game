import init from "../wasm";

/**
 * init the wasm built with wasm-pack --target web
 *
 * notes:
 * - nextjs has issues with using the things produced by 'wasm-pack --target bundle' (which is the default)
 * - to alow read and write directly to wasm memory (which is just a resizable arraybuffer) we return it here
 *   the produced js by wasm-pack does not export the local variable 'wasm' since its undefined before calling init()
 * - creating typed arrays such as 'new Float32Array(memory.buffer)' does not allocate, it creates views.
 *   the benefit is ofc that we can read/write u8,f32 etc over the js/wasm boundary without copying/serializing etc.
 * - There is also a more low-level DataView, for multiple number types in the array.
 *   The regular Uint8Array, Float32Array etc are for when the array is of a single number type.
 */
export async function initWasm() {
  const wasm = await init();
  return wasm.memory;
}
