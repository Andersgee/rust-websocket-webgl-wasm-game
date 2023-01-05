//import { Inter } from "@next/font/google";
import { useEffect, useRef } from "react";
import { Game } from "../game";
import { initGame } from "../game/init";

//const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fpsRef = useRef<HTMLDivElement>(null);
  const isInited = useRef(false);
  const game = useRef<Game | null>(null);

  useEffect(() => {
    console.log("running effect");
    if (!isInited.current && canvasRef.current && fpsRef.current) {
      isInited.current = true;
      console.log("initing wasm");

      initGame()
        .then((memory) => {
          game.current = new Game(canvasRef.current!, fpsRef.current!, memory);
        })
        .catch(() => {
          console.log("failed to init wasm");
        });
    }
  }, []);

  return (
    <div className="">
      <main>
        <button onClick={() => game.current?.greet()}>click me</button>
        <div ref={fpsRef}></div>
        <canvas ref={canvasRef} width={64 * 5} height={64 * 5} />
      </main>
    </div>
  );
}
