//import * as wasm from "../wasm";
//import type { Universe } from "../wasm/wasm_game_of_life";
import { initWebgl, type Webgl } from "./webgl/initWebgl";
import {
  type Camera,
  renderWorld,
  startRequestAnimationFrameLoop,
} from "./webgl/render";
import type { StaticRenderable, Renderable } from "./webgl/render";
import { quat, mat4, vec3 } from "gl-matrix";
import { animations } from "./webgl/models/Guy/armature";
import { PlayerInput } from "./inputAnimplayground";

export class Animplayground {
  fpsElement: HTMLDivElement;
  webgl: Webgl;
  camera: Camera;
  renderables: Renderable[];
  staticRenderables: StaticRenderable[];

  constructor(canvas: HTMLCanvasElement, fpsElement: HTMLDivElement) {
    this.camera = {
      eye: vec3.fromValues(1.9, 2.7, 3.25),
      target: vec3.fromValues(0, 1, 0),
    };

    this.renderables = [
      {
        vao: "Guy",
        model_mat: mat4.create(),
        keyframe: animations.Idle.keyframes[0],
        keyframe_when_inputchange: animations.Idle.keyframes[0],
        animTargetId: "Idle",
        elapsed_ms_since_inputchange: 0,
      },
      {
        vao: "Guy",
        model_mat: mat4.fromTranslation(
          mat4.create(),
          vec3.fromValues(1, 0, 0)
        ),
        keyframe: animations.Kick.keyframes[1],
        keyframe_when_inputchange: animations.Idle.keyframes[0],
        animTargetId: "Idle",
        elapsed_ms_since_inputchange: 0,
      },
    ];
    this.staticRenderables = [{ vao: "Floor", model_mat: mat4.create() }];
    console.log("init js class");

    this.fpsElement = fpsElement;

    this.webgl = initWebgl(canvas);
    startRequestAnimationFrameLoop((elapsed) => this.render(elapsed));
  }

  onPlayerInput(player_input: PlayerInput) {
    const myguy = this.renderables[0];
    myguy.keyframe_when_inputchange = {
      quats: myguy.keyframe.quats.slice(),
      pos: myguy.keyframe.pos.slice() as vec3,
    };

    console.log("onPlayerInput");
    if (player_input.kick) {
      myguy.animTargetId = "Kick";
      myguy.elapsed_ms_since_inputchange = 0;
    } else if (player_input.punch) {
      myguy.animTargetId = "Punch";
      myguy.elapsed_ms_since_inputchange = 0;
    } else if (player_input.step_forward) {
      myguy.model_mat = mat4.translate(
        myguy.model_mat,
        myguy.model_mat,
        [0, 0, -0.1]
      );
    } else if (player_input.step_backward) {
      myguy.model_mat = mat4.translate(
        myguy.model_mat,
        myguy.model_mat,
        [0, 0, 0.1]
      );
    } else if (player_input.step_left) {
      myguy.model_mat = mat4.translate(
        myguy.model_mat,
        myguy.model_mat,
        [-0.1, 0, 0]
      );
    } else if (player_input.step_right) {
      myguy.model_mat = mat4.translate(
        myguy.model_mat,
        myguy.model_mat,
        [0.1, 0, 0]
      );
    } else {
      myguy.animTargetId = "Idle";
      myguy.elapsed_ms_since_inputchange = 0;
    }
  }

  render(elapsed_ms_since_last_render: number) {
    for (const renderable of this.renderables) {
      renderable.elapsed_ms_since_inputchange += elapsed_ms_since_last_render;
    }
    /*
    //DEBUG: apply renderable values here
    const q = quat.fromEuler(quat.create(), 0, 0, 0);
    const p = vec3.fromValues(0, 0, -1);
    mat4.fromRotationTranslation(
      this.renderables[0].model_mat,
      q,
      vec3.add(vec3.create(), p, this.modelPos)
    );
    */

    renderWorld(
      this.webgl,
      this.camera,
      this.renderables,
      this.staticRenderables
    );
  }
}
