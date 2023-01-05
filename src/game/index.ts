import * as wasm from "../wasm";
//import { memory } from "../wasm/wasm_game_of_life_bg.wasm";
//import {init,} from 'wasm-game-of-life';

import type { Universe } from "../wasm/wasm_game_of_life";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#00F000";

export class Game {
  memory: WebAssembly.Memory;
  universe: Universe;
  ctx: CanvasRenderingContext2D;
  fpsElement: HTMLDivElement;
  frames: number[];
  lastFrameTimeStamp: number;

  constructor(
    canvas: HTMLCanvasElement,
    fpsElement: HTMLDivElement,
    memory: WebAssembly.Memory
  ) {
    console.log("init js class");
    this.memory = memory;
    this.fpsElement = fpsElement;
    this.frames = [];

    const ctx = canvas.getContext("2d");
    if (!ctx) throw "could not getContext on canvas";
    this.ctx = ctx;
    this.universe = new wasm.Universe();

    const url = "wss://echo.websocket.events";
    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer"; //Use ArrayBuffer for binary data instead of "blob".
    ws.onopen = () => {
      console.log("ws onopen");

      console.log("ws sending string");
      ws.send("ping");

      console.log("ws sending ArrayBuffer");
      const u8arr = new Float32Array([0, 1, 2, 3.9]);
      ws.send(u8arr.buffer);
    };

    ws.onclose = () => console.log("ws onclos");
    ws.onerror = () => console.log("ws onerror");
    ws.onmessage = (ev) => {
      if (ev.data instanceof ArrayBuffer) {
        console.log(
          "ws recieved ArrayBuffer, Uint8Array",
          new Float32Array(ev.data)
        );
        this.universe.onmessage_f32array(new Float32Array(ev.data));
      } else if (typeof ev.data === "string") {
        console.log("ws recieved string: ", ev.data);
        this.universe.onmessage_string(ev.data);
      } else {
        console.log("ws recieved unkown type (probably blob?)");
        console.log(ev.data);
      }
    };

    this.lastFrameTimeStamp = performance.now();

    let animId: number | null = null;
    const renderLoop = (animId: number) => {
      this.renderStats();

      this.universe.tick();
      this.render();
      animId = requestAnimationFrame(renderLoop);
    };

    requestAnimationFrame(renderLoop);

    canvas.addEventListener("click", (event) => {
      const width = this.universe.width;
      const height = this.universe.height;

      const boundingRect = canvas.getBoundingClientRect();

      const scaleX = canvas.width / boundingRect.width;
      const scaleY = canvas.height / boundingRect.height;

      const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
      const canvasTop = (event.clientY - boundingRect.top) * scaleY;

      const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
      const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);

      console.log({ row, col });

      this.universe.toggle_cell(row, col);
    });
  }

  greet() {
    wasm.greet("render called");
  }

  renderStats() {
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = (1 / delta) * 1000;

    // Save only the latest 100 timings.
    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    // Find the max, min, and mean of our 100 latest timings.
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (let i = 0; i < this.frames.length; i++) {
      sum += this.frames[i];
      min = Math.min(this.frames[i], min);
      max = Math.max(this.frames[i], max);
    }
    let mean = sum / this.frames.length;

    // Render the statistics.
    this.fpsElement.textContent = `
Frames per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
  }

  render() {
    const width = this.universe.width;
    const height = this.universe.height;
    const cellsPtr = this.universe.cells_ptr();
    //console.log({ cellsPtr });
    const cells = new Uint8Array(this.memory.buffer, cellsPtr, width * height);

    //console.log({ width, height });
    const getIndex = (row: number, column: number) => {
      return row * width + column;
    };

    // draw grid lines
    this.ctx.beginPath();
    this.ctx.strokeStyle = GRID_COLOR;
    for (let i = 0; i <= width; i++) {
      //vertical
      this.ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
      this.ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }
    for (let j = 0; j <= height; j++) {
      //horizontal
      this.ctx.moveTo(0, j * (CELL_SIZE + 1) + 1);
      this.ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }
    this.ctx.stroke();

    // draw cells
    this.ctx.beginPath();
    // Alive cells.
    this.ctx.fillStyle = ALIVE_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);
        if (cells[idx] !== wasm.Cell.Alive) {
          continue;
        }

        this.ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }

    // Dead cells.
    this.ctx.fillStyle = DEAD_COLOR;
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);
        if (cells[idx] !== wasm.Cell.Dead) {
          continue;
        }

        this.ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    }

    this.ctx.stroke();
  }
}
