import { createWebgl2Context } from "src/webgl/context";
import { addDebouncedResizeListener } from "../utils";
import { resizeFramebuffers } from "./render";
import { setupCanvasShader } from "./shaders/canvas";
import { setupLowpolyShader } from "./shaders/lowpoly";
import { setupLowpolyriggedShader } from "./shaders/lowpolyrigged";

export type Webgl = ReturnType<typeof initWebgl>;

export function initWebgl(canvas: HTMLCanvasElement) {
  const gl = createWebgl2Context(canvas);
  const canvasShader = setupCanvasShader(gl);
  const lowpolyShader = setupLowpolyShader(gl);
  const lowpolyriggedShader = setupLowpolyriggedShader(gl);

  const webgl = {
    gl,
    canvasShader,
    lowpolyShader,
    lowpolyriggedShader,
    canvas,
  };

  resizeFramebuffers(webgl);
  addDebouncedResizeListener(() => resizeFramebuffers(webgl));

  return webgl;
}
