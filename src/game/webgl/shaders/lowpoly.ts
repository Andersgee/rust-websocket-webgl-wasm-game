import glsl from "./lowpoly.glsl";
import { Atype, Utype, type ProgramLayout } from "src/webgl/common";
import {
  blitAttachmentData,
  create_fb,
  create_rb_color,
  resize_rb_color,
  create_rb_depth,
  resize_rb_depth,
  create_texture_color,
  resize_texture_color,
  create_texture_depth,
  resize_texture_depth,
} from "src/webgl/framebuffer";
import { createProgram } from "src/webgl/program";
import { createVao } from "src/webgl/vao";
import { createTexture } from "src/webgl/texture";
import { mat4, vec3 } from "gl-matrix";

import model_floorround from "../models/floor.json";
import model_floor from "../models/floortiles_attr.json";
import model_unitcube from "../models/unitcube_attr.json";

/*
utilities for using this shader, edit layout: ProgramLayout according to match .glsl
*/

const PALETTE_IMG_SRC = "/palette.png"; //in public dir

const layout: ProgramLayout = {
  attributes: new Map([
    ["position", Atype.vec3],
    ["normal", Atype.vec3],
    ["uv", Atype.vec2],
  ]),
  uniforms: new Map([
    ["projMat", Utype.mat4],
    ["viewMat", Utype.mat4],
    ["modelMat", Utype.mat4],
    ["palette", Utype.sampler2D],
    ["eye", Utype.vec3],
  ]),
} as const;

/////////////////////////////

export function setupLowpolyShader(gl: WebGL2RenderingContext) {
  const fb = createFramebuffer(gl, 100, 100);
  const program = createProgram(gl, layout, glsl);

  const vaos = {
    Floor: createVao(gl, program.programAttributes, model_floor),
    RoundFloor: createVao(gl, program.programAttributes, model_floorround),
    Unitcube: createVao(gl, program.programAttributes, model_unitcube),
  };

  const bindFramebuffer = () => setFramebuffer(gl, fb);

  const resize = (width: number, height: number) =>
    resizeFramebuffer(gl, fb, width, height);

  const blit = () => resolveTexture(gl, fb);

  const uniforms = {
    projMat: mat4.create(),
    viewMat: mat4.create(),
    modelMat: mat4.create(),
    palette: 0, //texture index
    eye: vec3.fromValues(0, 3, 5),
    focus: vec3.fromValues(0, 0, 0),
  };

  const textures = {
    palette: createTexture(gl, PALETTE_IMG_SRC, uniforms.palette),
  };

  return {
    fb,
    program,
    vaos,
    uniforms,
    resize,
    bindFramebuffer,
    blit,
    textures,
  };
}

/////////////////////////////

function createFramebuffer(
  gl: WebGL2RenderingContext,
  width: number,
  height: number
) {
  const primary = create_fb(gl);
  const depthbuffer = create_rb_depth(gl, width, height);
  const colorbuffer = create_rb_color(gl, 0, width, height);
  const colorbuffer2 = create_rb_color(gl, 1, width, height);
  gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);

  const secondary = create_fb(gl);
  const depthtexture = create_texture_depth(gl, width, height);
  const texture = create_texture_color(gl, 0, width, height);
  const texture2 = create_texture_color(gl, 1, width, height);
  gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);

  const fb = {
    width,
    height,
    primary: {
      framebuffer: primary,
      colorAttachments: [colorbuffer, colorbuffer2],
      depthAttachment: depthbuffer,
      drawbuffers: [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1],
    },
    secondary: {
      framebuffer: secondary,
      colorAttachments: [texture, texture2],
      depthAttachment: depthtexture,
      drawbuffers: [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1],
    },
  };

  return fb;
}

type Framebuffers_lowpoly = ReturnType<typeof createFramebuffer>;

function resizeFramebuffer(
  gl: WebGL2RenderingContext,
  fb: Framebuffers_lowpoly,
  width: number,
  height: number
) {
  fb.width = width;
  fb.height = height;

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb.primary.framebuffer);
  const depthbuffer = fb.primary.depthAttachment;
  const colorbuffer = fb.primary.colorAttachments[0];
  const colorbuffer2 = fb.primary.colorAttachments[1];
  resize_rb_depth(gl, depthbuffer, width, height);
  resize_rb_color(gl, colorbuffer, width, height);
  resize_rb_color(gl, colorbuffer2, width, height);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fb.secondary.framebuffer);
  const depthtexture = fb.secondary.depthAttachment;
  const texture = fb.secondary.colorAttachments[0];
  const texture2 = fb.secondary.colorAttachments[1];
  resize_texture_depth(gl, depthtexture, width, height);
  resize_texture_color(gl, texture, width, height);
  resize_texture_color(gl, texture2, width, height);
}

/**
 * blit WebGLRenderbuffer attachments to WebGLTexture attachments
 *
 * Find the textures here:
 * - fb.secondary.colorAttachments[0]
 * - fb.secondary.colorAttachments[1]
 */
function resolveTexture(gl: WebGL2RenderingContext, fb: Framebuffers_lowpoly) {
  blitAttachmentData(
    gl,
    fb.primary.framebuffer,
    0,
    fb.secondary.framebuffer,
    0,
    fb.width,
    fb.height
  );
  blitAttachmentData(
    gl,
    fb.primary.framebuffer,
    1,
    fb.secondary.framebuffer,
    1,
    fb.width,
    fb.height
  );
}

function setFramebuffer(gl: WebGL2RenderingContext, fb: Framebuffers_lowpoly) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb.primary.framebuffer);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, fb.width, fb.height);
  gl.drawBuffers(fb.primary.drawbuffers);
}
