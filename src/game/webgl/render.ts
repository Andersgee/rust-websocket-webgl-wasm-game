import { setProgram } from "src/webgl/program";
import { setTexture } from "src/webgl/texture";
import type { Webgl } from "./initWebgl";
import { mat4, vec3 } from "gl-matrix";
import { setUniforms } from "src/webgl/common";
import { draw } from "src/webgl/vao";
import { getJointTransform, mixKeyframes, interpolate_timing } from "./pose";
import { type Keyframe, animations } from "./models/Guy/armature";

export type Camera = {
  eye: vec3;
  target: vec3;
};

export type Renderable = {
  vao: keyof Webgl["lowpolyriggedShader"]["vaos"];
  uniforms?: Partial<Webgl["lowpolyriggedShader"]["uniforms"]>;
  model_mat: mat4;
  animTargetId: keyof typeof animations;
  elapsed_ms_since_inputchange: number;
  keyframe_when_inputchange: Keyframe;
  keyframe: Keyframe;
};

export type DebugRenderable = {
  vao: keyof Webgl["lowpolyriggedShader"]["vaos"];
  model_mat: mat4;
  keyframe: Keyframe;
};

export type StaticRenderable = {
  vao: keyof Webgl["lowpolyShader"]["vaos"];
  model_mat: mat4;
};

const UP = vec3.fromValues(0, 1, 0);

export function renderWorld(
  webgl: Webgl,
  camera: Camera,
  renderables: Renderable[],
  staticRenderables: StaticRenderable[],
  debugRenderables: DebugRenderable[] = []
) {
  const { gl, lowpolyriggedShader, lowpolyShader, canvasShader } = webgl;

  //camera uniforms
  mat4.lookAt(
    lowpolyriggedShader.uniforms.viewMat,
    camera.eye,
    camera.target,
    UP
  );
  mat4.lookAt(lowpolyShader.uniforms.viewMat, camera.eye, camera.target, UP);
  lowpolyriggedShader.uniforms.eye = camera.eye;
  lowpolyriggedShader.uniforms.focus = camera.target;
  lowpolyShader.uniforms.eye = camera.eye;
  lowpolyShader.uniforms.focus = camera.target;

  //1. lowpoly
  lowpolyriggedShader.bindFramebuffer();

  setProgram(gl, lowpolyriggedShader.program.program);
  setTexture(
    gl,
    lowpolyriggedShader.textures.palette,
    lowpolyriggedShader.uniforms.palette
  );

  for (const renderable of renderables) {
    //uniforms from server

    lowpolyriggedShader.uniforms.isTakingDmg = renderable.uniforms?.isTakingDmg
      ? true
      : false;

    lowpolyriggedShader.uniforms.modelMat =
      renderable.model_mat.slice() as mat4;

    const animation = animations[renderable.animTargetId];
    const shouldLoop =
      renderable.animTargetId === "Walk" || renderable.animTargetId === "Idle";

    const [keyframeIndexA, keyframeIndexB, t] = interpolate_timing(
      animation.timings,
      renderable.elapsed_ms_since_inputchange,
      shouldLoop
    );

    const targetKeyframe = mixKeyframes(
      animation.keyframes[keyframeIndexA],
      animation.keyframes[keyframeIndexB],
      t
    );

    //how long to take to interpolate between completely different animations
    const CHANGE_ANIM_MS = 250;
    const t_animchange = Math.min(
      renderable.elapsed_ms_since_inputchange / CHANGE_ANIM_MS,
      1
    );

    //the animation will spend CHANGE_ANIM_MS milliseconds to sync up with proper frame of animTarget
    renderable.keyframe = mixKeyframes(
      renderable.keyframe_when_inputchange,
      targetKeyframe,
      t_animchange
    );

    lowpolyriggedShader.uniforms.jointTransform = getJointTransform(
      renderable.keyframe
    );

    setUniforms(
      gl,
      lowpolyriggedShader.program.programUniforms,
      lowpolyriggedShader.uniforms
    );
    draw(gl, lowpolyriggedShader.vaos[renderable.vao]);
  }

  //for pose playground. dont use any animation
  for (const renderable of debugRenderables) {
    lowpolyriggedShader.uniforms.modelMat =
      renderable.model_mat.slice() as mat4;

    lowpolyriggedShader.uniforms.jointTransform = getJointTransform(
      renderable.keyframe
    );

    setUniforms(
      gl,
      lowpolyriggedShader.program.programUniforms,
      lowpolyriggedShader.uniforms
    );
    draw(gl, lowpolyriggedShader.vaos[renderable.vao]);
  }

  //also draw static with lowpolyShader (but keep lowpolyriggedShader framebuffer active)
  setProgram(gl, lowpolyShader.program.program);
  setTexture(
    gl,
    lowpolyShader.textures.palette,
    lowpolyShader.uniforms.palette
  );
  for (const renderable of staticRenderables) {
    lowpolyShader.uniforms.modelMat = renderable.model_mat.slice() as mat4;
    setUniforms(
      gl,
      lowpolyShader.program.programUniforms,
      lowpolyShader.uniforms
    );
    draw(gl, lowpolyShader.vaos[renderable.vao]);
  }

  lowpolyriggedShader.blit(); //copy rendered stuff to texture colorAttachments

  //2. canvas
  canvasShader.bindFramebuffer();
  setProgram(gl, canvasShader.program.program);

  //set lowpolyriggedShader output as input textures
  setTexture(
    gl,
    lowpolyriggedShader.fb.secondary.colorAttachments[0],
    canvasShader.uniforms.lowpoly_texture
  );
  setTexture(
    gl,
    lowpolyriggedShader.fb.secondary.colorAttachments[1],
    canvasShader.uniforms.lowpoly_glowtexture
  );
  setTexture(
    gl,
    lowpolyriggedShader.fb.secondary.depthAttachment,
    canvasShader.uniforms.lowpoly_depthtexture
  );
  setUniforms(gl, canvasShader.program.programUniforms, canvasShader.uniforms);
  draw(gl, canvasShader.vaos.twotriangles);
}

export function startRequestAnimationFrameLoop(
  render: (elapsed_ms_since_last_render: number) => void
) {
  let prevTimestamp: number | undefined = undefined;
  let elapsed_ms_since_last_render = 0;

  const renderloop = (timestamp: number) => {
    if (!prevTimestamp) {
      prevTimestamp = timestamp;
    }

    elapsed_ms_since_last_render = timestamp - prevTimestamp;
    if (prevTimestamp !== timestamp) {
      render(elapsed_ms_since_last_render);
    }
    prevTimestamp = timestamp;
    window.requestAnimationFrame(renderloop);
  };

  window.requestAnimationFrame(renderloop);
}

export function resizeFramebuffers(webgl: Webgl) {
  const FIELD_OF_VIEW_Y_RAD = (45 * Math.PI) / 180;
  const UP = vec3.fromValues(0, 1, 0);

  console.log("resizeFramebuffers");
  const dpr = window.devicePixelRatio;
  const { width, height } = webgl.canvas.getBoundingClientRect();
  const widthPixels = Math.round(width * dpr);
  const heightPixels = Math.round(height * dpr);
  if (
    webgl.canvas.width === widthPixels &&
    webgl.canvas.height === heightPixels
  ) {
    return; //no need to resize anything
  }
  webgl.canvas.width = widthPixels;
  webgl.canvas.height = heightPixels;
  webgl.lowpolyriggedShader.resize(widthPixels, heightPixels);
  webgl.lowpolyShader.resize(widthPixels, heightPixels);
  webgl.canvasShader.resize(widthPixels, heightPixels);

  //also, update relevant uniforms
  mat4.perspectiveNO(
    webgl.lowpolyriggedShader.uniforms.projMat,
    FIELD_OF_VIEW_Y_RAD,
    webgl.canvas.width / webgl.canvas.height,
    0.1,
    1000
  );
  mat4.perspectiveNO(
    webgl.lowpolyShader.uniforms.projMat,
    FIELD_OF_VIEW_Y_RAD,
    webgl.canvas.width / webgl.canvas.height,
    0.1,
    1000
  );
  webgl.canvasShader.uniforms.canvas_size = [
    webgl.canvas.width,
    webgl.canvas.height,
  ];
}
