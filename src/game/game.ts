import * as wasm from "../wasm";
import type { Universe } from "../wasm/wasm_game_of_life";
import { initWebgl, type Webgl } from "./webgl/initWebgl";
import {
  type Camera,
  renderWorld,
  startRequestAnimationFrameLoop,
} from "./webgl/render";
import type { StaticRenderable, Renderable } from "./webgl/render";
import { mat4, vec3 } from "gl-matrix";
import { animations } from "./webgl/models/Guy/armature";
import { connectWebsocket, type ServerPlayers } from "./utils";

const WS_URL = "ws://localhost:8080/ws";
//const WS_URL = "wss://api.andyfx.se/rustwebsocketgame/ws";

export class Game {
  universe: Universe;
  wasmMemory: WebAssembly.Memory;
  div: HTMLDivElement;
  ws: WebSocket;
  webgl: Webgl;
  camera: Camera;
  renderables: Record<string, Renderable>;
  staticRenderables: StaticRenderable[];
  myPlayerId: string | undefined;
  serverPlayers: ServerPlayers;

  constructor(
    wasmMemory: WebAssembly.Memory,
    canvas: HTMLCanvasElement,
    div: HTMLDivElement
  ) {
    this.wasmMemory = wasmMemory;
    this.div = div;
    this.universe = new wasm.Universe();
    this.camera = {
      eye: vec3.fromValues(1.9, 2.7, 3.25),
      target: vec3.fromValues(0, 1, 0),
    };

    this.serverPlayers = {};
    this.renderables = {};
    this.staticRenderables = [{ vao: "Floor", model_mat: mat4.create() }];

    this.webgl = initWebgl(canvas);
    startRequestAnimationFrameLoop((elapsed) => this.render(elapsed));

    this.ws = connectWebsocket(
      WS_URL,
      (s) => this.onMessage(s),
      (s) => this.onMetaMessage(s),
      (s) => this.onChatMessage(s)
    );

    console.log("inited class Game");
  }

  onMessage(str: string) {
    //console.log("onMessage", str);
    try {
      this.serverPlayers = JSON.parse(str);
    } catch (error) {
      console.log("catch JSON.parse");
    }

    //first of all, delete any units that dont exist on server
    for (let playerId in this.renderables) {
      if (this.serverPlayers[playerId] === undefined) {
        delete this.renderables[playerId];
      }
    }

    for (let playerId in this.serverPlayers) {
      const player = this.serverPlayers[playerId];

      if (this.renderables[playerId] !== undefined) {
        //update specific things
        this.renderables[playerId].vao = player.renderable.vao;
        this.renderables[playerId].model_mat = player.renderable.model_mat;
        if (this.renderables[playerId].animTargetId !== player.anim_target_id) {
          //changed animation
          this.renderables[playerId].animTargetId = player.anim_target_id;
          this.renderables[playerId].elapsed_ms_since_inputchange = 0;
          this.renderables[playerId].keyframe_when_inputchange = {
            pos: this.renderables[playerId].keyframe.pos.slice() as vec3,
            quats: this.renderables[playerId].keyframe.quats.slice(),
          };
        }
      } else {
        //create (by adding a new key/value)
        const animation = animations[player.anim_target_id];
        this.renderables[playerId] = {
          vao: player.renderable.vao,
          model_mat: player.renderable.model_mat,
          animTargetId: player.anim_target_id,
          elapsed_ms_since_inputchange: 0,
          keyframe: animation.keyframes[0],
          keyframe_when_inputchange: animation.keyframes[0],
        };
      }

      this.renderables[playerId].uniforms = {
        isTakingDmg: player.attributes.is_taking_dmg,
      };
    }

    //also static, and projectiles
    this.staticRenderables = [{ vao: "Floor", model_mat: mat4.create() }];
    for (let playerId in this.serverPlayers) {
      const player = this.serverPlayers[playerId];
      if (player.projectile) {
        this.staticRenderables.push({
          vao: "Unitcube", //player.projectile.renderable.vao,
          model_mat: player.projectile.renderable.model_mat,
        });
      }
    }

    //update UI
    if (this.myPlayerId && this.serverPlayers[this.myPlayerId] !== undefined) {
      const myHealth = this.serverPlayers[this.myPlayerId].attributes.health;
      this.div.innerHTML = `HP: ${myHealth}`;
      if (myHealth <= 50) {
        this.div.classList.add("text-red-500");
        this.div.classList.remove("text-black");
      } else {
        this.div.classList.remove("text-red-500");
        this.div.classList.add("text-black");
      }
    }
  }

  onMetaMessage(str: string) {
    console.log("onMetaMessage", str);
    const [, type, msg] = str.split(" ");
    if (type === "player_id") {
      this.myPlayerId = msg;
      console.log("this.playerId:", this.myPlayerId);
    }
  }
  onChatMessage(str: string) {
    const [, fromId, ...text] = str.split(" ");
    console.log(`onChatMessage fromId:${fromId}, text:${text.join(" ")}`);
  }

  render(elapsed_ms_since_last_render: number) {
    for (let k in this.renderables) {
      this.renderables[k].elapsed_ms_since_inputchange +=
        elapsed_ms_since_last_render;

      if (k in this.serverPlayers && k === this.myPlayerId) {
        const target = vec3.lerp(
          vec3.create(),
          this.camera.target,
          this.serverPlayers[k].transform.pos,
          0.1
        );

        const eye = vec3.lerp(
          vec3.create(),
          this.camera.eye,
          vec3.add(
            vec3.create(),
            this.serverPlayers[k].transform.pos,
            vec3.fromValues(0, 6, 7)
          ),
          0.05
        );
        this.camera = {
          target,
          eye,
        };
      }
    }

    renderWorld(
      this.webgl,
      this.camera,
      Object.values(this.renderables),
      this.staticRenderables
    );
  }
}
