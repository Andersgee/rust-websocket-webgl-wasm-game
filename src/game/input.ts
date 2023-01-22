import type { Game } from "./game";

type Cmd =
  | "step_forward"
  | "step_backward"
  | "step_left"
  | "step_right"
  | "facing_rad"
  | "kick"
  | "punch"
  | "run";

type Keybinding = Exclude<Cmd, "facing_rad">;

export const KEYBINDINGS: Record<Keybinding, string> = {
  step_forward: "KeyW",
  step_backward: "KeyS",
  step_left: "KeyA",
  step_right: "KeyD",
  kick: "KeyK",
  punch: "KeyP",
  run: "KeyL",
};

let player_input: Record<Cmd, boolean | number> = {
  step_forward: false,
  step_backward: false,
  step_left: false,
  step_right: false,
  kick: false,
  punch: false,
  run: false,
  facing_rad: (Math.PI / 180) * 10,
};

function bindingFromKeycode(k: string) {
  const binding = Object.entries(KEYBINDINGS).find(([cmd, code]) => code === k);
  return binding as [Cmd, string] | undefined;
}

export function setupInputHandler(canvas: HTMLCanvasElement, game: Game) {
  window.addEventListener("keydown", (e) => {
    //console.log("keydown event", c);
    const binding = bindingFromKeycode(e.code);
    if (!binding) return;

    e.preventDefault();
    if (player_input[binding[0]] === false) {
      player_input[binding[0]] = true;
      game.ws.send(JSON.stringify(player_input));
    }

    //for debug just to show that something that starts with 'chat ' is sent to lobby instead of game
    /*
    if (e.code === "KeyM") {
      e.preventDefault();
      console.log("sending 'chat this is a chat message'");
      game.ws.send("chat this is a chat message");
    }
    */
  });

  window.addEventListener("keyup", (e) => {
    const binding = bindingFromKeycode(e.code);
    if (!binding) return;

    e.preventDefault();
    if (player_input[binding[0]] === true) {
      player_input[binding[0]] = false;
      game.ws.send(JSON.stringify(player_input));
    }
  });
}
