import { draw } from "src/webgl/vao";
//import * as wasm from "../wasm";
//import type { Universe } from "../wasm/wasm_game_of_life";
import { initWebgl, type Webgl } from "./webgl/initWebgl";
import { setProgram } from "src/webgl/program";
import { setTexture } from "src/webgl/texture";
import { setUniforms } from "src/webgl/common";
import { Camera, DebugRenderable, renderWorld } from "./webgl/render";
import type { StaticRenderable, Renderable } from "./webgl/render";
import { quat, mat4, vec3 } from "gl-matrix";

const FIELD_OF_VIEW_Y_DEG = 45;

const FIELD_OF_VIEW_Y_RAD = (45 * Math.PI) / 180;
const UP = vec3.fromValues(0, 1, 0);

/** center and range of motion */
const JOINT_ROM = [
  { label: "Lowerback (Root)", c: [0, 0, 0], r: [180, 180, 180] },
  { label: "Midback", c: [0, 0, 0], r: [60, 35, 35] }, //Spine1
  { label: "Upperback", c: [0, 0, 0], r: [60, 35, 35] }, //Spine2
  { label: "Neck", c: [0, 0, 0], r: [30, 30, 30] },
  { label: "Head", c: [0, 0, 0], r: [30, 30, 30] },
  { label: "Clavicle_L", c: [0, 0, 0], r: [5, 5, -5] }, //Shoulder_L
  { label: "Shoulder_L", c: [30, 0, 0], r: [57, 86, 0] }, //UpperArm_L
  { label: "Elbow_L", c: [75, 0, 0], r: [80, 0, 0] }, //LowerArm_L
  { label: "Hand_L", c: [0, 30, 0], r: [10, 75, 20] },
  { label: "Clavicle_R", c: [0, 0, 0], r: [5, -5, 5] }, //Shoulder_R
  { label: "Shoulder_R", c: [30, 0, 0], r: [57, -86, 0] }, //UpperArm_R
  { label: "Elbow_R", c: [75, 0, 0], r: [80, 0, 0] }, //LowerArm_R
  { label: "Hand_R", c: [0, -30, 0], r: [10, -75, -20] },
  { label: "Hip_L", c: [40, 40, 0], r: [90, 45, 0] }, //UpperLeg_L
  { label: "Knee_L", c: [-67.5, 0, 0], r: [-72.5, 0, 0] }, //LowerLeg_L
  { label: "Foot_L", c: [-22, 0, 0], r: [45, 15, 15] },
  { label: "Hip_R", c: [40, -40, 0], r: [90, -45, 0] }, //UpperLeg_R
  { label: "Knee_R", c: [-67.5, 0, 0], r: [-72.5, 0, 0] }, //LowerLeg_R
  { label: "Foot_R", c: [-22, 0, 0], r: [45, -15, -15] },
];

export class Poseplayground {
  fpsElement: HTMLDivElement;
  webgl: Webgl;
  renderables: DebugRenderable[];
  staticRenderables: StaticRenderable[];
  remappedSliderVals: number[][];
  camera: Camera;
  modelPos: vec3;
  posePos: vec3;
  poseQuats: quat[];

  constructor(canvas: HTMLCanvasElement, fpsElement: HTMLDivElement) {
    //this.eye = vec3.fromValues(1.9, 2.7, 3.25);
    this.camera = {
      eye: vec3.fromValues(3, 2, 1),
      target: vec3.fromValues(0, 1, 0),
    };
    this.modelPos = vec3.fromValues(0, 0, 0);
    this.posePos = vec3.fromValues(0, 0, 0);

    this.renderables = [
      {
        vao: "Guy",
        model_mat: mat4.create(),
        keyframe: {
          pos: vec3.fromValues(0, 0, 0),
          quats: [],
        },
      },
      {
        vao: "Guy",
        model_mat: mat4.fromTranslation(
          mat4.create(),
          vec3.fromValues(0, 0, 0)
        ),
        keyframe: {
          pos: vec3.fromValues(2, 0, 0),
          quats: [],
        },
      },
      {
        vao: "Guy",
        model_mat: mat4.fromTranslation(
          mat4.create(),
          vec3.fromValues(0, 0, 0)
        ),
        keyframe: {
          pos: vec3.fromValues(2, 0, 0),
          quats: [],
        },
      },
    ];
    this.staticRenderables = [{ vao: "Floor", model_mat: mat4.create() }];
    console.log("init js class");
    this.remappedSliderVals = Array.from({ length: 19 }).map((_, i) =>
      JOINT_ROM[i].c.slice()
    );

    this.poseQuats = this.remappedSliderVals.map((val) =>
      quat.fromEuler(quat.create(), val[0], val[1], val[2])
    );

    this.fpsElement = fpsElement;
    this.webgl = initWebgl(canvas);
    this.render();
  }

  getPoseQuats() {
    return this.poseQuats;
  }

  getPosePos() {
    return this.posePos;
  }

  onSlider(boneIndex: number, i: number, val: number) {
    //console.log({ boneIndex, i, val });
    const c = JOINT_ROM[boneIndex].c[i];
    const r = JOINT_ROM[boneIndex].r[i];

    this.remappedSliderVals[boneIndex][i] = c + val * r;
    this.poseQuats = this.remappedSliderVals.map((val) =>
      quat.fromEuler(quat.create(), val[0], val[1], val[2])
    );

    //console.log(this.sliderVals[boneIndex][i]);
    this.render();
  }
  onKeyframeLoad(posePos: number[], sliderVals: number[][]) {
    this.posePos = vec3.fromValues(posePos[0], posePos[1], posePos[2]);
    sliderVals.forEach((vals, boneIndex) => {
      for (let i = 0; i < 3; i++) {
        const val = vals[i];
        const c = JOINT_ROM[boneIndex].c[i];
        const r = JOINT_ROM[boneIndex].r[i];
        this.remappedSliderVals[boneIndex][i] = c + val * r;
      }
    });
    this.poseQuats = this.remappedSliderVals.map((val) =>
      quat.fromEuler(quat.create(), val[0], val[1], val[2])
    );
    this.render();
  }

  onPoseMove(i: number, val: number) {
    this.posePos[i] = val;
    this.render();
  }

  onEyeMove(i: number, val: number) {
    //console.log({ boneIndex, i, val });
    this.camera.eye[i] = val * 5;
    //console.log(this.eye);
    this.render();
  }
  onModelMove(i: number, val: number) {
    this.modelPos[i] = val;
    //console.log("this.modelPos:", this.modelPos);
    this.render();
  }

  render() {
    //Apply slider values
    for (const renderable of this.renderables) {
      renderable.keyframe.quats = this.poseQuats;
      renderable.keyframe.pos = this.posePos;
    }

    {
      const renderable = this.renderables[0];
      const q = quat.fromEuler(quat.create(), 0, 0, 0);
      const p = vec3.fromValues(0, 0, -1);
      mat4.fromRotationTranslation(
        renderable.model_mat,
        q,
        vec3.add(vec3.create(), p, this.modelPos)
      );
    }
    {
      const renderable = this.renderables[1];
      const q = quat.fromEuler(quat.create(), 0, 180, 0);
      const p = vec3.fromValues(0, 0, 1);
      mat4.fromRotationTranslation(
        renderable.model_mat,
        q,
        vec3.add(vec3.create(), p, this.modelPos)
      );
    }

    {
      const renderable = this.renderables[2];
      const q = quat.fromEuler(quat.create(), 0, 90, 0);
      const p = vec3.fromValues(-1.5, 0, 0);
      mat4.fromRotationTranslation(
        renderable.model_mat,
        q,
        vec3.add(vec3.create(), p, this.modelPos)
      );
    }

    renderWorld(
      this.webgl,
      this.camera,
      [],
      this.staticRenderables,
      this.renderables
    );
  }
}
