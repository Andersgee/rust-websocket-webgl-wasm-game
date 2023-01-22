//import { Inter } from "@next/font/google";
import { useEffect, useRef } from "react";
import type { Animplayground } from "../game/animplayground";
import { initAnimplayground } from "../game/initAnimplayground";

//const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fpsRef = useRef<HTMLDivElement>(null);
  const isInited = useRef(false);
  const game = useRef<Animplayground | null>(null);

  useEffect(() => {
    console.log("running effect");
    if (!isInited.current && canvasRef.current && fpsRef.current) {
      isInited.current = true;
      console.log("initing game");

      initAnimplayground(canvasRef.current, fpsRef.current)
        .then((g) => {
          game.current = g;
        })
        .catch(() => {
          console.log("failed to init animplayground");
        });
    }
  }, []);

  return (
    <>
      <canvas
        className="absolute -z-10 h-screen w-screen"
        ref={canvasRef}
        width={64 * 5}
        height={64 * 5}
      />
      <div className="">
        <h1 className="text-orange-300">tw</h1>
        <button
          onClick={() => {
            console.log("a");
            //game.current?.greet()
          }}
        >
          click me
        </button>
        <div ref={fpsRef}></div>
      </div>
    </>
  );
}
