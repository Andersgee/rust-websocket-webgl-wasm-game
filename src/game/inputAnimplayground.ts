import type { Animplayground } from "./animplayground";

type Cmd =
  | "step_forward"
  | "step_backward"
  | "step_left"
  | "step_right"
  | "facing_rad"
  | "kick"
  | "punch";

type Keybinding = Exclude<Cmd, "facing_rad">;

export const KEYBINDINGS: Record<Keybinding, string> = {
  step_forward: "KeyW",
  step_backward: "KeyS",
  step_left: "KeyA",
  step_right: "KeyD",
  kick: "KeyK",
  punch: "KeyP",
};

export type PlayerInput = Record<Cmd, boolean | number>;

let player_input: PlayerInput = {
  step_forward: false,
  step_backward: false,
  step_left: false,
  step_right: false,
  kick: false,
  punch: false,
  facing_rad: (Math.PI / 180) * 10,
};

function bindingFromKeycode(k: string) {
  const binding = Object.entries(KEYBINDINGS).find(([cmd, code]) => code === k);
  return binding as [Cmd, string] | undefined;
}

export function setupInputHandler(
  canvas: HTMLCanvasElement,
  game: Animplayground
) {
  window.addEventListener("keydown", (e) => {
    //console.log("keydown event", c);
    const binding = bindingFromKeycode(e.code);
    if (!binding) return;

    e.preventDefault();
    if (player_input[binding[0]] === false) {
      player_input[binding[0]] = true;
      //game.ws.send(JSON.stringify(player_input));
      game.onPlayerInput(player_input);
    }
  });

  window.addEventListener("keyup", (e) => {
    const binding = bindingFromKeycode(e.code);
    if (!binding) return;

    e.preventDefault();
    if (player_input[binding[0]] === true) {
      player_input[binding[0]] = false;
      //game.ws.send(JSON.stringify(player_input));
      game.onPlayerInput(player_input);
    }
  });
}

/** return Renderable and StaticRenderable */
function localServerResponse(player_input: PlayerInput) {}
