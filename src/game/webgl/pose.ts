import { mat4, quat, vec3 } from "gl-matrix";
import { bones, type Keyframe } from "./models/Guy/armature";

//no need to reconstruct these every time
const N = bones.length;
const modelTransform: mat4[] = Array.from({ length: N }).map(() =>
  mat4.create()
);
const jointTransform: mat4[] = Array.from({ length: N }).map(() =>
  mat4.create()
);

/**
 * return jointTransform uniform (a list of 19 mat4, but flattened)
 *
 * The basic idea is:
 *
 * 1. use some local transforms (local means relative to its parent)
 * 2. propagate them to modelTransforms (according to bone hierarchy)
 *     modelTransform[i] = modelTransform[parent] * localTransform[i]
 * 3. calculate final transform
 *     jointTransform[i] = modelTransform[i] * bones[i].invBindMat
 */
export function getJointTransform(keyframe: Keyframe) {
  for (let i = 0; i < bones.length; i++) {
    const q = quat.multiply(quat.create(), bones[i].q, keyframe.quats[i]);
    const modelTransform_parent =
      i === 0
        ? mat4.fromTranslation(mat4.create(), keyframe.pos)
        : modelTransform[bones[i].parent];
    const localTransform = mat4.fromRotationTranslation(
      mat4.create(),
      q,
      bones[i].pos
    );

    mat4.multiply(modelTransform[i], modelTransform_parent, localTransform);
  }

  for (let i = 0; i < N; i++) {
    mat4.multiply(jointTransform[i], modelTransform[i], bones[i].invBindMat);
  }

  //single list (instead of a bunch of Float32Arrays)
  return jointTransform.flatMap((x) => Array.from(x));
}

/**
 * slerp keyframe.quats and lerp keyframe.pos
 */
export function mixKeyframes(a: Keyframe, b: Keyframe, t: number): Keyframe {
  const pos = vec3.lerp(vec3.create(), a.pos, b.pos, t);

  const N = a.quats.length;
  const quats = Array.from({ length: N }).map((_, i) =>
    quat.slerp(quat.create(), a.quats[i], b.quats[i], t)
  );

  return { pos, quats };
}

/**
 * find which indexes to interpolate between, and the linear interpolant t.
 *
 * note: you likely want to pass the returned `t` through some other animation timing function before slerping between keyframes.
 *
 * # example
 * ```js
 * const timings= [0,100,400,500];
 * const elapsed = 300;
 * interpolate_timing(timings, elapsed)
 * > [ 1, 2, 0.6666666666666666 ]
 *
 *
 * ```
 */
export function interpolate_timing(
  timings: number[],
  elapsed: number,
  loop = false
): [number, number, number] {
  const lastIndex = timings.length - 1;
  const elap = loop ? elapsed % timings[lastIndex] : elapsed;
  for (let i = lastIndex; i >= 0; i--) {
    const delta = elap - timings[i];
    if (delta >= 0) {
      if (i === lastIndex) {
        return [lastIndex, lastIndex, 0];
      } else {
        const t = delta / (timings[i + 1] - timings[i]);
        return [i, i + 1, t];
      }
    }
  }

  return [0, 0, 0];
}
