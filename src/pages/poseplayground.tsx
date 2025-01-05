import { useCallback, useEffect, useRef, useState } from "react";
import { Slider, SliderUncontrolled } from "src/components/Slider";
import { Poseplayground } from "src/game/poseplayground";
import { animations } from "src/game/webgl/models/Guy/armature";

type Saved = {
  sliderVals: number[][];
  posePos: number[];
};

//const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fpsRef = useRef<HTMLDivElement>(null);
  const isInited = useRef(false);
  const ppg = useRef<Poseplayground | null>(null);

  const [sliderVals, setSliderVals] = useState<number[][]>(
    Array.from({ length: 19 }).map((_) => [0, 0, 0])
  );
  const [posePos, setPosePos] = useState<number[]>([0, 0, 0]);

  const [saved, setSaved] = useState<Saved[]>([]);

  const onPosePos = (i: number, val: number) => {
    setPosePos((prev) => {
      const p = prev.slice();
      p[i] = val;
      return p;
    });
  };

  const resetSliderVals = () => {
    setSliderVals(Array.from({ length: 19 }).map((_) => [0, 0, 0]));
    setPosePos([0, 0, 0]);
  };

  const flipLeftRight = () => {
    //const LEFT =  [5, 6, 7, 8, 13, 14, 15];
    //const RIGHT = [9, 10, 11, 12, 16, 17, 18];

    //0,1,2,3,4 is "center" body part so flip z (rotation) on those instead

    const newSlidervals = [
      [sliderVals[0][0], sliderVals[0][1], -sliderVals[0][2]],
      [sliderVals[1][0], sliderVals[1][1], -sliderVals[1][2]],
      [sliderVals[2][0], sliderVals[2][1], -sliderVals[2][2]],
      [sliderVals[3][0], sliderVals[3][1], -sliderVals[3][2]],
      [sliderVals[4][0], sliderVals[4][1], -sliderVals[4][2]],
      //sliderVals[0],
      //sliderVals[1],
      //sliderVals[2],
      //sliderVals[3],
      //sliderVals[4],

      sliderVals[9],
      sliderVals[10],
      sliderVals[11],
      sliderVals[12],
      sliderVals[5],
      sliderVals[6],
      sliderVals[7],
      sliderVals[8],
      sliderVals[16],
      sliderVals[17],
      sliderVals[18],
      sliderVals[13],
      sliderVals[14],
      sliderVals[15],
    ];

    ppg.current?.onKeyframeLoad(posePos, newSlidervals);
    setSliderVals(newSlidervals);
  };

  const onSlider = (boneIndex: number, i: number, val: number) => {
    setSliderVals((prev) =>
      prev.map((vals, ind) => {
        if (ind === boneIndex) {
          const newVals = vals.slice();
          newVals[i] = val;
          return newVals;
        } else {
          return vals;
        }
      })
    );
  };

  const handleSave = () => {
    setSaved((prev) => [...prev, { sliderVals, posePos }]);
  };
  const handleDelete = (i: number) => () => {
    setSaved((prev) => prev.filter((_, ind) => ind !== i));
  };

  const handleLoad = (i: number) => () => {
    setSliderVals(saved[i].sliderVals);
    setPosePos(saved[i].posePos);
    //ppg.current?.onKeyframeLoad(saved[i].posePos, saved[i].sliderVals);
  };

  const handleLoadExistingWalk = (i: number) => () => {
    const existingSliderVals = animations.Walk.keyframes[i].sliderVals;
    const existingPos = animations.Walk.keyframes[i].pos as number[];
    if (!existingSliderVals) return;

    setSliderVals(existingSliderVals);
    setPosePos(existingPos);
    //ppg.current?.onKeyframeLoad(existingPos, existingSliderVals);
  };
  const handleLoadExistingIdle = (i: number) => () => {
    const existingSliderVals = animations.Idle.keyframes[i].sliderVals;
    const existingPos = animations.Idle.keyframes[i].pos as number[];
    if (!existingSliderVals) return;

    setSliderVals(existingSliderVals);
    setPosePos(existingPos);
    //ppg.current?.onKeyframeLoad(existingPos, existingSliderVals);
  };

  const handleLog = useCallback(() => {
    if (!ppg.current) return;
    const quats = ppg.current.getPoseQuats();
    const pos = ppg.current.getPosePos();
    const keyframedatastring = JSON.stringify({
      quats: quats.map((quat) => Array.from(quat)),
      pos: Array.from(pos),
      sliderVals,
    });
    console.log(keyframedatastring);
    window.navigator.clipboard.writeText(JSON.stringify(keyframedatastring));
    console.log("copied the above to clipboard");
  }, [sliderVals]);

  useEffect(() => {
    if (!isInited.current && canvasRef.current && fpsRef.current) {
      isInited.current = true;
      console.log("initing game");

      ppg.current = new Poseplayground(canvasRef.current, fpsRef.current);
    }
    const onkeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === "KeyC") {
        handleLog();
      }
    };
    window.addEventListener("keydown", onkeydown);
    return () => window.removeEventListener("keydown", onkeydown);
  }, [handleLog]);

  useEffect(() => {
    const i = setTimeout(() => {
      ppg.current?.render();
    }, 500);

    return () => clearTimeout(i);
  }, []);

  useEffect(() => {
    ppg.current?.onKeyframeLoad(posePos, sliderVals);
  }, [posePos, sliderVals]);

  return (
    <>
      <canvas
        className="absolute -z-10 h-screen w-screen"
        ref={canvasRef}
        width={64 * 5}
        height={64 * 5}
      />
      <div>
        <button className="p-2 bg-orange-600 m-1" onClick={resetSliderVals}>
          zero
        </button>
        <div>
          <button
            className="p-2 bg-orange-600 m-1"
            onClick={handleLoadExistingIdle(0)}
          >
            Idle_breatheout
          </button>
          <button
            className="p-2 bg-orange-600 m-1"
            onClick={handleLoadExistingIdle(1)}
          >
            Idle_breathein
          </button>
        </div>
        <div>
          <button
            className="p-2 bg-orange-600 m-1"
            onClick={handleLoadExistingWalk(0)}
          >
            pass_L
          </button>
          <button
            className="p-2 bg-orange-600 m-1"
            onClick={handleLoadExistingWalk(1)}
          >
            peak_L
          </button>
          <button
            className="p-2 bg-orange-600 m-1"
            onClick={handleLoadExistingWalk(2)}
          >
            contact_L
          </button>
          <button
            className="p-2 bg-orange-600 m-1"
            onClick={handleLoadExistingWalk(3)}
          >
            down_L
          </button>
          <button
            className="p-2 bg-orange-600 m-1"
            onClick={handleLoadExistingWalk(4)}
          >
            pass_R
          </button>
          <button
            className="p-2 bg-orange-600 m-1"
            onClick={handleLoadExistingWalk(5)}
          >
            peak_R
          </button>
          <button
            className="p-2 bg-orange-600 m-1"
            onClick={handleLoadExistingWalk(6)}
          >
            contact_R
          </button>
          <button
            className="p-2 bg-orange-600 m-1"
            onClick={handleLoadExistingWalk(7)}
          >
            down_R
          </button>
        </div>

        <table className="bg-white opacity-50 mb-4">
          <tbody>
            <tr className="text-black">
              <td className="w-36"></td>
              <td className="w-60">move (x)</td>
              <td className="w-60">move (y)</td>
              <td className="w-60">move (z)</td>
            </tr>
            <tr className="text-black">
              <td className="w-36">Eye</td>
              <td className="w-60">
                <SliderUncontrolled
                  onChange={(val) => ppg.current?.onEyeMove(0, val)}
                />
              </td>
              <td className="w-60">
                <SliderUncontrolled
                  onChange={(val) => ppg.current?.onEyeMove(1, val)}
                />
              </td>
              <td className="w-60">
                <SliderUncontrolled
                  onChange={(val) => ppg.current?.onEyeMove(2, val)}
                />
              </td>
            </tr>

            <tr className="text-black">
              <td className="w-36">Model</td>
              <td className="w-60">
                <SliderUncontrolled
                  onChange={(val) => ppg.current?.onModelMove(0, val)}
                />
              </td>
              <td className="w-60">
                <SliderUncontrolled
                  onChange={(val) => ppg.current?.onModelMove(1, val)}
                />
              </td>
              <td className="w-60">
                <SliderUncontrolled
                  onChange={(val) => ppg.current?.onModelMove(2, val)}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex">
          <button className="p-1 border-2" onClick={flipLeftRight}>
            FLIP L/R
          </button>
          <div>KEYFRAMES</div>

          <button className="ml-1 p-1 border-2" onClick={handleLog}>
            LOG/COPY
          </button>
          {saved.map((_, i) => (
            <div key={i} className="flex flex-col">
              <button className="ml-1 p-1 border-2 w-7" onClick={handleLoad(i)}>
                {`${i}`}
              </button>
              <button
                className="ml-1 p-1 border-2 w-7"
                onClick={handleDelete(i)}
              >
                x
              </button>
            </div>
          ))}
          <button className="ml-1 p-1 border-2" onClick={handleSave}>
            SAVE
          </button>
        </div>
        <table className="bg-white opacity-50">
          <tbody>
            <tr className="text-black">
              <td className="w-36">0 Lowerback (Root)</td>
              <td className="w-60">
                <Slider
                  value={posePos[0]}
                  onChange={(val) => {
                    onPosePos(0, val);
                    ppg.current?.onPoseMove(0, val);
                  }}
                />
              </td>
              <td className="w-60">
                <Slider
                  value={posePos[1]}
                  onChange={(val) => {
                    onPosePos(1, val);
                    ppg.current?.onPoseMove(1, val);
                  }}
                />
              </td>
              <td className="w-60">
                <Slider
                  value={posePos[2]}
                  onChange={(val) => {
                    onPosePos(2, val);
                    ppg.current?.onPoseMove(2, val);
                  }}
                />
              </td>
            </tr>

            <tr className="text-black">
              <td className="w-36">joint</td>
              <td className="w-60">flex (x)</td>
              <td className="w-60">bend (y)</td>
              <td className="w-60">rotate (z)</td>
            </tr>
            {joints.map((joint, i) => (
              <tr key={joint.label}>
                <td className="text-black w-36">{`${i} ${joint.label}`}</td>
                <td className="w-60">
                  {joint.x && (
                    <Slider
                      value={sliderVals[i][0]}
                      onChange={(val) => {
                        onSlider(i, 0, val);
                        ppg.current?.onSlider(i, 0, val);
                      }}
                    />
                  )}
                </td>
                <td className="w-60">
                  {joint.y && (
                    <Slider
                      value={sliderVals[i][1]}
                      onChange={(val) => {
                        onSlider(i, 1, val);
                        ppg.current?.onSlider(i, 1, val);
                      }}
                    />
                  )}
                </td>
                <td className="w-60">
                  {joint.z && (
                    <Slider
                      value={sliderVals[i][2]}
                      onChange={(val) => {
                        onSlider(i, 2, val);
                        ppg.current?.onSlider(i, 2, val);
                      }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div ref={fpsRef}></div>
      </div>
    </>
  );
}

const joints = [
  { label: "Lowerback (Root)", x: true, y: true, z: true },
  { label: "Midback", x: true, y: true, z: true }, //Spine1
  { label: "Upperback", x: true, y: true, z: true }, //Spine2
  { label: "Neck", x: true, y: true, z: true },
  { label: "Head", x: true, y: true, z: true },
  { label: "Clavicle_L", x: true, y: true, z: true }, //Shoulder_L, 5
  { label: "Shoulder_L", x: true, y: true, z: false }, //UpperArm_L, 6
  { label: "Elbow_L", x: true, y: false, z: false }, //LowerArm_L, 7
  { label: "Hand_L", x: true, y: true, z: true }, // 8
  { label: "Clavicle_R", x: true, y: true, z: true }, //Shoulder_R
  { label: "Shoulder_R", x: true, y: true, z: false }, //UpperArm_R
  { label: "Elbow_R", x: true, y: false, z: false }, //LowerArm_R
  { label: "Hand_R", x: true, y: true, z: true },
  { label: "Hip_L", x: true, y: true, z: false }, //UpperLeg_L
  { label: "Knee_L", x: true, y: false, z: false }, //LowerLeg_L
  { label: "Foot_L", x: true, y: true, z: true },
  { label: "Hip_R", x: true, y: true, z: false }, //UpperLeg_R
  { label: "Knee_R", x: true, y: false, z: false }, //LowerLeg_R
  { label: "Foot_R", x: true, y: true, z: true },
];
/*
0 (Root) - has parent -1 ()
1 (Spine1) - has parent 0 (Root)
2 (Spine2) - has parent 1 (Spine1)
3 (Neck) - has parent 2 (Spine2)
4 (Head) - has parent 3 (Neck)
5 (Shoulder_L) - has parent 2 (Spine2)
6 (UpperArm_L) - has parent 5 (Shoulder_L)
7 (LowerArm_L) - has parent 6 (UpperArm_L)
8 (Hand_L) - has parent 7 (LowerArm_L)
9 (Shoulder_R) - has parent 2 (Spine2)
10 (UpperArm_R) - has parent 9 (Shoulder_R)
11 (LowerArm_R) - has parent 10 (UpperArm_R)
12 (Hand_R) - has parent 11 (LowerArm_R)
13 (UpperLeg_L) - has parent 0 (Root)
14 (LowerLeg_L) - has parent 13 (UpperLeg_L)
15 (Foot_L) - has parent 14 (LowerLeg_L)
16 (UpperLeg_R) - has parent 0 (Root)
17 (LowerLeg_R) - has parent 16 (UpperLeg_R)
18 (Foot_R) - has parent 17 (LowerLeg_R)
*/
