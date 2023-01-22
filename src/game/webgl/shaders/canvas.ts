import glsl from "./canvas.glsl";
import { Atype, Utype, type ProgramLayout } from "src/webgl/common";
import { createProgram } from "src/webgl/program";
import { createVao } from "src/webgl/vao";
import model_twotriangles from "../models/twotriangles.json";

/*
utilities for using this shader, edit layout: ProgramLayout according to match .glsl
*/

const layout: ProgramLayout = {
  attributes: new Map([
    ["position", Atype.vec2],
    ["uv", Atype.vec2],
  ]),
  uniforms: new Map([
    ["lowpoly_texture", Utype.sampler2D],
    ["lowpoly_depthtexture", Utype.sampler2D],
    ["lowpoly_glowtexture", Utype.sampler2D],
    ["canvas_size", Utype.vec2],
  ]),
} as const;

/////////////////////////////

export function setupCanvasShader(gl: WebGL2RenderingContext) {
  const fb = createFramebuffer(gl, 100, 100);
  const program = createProgram(gl, layout, glsl);
  const vaos = {
    twotriangles: createVao(gl, program.programAttributes, model_twotriangles),
  };

  const uniforms = {
    lowpoly_texture: 0, //texture index
    lowpoly_depthtexture: 1, //texture index
    lowpoly_glowtexture: 2, //texture index
    canvas_size: [100, 100],
  };

  const resize = (width: number, height: number) =>
    resizeFramebuffer(gl, fb, width, height);

  const bindFramebuffer = () => setFramebuffer(gl, fb);

  return { fb, program, vaos, uniforms, resize, bindFramebuffer };
}

/////////////////////////////

function createFramebuffer(
  gl: WebGL2RenderingContext,
  width: number,
  height: number
) {
  const fb = {
    width,
    height,
    framebuffer: null, // gl.bindFramebuffer(gl.FRAMEBUFFER, null); means canvas
    drawbuffers: [gl.BACK],
  };
  return fb;
}

type Framebuffer_canvas = ReturnType<typeof createFramebuffer>;

function resizeFramebuffer(
  gl: WebGL2RenderingContext,
  fb: Framebuffer_canvas,
  width: number,
  height: number
) {
  fb.width = width;
  fb.height = height;
}

function setFramebuffer(gl: WebGL2RenderingContext, fb: Framebuffer_canvas) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb.framebuffer);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, fb.width, fb.height);
  gl.drawBuffers(fb.drawbuffers);
}
