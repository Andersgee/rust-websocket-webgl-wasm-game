#version 300 es
precision mediump float;
precision mediump sampler2D;

///////////////////////////////////////////////////////////////////////////////

#ifdef VERT

in vec3 position;
in vec3 normal;
in vec2 uv;

in ivec4 joints; //for example joint id in joint.x
in vec4 weights; //corresponding joint weight in weight.x

uniform mat4 jointTransform[19]; //adjust these for animation
//uniform mat4 invBindMat[19];

uniform mat4 projMat;
uniform mat4 viewMat;
uniform mat4 modelMat;
uniform bool isTakingDmg;
uniform sampler2D palette;

out vec3 vposition;
out vec3 vnormal;
out vec3 vcolor;
out float glow;

void main() {
  //vec4 tex = texture(palette, uv);
  vec4 tex = isTakingDmg ? vec4(0.7, 0.0, 0.0, 1.0) : texture(palette, vec2(uv.x, 1.0 - uv.y));

  vcolor = tex.rgb;
  glow = uv.x > 0.666 ? tex.a : 0.0; //maybe do this differently? at the moment just check if the "glow part" of the palette is used

  int idx = joints.x;
  int idy = joints.y;
  int idz = joints.z;
  int idw = joints.w;

  vec4 pa = (jointTransform[idx] * vec4(position, 1.0)) * weights.x;
  vec4 pb = (jointTransform[idy] * vec4(position, 1.0)) * weights.y;
  vec4 pc = (jointTransform[idz] * vec4(position, 1.0)) * weights.z;
  vec4 pd = (jointTransform[idw] * vec4(position, 1.0)) * weights.w;

  vec4 na = (jointTransform[idx] * vec4(normal, 1.0)) * weights.x;
  vec4 nb = (jointTransform[idy] * vec4(normal, 1.0)) * weights.y;
  vec4 nc = (jointTransform[idz] * vec4(normal, 1.0)) * weights.z;
  vec4 nd = (jointTransform[idw] * vec4(normal, 1.0)) * weights.w;

  vec4 p = vec4(pa + pb + pc + pd);
  vec4 n = vec4(na + nb + nc + nd);
  vposition = (modelMat * vec4(p.xyz, 1.0)).xyz;
  vnormal = (modelMat * vec4(n.xyz, 0.0)).xyz;
  //vnormal = mat3(transpose(inverse(modelMat))) * n.xyz; //mor ecorrect but slower
  gl_Position = projMat * viewMat * modelMat * vec4(p.xyz, 1.0);
}

#endif

///////////////////////////////////////////////////////////////////////////////

#ifdef FRAG

in vec3 vposition;
in vec3 vnormal;
in vec3 vcolor;
in float glow;

uniform vec3 eye;

layout(location = 0) out vec4 fragcolor;
layout(location = 1) out vec4 lowpoly_glowtexture;

void main() {
  vec3 objectColor = vcolor;
  vec3 lightColor = vec3(1.0, 0.7, 0.7);
  vec3 lightPos = vec3(0.0, 4.0, 0.0);
  //vec3 sunDir = normalize(vec3(1.0, 10.0, 1.0));

  vec3 N = normalize(vnormal); // normal
  vec3 L = normalize(lightPos - vposition); // Light dir (direction toward light)
  //vec3 L = sunDir;
  vec3 V = normalize(eye - vposition); // View dir (direction toward camera eye)
  vec3 H = normalize(V + L);           // halfway dir
  float NL = max(dot(N, L), 0.0);

  float ambientStrength = 0.66;
  float shininess = 0.5;

  // intensity of color
  vec3 ambient = lightColor * ambientStrength;
  vec3 diffuse = lightColor * NL;
  float spec = pow(max(dot(N, H), 0.0), shininess);
  vec3 specular = lightColor * spec;

  vec3 result = (ambient + diffuse + specular) * objectColor;

  fragcolor = vec4(result, 1.0);
  lowpoly_glowtexture = vec4(result * glow, 1.0);

}
#endif
