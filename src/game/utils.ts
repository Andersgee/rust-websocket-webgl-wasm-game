import { mat4, quat, vec3 } from "gl-matrix";

export function debounce(callback: () => void, ms = 50) {
  let timeoutId: NodeJS.Timeout;
  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(callback, ms);
  };
}

export function addDebouncedResizeListener(callback: () => void, ms = 50) {
  window.addEventListener("resize", debounce(callback, ms));
}

/**
 * more or less wrapper for `new WebSocket(url)`
 */
export function connectWebsocket(
  url: string,
  onMessage: (str: string) => void,
  onMetaMessage: (str: string) => void,
  onChatMessage?: (str: string) => void
) {
  const ws = new WebSocket(url);
  ws.binaryType = "arraybuffer"; //use ArrayBuffer for binary data instead of "blob".

  ws.onopen = () => {
    console.log("ws onopen");
    //console.log("ws sending string");
    ws.send("/chat this is a chat message");

    /*
    console.log("ws sending ArrayBuffer");
    const u8arr = new Float32Array([0, 1, 2, 3.9]);
    ws.send(u8arr.buffer);
    */
  };

  ws.onclose = () => console.log("ws onclose");
  ws.onerror = () => console.log("ws onerror");
  ws.onmessage = (e) => {
    if (typeof e.data === "string") {
      if (e.data.startsWith("meta ")) {
        onMetaMessage(e.data);
      } else if (e.data.startsWith("chat ")) {
        onChatMessage?.(e.data);
      } else {
        onMessage(e.data);
      }
    } else if (e.data instanceof ArrayBuffer) {
      //const f32arr = new Float32Array(ev.data)
      //const u8arr = new Float32Array(ev.data)
      console.log("ws recieved ArrayBuffer");
    } else {
      console.log("ws recieved unkown type (probably blob)");
    }
  };
  return ws;
}

export type ServerPlayers = Record<
  string,
  {
    attributes: { move_speed: number; health: number; is_taking_dmg: boolean };
    anim_target_id: "Idle" | "Walk" | "Kick" | "Punch";
    transform: {
      pos: vec3;
      quat: quat;
    };
    renderable: {
      vao: "Guy";
      model_mat: mat4;
    };
    player_input: {
      //id: number; //ignore this
      step_forward: boolean;
      step_backward: boolean;
      step_left: boolean;
      step_right: boolean;
      kick: boolean;
      punch: boolean;
      facing_rad: number;
    };
    projectile?: {
      ticks: number;
      ticks_lifetime: number;
      transform: {
        pos: vec3;
        quat: quat;
      };
      renderable: {
        vao: "Guy";
        model_mat: mat4;
      };
    };
  }
>;

const onMessage = {
  "10763414037239483504": {
    attributes: { move_speed: 0.05 },
    transform: {
      pos: [0.0, 0.0, 0.0],
      quat: [0.0, -0.08715574, 0.0, 0.9961947],
    },
    renderable: {
      vao: "Guy",
      model_mat: [
        0.9848077, 0.0, 0.17364816, 0.0, -0.0, 1.0, 0.0, 0.0, -0.17364816, -0.0,
        0.9848077, 0.0, 0.0, 0.0, 0.0, 1.0,
      ],
    },
    player_input: {
      id: 10763414037239483504,
      step_forward: false,
      step_backward: false,
      step_left: false,
      step_right: false,
      kick: false,
      punch: true,
      facing_rad: 0.17453292,
    },
    anim_target_id: "Idle",
  },
};
