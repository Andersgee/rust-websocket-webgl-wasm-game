import { mat4, quat, vec3 } from "gl-matrix";
import * as kf from "./keyframes";

export type Keyframe = {
  quats: quat[];
  pos: vec3;
};

type Bone = {
  q: quat;
  pos: vec3;
  invBindMat: mat4;
  parent: number;
  transform: mat4; //dont use transform at all, only here for debug
};

export type Animation = {
  keyframes: Keyframe[];
  /** ms timing for each keyframe in keyframes, timings[0] should be 0.  */
  timings: number[];
};

export const animations = {
  Walk: {
    keyframes: [
      kf.pass_L,
      kf.peak_L,
      kf.contact_R,
      kf.down_R,
      kf.pass_R,
      kf.peak_R,
      kf.contact_L,
      kf.down_L,
      kf.pass_L,
    ],
    timings: Array.from({ length: 9 }).map((_, i) => i * 60),
  } as Animation,
  Idle: {
    keyframes: [kf.idle_breatheout, kf.idle_breathein, kf.idle_breatheout],
    timings: [0, 500, 1000],
  } as Animation,
  Kick: {
    keyframes: [kf.idle_breatheout, kf.kick_charge, kf.kick_extend],
    timings: [0, 250, 350],
  } as Animation,
  Punch: {
    keyframes: [kf.idle_breatheout, kf.punch_charge, kf.punch_extend],
    timings: [0, 250, 350],
  } as Animation,
} as const;

export const bones: Bone[] = [
  {
    q: [0.7071067690849304, 0, 0, 0.7071067690849304],
    pos: [0, 0.7844766974449158, 0],
    invBindMat: [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0.7844767, 1],
    parent: -1,
    transform: [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0.7844767, 0, 1],
  },
  {
    q: [0, 0, 0, 1],
    pos: [0, 0, -0.1626511961221695],
    invBindMat: [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0.9471279, 1],
    parent: 0,
    transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -0.1626512, 1],
  },
  {
    q: [0, 0, 0, 1],
    pos: [0, 0, -0.15304720401763916],
    invBindMat: [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 1.100175, 1],
    parent: 1,
    transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -0.1530472, 1],
  },
  {
    q: [0, 0, 0, 1],
    pos: [0, 0, -0.26073428988456726],
    invBindMat: [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 1.360909, 1],
    parent: 2,
    transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -0.2607343, 1],
  },
  {
    q: [0, 0, 0, 1],
    pos: [0, 0, -0.03251123055815697],
    invBindMat: [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 1.393421, 1],
    parent: 3,
    transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -0.03251123, 1],
  },
  {
    q: [
      9.214070928464935e-8, -0.8446425199508667, -9.23475340641744e-8,
      0.5353307723999023,
    ],
    pos: [0, 0, -0.26073428988456726],
    invBindMat: [
      -0.426842, 0, -0.9043263, 0, -0.9043263, -2.54653e-7, 0.4268419, 0,
      -2.54526e-7, 1, 0, 0, 1.230706, 3.4656e-7, -0.5808932, 1,
    ],
    parent: 2,
    transform: [
      -0.4268419, -2.54525e-7, 0.9043262, 0, -5.67791e-8, 1, 2.54653e-7, 0,
      -0.9043262, 5.735e-8, -0.426842, 0, 0, 0, -0.2607343, 1,
    ],
  },
  {
    q: [
      -0.010312476195394993, 0.19297818839550018, 0.0020283011253923178,
      0.9811467528343201,
    ],
    pos: [0, -7.105429898699844e-15, -0.21278269588947296],
    invBindMat: [
      -0.05255883, 0.02098983, -0.9983975, 0, -0.998618, -0.00110501,
      0.05254715, 0, -3.01399e-7, 0.9997792, 0.02101886, 0, 1.278443,
      -0.002635478, 0.1253772, 1,
    ],
    parent: 5,
    transform: [
      0.9255107, -4.23751e-8, -0.3787217, 0, -0.007960287, 0.9997791,
      -0.01945327, 0, 0.378638, 0.02101894, 0.9253061, 0, 0, -7.10543e-15,
      -0.2127827, 1,
    ],
  },
  {
    q: [
      0.021215146407485008, 0.02373838610947132, -0.000004718143827631138,
      0.9994930624961853,
    ],
    pos: [1.3410999599727802e-7, 0, -0.3076033890247345],
    invBindMat: [
      -0.005101799, -0.0214231, -0.9997577, 0, -0.9999871, 0.000109165,
      0.005100548, 0, -1.33608e-7, 0.9997706, -0.02142333, 0, 1.256454,
      0.01702868, 0.4928801, 1,
    ],
    parent: 6,
    transform: [
      0.9988729, 0.000997795, -0.0474529, 0, 0.001016658, 0.9990999, 0.04240856,
      0, 0.04745251, -0.04240901, 0.9979728, 0, 1.3411e-7, 0, -0.3076034, 1,
    ],
  },
  {
    q: [
      -0.010712292976677418, 0.0010956883197650313, -0.000012020120266242884,
      0.9999420046806335,
    ],
    pos: [-5.541370029504833e-8, 1.8626500342122654e-9, -0.30179569125175476],
    invBindMat: [
      -0.002910256, 0, -0.999996, 0, -0.9999959, -6.96321e-7, 0.002910256, 0,
      -6.97799e-7, 1, 0, 0, 1.254708, 8.89516e-7, 0.7976098, 1,
    ],
    parent: 7,
    transform: [
      0.9999976, -0.0000475135, -0.002190992, 0, 5.64197e-7, 0.9997706,
      -0.02142337, 0, 0.002191507, 0.02142332, 0.9997681, 0, -5.54137e-8,
      1.86265e-9, -0.3017957, 1,
    ],
  },
  {
    q: [
      9.214070928464935e-8, 0.8446425199508667, 9.23475340641744e-8,
      0.5353307723999023,
    ],
    pos: [0, 0, -0.26073428988456726],
    invBindMat: [
      -0.426842, 0, 0.9043263, 0, 0.9043263, -2.54653e-7, 0.4268419, 0,
      2.54526e-7, 1, 0, 0, -1.230706, 3.4656e-7, -0.5808932, 1,
    ],
    parent: 2,
    transform: [
      -0.4268419, 2.54525e-7, -0.9043262, 0, 5.67791e-8, 1, 2.54653e-7, 0,
      0.9043262, 5.735e-8, -0.426842, 0, 0, 0, -0.2607343, 1,
    ],
  },
  {
    q: [
      -0.010312476195394993, -0.19297818839550018, -0.0020283011253923178,
      0.9811467528343201,
    ],
    pos: [0, -7.105429898699844e-15, -0.21278269588947296],
    invBindMat: [
      -0.05255883, -0.02098983, 0.9983975, 0, 0.998618, -0.00110501, 0.05254715,
      0, 3.01399e-7, 0.9997792, 0.02101886, 0, -1.278443, -0.002635478,
      0.1253772, 1,
    ],
    parent: 9,
    transform: [
      0.9255107, 4.23751e-8, 0.3787217, 0, 0.007960287, 0.9997791, -0.01945327,
      0, -0.378638, 0.02101894, 0.9253061, 0, 0, -7.10543e-15, -0.2127827, 1,
    ],
  },
  {
    q: [
      0.021215146407485008, -0.02373838610947132, 0.000004718143827631138,
      0.9994930624961853,
    ],
    pos: [-1.3410999599727802e-7, 0, -0.3076033890247345],
    invBindMat: [
      -0.005101799, 0.0214231, 0.9997577, 0, 0.9999871, 0.000109165,
      0.005100548, 0, 1.33608e-7, 0.9997706, -0.02142333, 0, -1.256454,
      0.01702868, 0.4928801, 1,
    ],
    parent: 10,
    transform: [
      0.9988729, -0.000997795, 0.0474529, 0, -0.001016658, 0.9990999,
      0.04240856, 0, -0.04745251, -0.04240901, 0.9979728, 0, -1.3411e-7, 0,
      -0.3076034, 1,
    ],
  },
  {
    q: [
      -0.010712292976677418, -0.0010956907644867897, 0.000011781829925894272,
      0.9999420046806335,
    ],
    pos: [5.541370029504833e-8, 1.8626500342122654e-9, -0.30179569125175476],
    invBindMat: [
      -0.002910256, 0, 0.999996, 0, 0.9999959, -2.19718e-7, 0.002910256, 0,
      2.21194e-7, 1, 0, 0, -1.254708, 2.91516e-7, 0.7976098, 1,
    ],
    parent: 11,
    transform: [
      0.9999976, 0.000047037, 0.002191002, 0, -8.75873e-8, 0.9997706,
      -0.02142337, 0, -0.002191507, 0.02142332, 0.9997681, 0, 5.54137e-8,
      1.86265e-9, -0.3017957, 1,
    ],
  },
  {
    q: [
      -0.00017641865997575223, 0.9997252821922302, -0.02202446572482586,
      -0.008013296872377396,
    ],
    pos: [0.09390342235565186, -0.013084899634122849, -0.009236395359039307],
    invBindMat: [
      -0.9998714, -0.000705357, -0.01601439, 0, -0.01602995, 0.04403388,
      0.9989017, 0, -1.19675e-7, 0.9990288, -0.04403966, 0, 0.1066145,
      -0.02181184, -0.7919138, 1,
    ],
    parent: 0,
    transform: [
      -0.9998716, 5.96046e-7, 0.01602995, 0, -0.000706077, 0.9990308,
      -0.04403407, 0, -0.01601444, -0.04403961, -0.9989011, 0, 0.09390342,
      -0.0130849, -0.009236395, 1,
    ],
  },
  {
    q: [
      -0.02843206748366356, -0.008014279417693615, 0.00012518663424998522,
      0.9995635747909546,
    ],
    pos: [-7.450580152834618e-9, 1.6298099536626864e-9, -0.38450270891189575],
    invBindMat: [
      -0.9999999, 6.30242e-7, 0, 0, 0, -0.0128194, 0.9999181, 0, 0, 0.9999169,
      0.01281923, 0, 0.100061, 0.001403033, -0.4096487, 1,
    ],
    parent: 13,
    transform: [
      0.9998716, 0.000705989, 0.01601445, 0, 0.000205461, 0.9983832,
      -0.05684133, 0, -0.01602868, 0.05683732, 0.998255, 0, -7.45058e-9,
      1.62981e-9, -0.3845027, 1,
    ],
  },
  {
    q: [
      0.6405161023139954, -9.768384501285254e-8, 1.8401713930416008e-7,
      0.7679446935653687,
    ],
    pos: [7.450580152834618e-9, -3.4924599323638006e-10, -0.3602493107318878],
    invBindMat: [
      -0.9999999, 5.67331e-7, -6.97235e-7, 0, 3.82166e-7, 0.9813805, 0.1920747,
      0, 0, 0.1920744, -0.9813793, 0, 0.1000609, -0.04834538, -0.01024633, 1,
    ],
    parent: 14,
    transform: [
      1, 1.57494e-7, 3.85764e-7, 0, -4.07766e-7, 0.1794781, 0.983762, 0,
      8.57008e-8, -0.983762, 0.1794783, 0, 7.45058e-9, -3.49246e-10, -0.3602493,
      1,
    ],
  },
  {
    q: [
      0.00017641865997575223, 0.9997252821922302, -0.02202446572482586,
      0.008013296872377396,
    ],
    pos: [-0.09390342235565186, -0.013084899634122849, -0.009236395359039307],
    invBindMat: [
      -0.9998714, 0.000705357, 0.01601439, 0, 0.01602995, 0.04403388, 0.9989017,
      0, 1.19675e-7, 0.9990288, -0.04403966, 0, -0.1066145, -0.02181184,
      -0.7919138, 1,
    ],
    parent: 0,
    transform: [
      -0.9998716, -5.96046e-7, -0.01602995, 0, 0.000706077, 0.9990308,
      -0.04403407, 0, 0.01601444, -0.04403961, -0.9989011, 0, -0.09390342,
      -0.0130849, -0.009236395, 1,
    ],
  },
  {
    q: [
      -0.02843206748366356, 0.008014279417693615, -0.00012518663424998522,
      0.9995635747909546,
    ],
    pos: [7.450580152834618e-9, 1.6298099536626864e-9, -0.38450270891189575],
    invBindMat: [
      -0.9999999, -6.30242e-7, 0, 0, 0, -0.0128194, 0.9999181, 0, 0, 0.9999169,
      0.01281923, 0, -0.100061, 0.001403033, -0.4096487, 1,
    ],
    parent: 16,
    transform: [
      0.9998716, -0.000705989, -0.01601445, 0, -0.000205461, 0.9983832,
      -0.05684133, 0, 0.01602868, 0.05683732, 0.998255, 0, 7.45058e-9,
      1.62981e-9, -0.3845027, 1,
    ],
  },
  {
    q: [
      0.6405161023139954, 9.768384501285254e-8, -1.8401713930416008e-7,
      0.7679446935653687,
    ],
    pos: [-7.450580152834618e-9, -3.4924599323638006e-10, -0.3602493107318878],
    invBindMat: [
      -0.9999999, -5.67331e-7, 6.97235e-7, 0, -3.82166e-7, 0.9813805, 0.1920747,
      0, 0, 0.1920744, -0.9813793, 0, -0.1000609, -0.04834538, -0.01024633, 1,
    ],
    parent: 17,
    transform: [
      1, -1.57494e-7, -3.85764e-7, 0, 4.07766e-7, 0.1794781, 0.983762, 0,
      -8.57008e-8, -0.983762, 0.1794783, 0, -7.45058e-9, -3.49246e-10,
      -0.3602493, 1,
    ],
  },
];