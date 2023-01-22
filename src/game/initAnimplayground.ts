import { Animplayground } from "./animplayground";
import { setupInputHandler } from "./inputAnimplayground";

export async function initAnimplayground(
  canvas: HTMLCanvasElement,
  debugDiv: HTMLDivElement
) {
  const game = new Animplayground(canvas, debugDiv);
  setupInputHandler(canvas, game);

  return game;
}
