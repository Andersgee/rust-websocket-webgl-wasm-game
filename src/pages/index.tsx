//import { Inter } from "@next/font/google";
import { useEffect, useRef } from "react";
import { SEO } from "src/components/SEO";
import type { Game } from "../game/game";
import { initGame } from "../game/init";

//const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const isInited = useRef(false);
  const game = useRef<Game | null>(null);

  useEffect(() => {
    console.log("running effect");
    if (!isInited.current && canvasRef.current && divRef.current) {
      isInited.current = true;
      console.log("initing game");

      initGame(canvasRef.current, divRef.current)
        .then((g) => {
          game.current = g;
        })
        .catch(() => {
          console.log("failed to init game");
        });
    }
  }, []);

  return (
    <>
      <SEO
        title="Battle"
        description="Lowpoly multiplayer fighting game. Built with webgl, webassembly, websocket and rust."
        url="/"
        image="/images/share.png"
      />
      <canvas
        className="absolute -z-10 h-screen w-screen"
        ref={canvasRef}
        width={64 * 5}
        height={64 * 5}
      />
      <div className="">
        {/* 
        <button
          onClick={() => {
            console.log("a");
            //game.current?.greet()
          }}
        >
          click me
        </button>
         */}
      </div>
      <div className="text-red-500"></div>
      <div
        className="p-2 bg-neutral-200 w-20 text-black font-bold text-center"
        ref={divRef}
      ></div>
    </>
  );
}
