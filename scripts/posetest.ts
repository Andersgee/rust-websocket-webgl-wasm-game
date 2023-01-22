import { vec3, mat3, mat4, quat } from "gl-matrix";
/*
import anims from "../src/game/webgl/models/re/0TPose_bones.json" assert { type: "json" };

//add "type: module" in package json
//run pnpm tsnode scripts/posetest.ts

type Pose = {
  q: quat;
  pos: vec3;
  invBindMat: mat4;
  parent: number;
  transform: mat4;
};

const defaultPose: Pose[] = [];
for (const anim of anims) {
  const t = anim.transform as mat4;
  const bindmat = anim.invBindMat as mat4;
  mat4.transpose(t, t); //important, the blender exports are transposed
  mat4.transpose(bindmat, bindmat);
  const { q, pos } = quatposFromTransform(t);
  defaultPose.push({
    q: [q[0], q[1], q[2], q[3]],
    pos: [pos[0], pos[1], pos[2]],
    invBindMat: bindmat,
    parent: anim.parent,
    transform: t,
  });
}

function quatposFromTransform(transform: mat4) {
  const pos = vec3.fromValues(transform[12], transform[13], transform[14]);
  const m3 = mat3.create();
  mat3.fromMat4(m3, transform);

  const q = quat.create();
  quat.fromMat3(q, m3);
  quat.normalize(q, q);

  return { q, pos };
}

function transformFromquatpos(q: quat, pos: vec3) {
  const m = mat4.create();
  mat4.fromRotationTranslation(m, q, pos);
  return m;
}

function r(x: number) {
  if (Math.abs(x) < 0.00001) {
    return 0;
  } else if (x > 0.999999) {
    return 1;
  } else if (x < -0.999999) {
    return -1;
  } else {
    return x;
  }
}

function display(m: mat4) {
  console.log(r(m[0]), r(m[1]), r(m[2]), r(m[3]));
  console.log(r(m[4]), r(m[5]), r(m[6]), r(m[7]));
  console.log(r(m[8]), r(m[9]), r(m[10]), r(m[11]));
  console.log(r(m[12]), r(m[13]), r(m[14]), r(m[5]));
}

const i = 5;
console.log("original transform");
display(defaultPose[i].transform);
console.log("extracted quat");
console.log(defaultPose[i].q);
console.log("extracted pos");
console.log(defaultPose[i].pos);

console.log("reconstructed transform");
const reconstructed = transformFromquatpos(
  defaultPose[i].q,
  defaultPose[i].pos
);
display(reconstructed);

console.log(JSON.stringify(defaultPose));

*/
