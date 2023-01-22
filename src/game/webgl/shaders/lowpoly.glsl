#version 300 es
precision mediump float;
precision mediump sampler2D;

///////////////////////////////////////////////////////////////////////////////

#ifdef VERT

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform mat4 projMat;
uniform mat4 viewMat;
uniform mat4 modelMat;
uniform sampler2D palette; //0

out vec3 vposition;
out vec3 vnormal;
out vec3 vcolor;
out float glow;

void main() {
  vposition = (modelMat*vec4(position,1.0)).xyz;
  vnormal = (modelMat*vec4(normal,0.0)).xyz;
  vec4 tex = texture(palette, uv);
  vcolor = tex.rgb;
  glow = uv.x > 0.666 ? tex.a : 0.0; //maybe do this differently? at the moment just check if the "glow part" of the palette is used
  gl_Position = projMat * viewMat * modelMat * vec4(position, 1.0);
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
  //vec3 sunDir = normalize(vec3(1.0, 1.0, 1.0));

  vec3 N = normalize(vnormal); // normal
  vec3 L = normalize(lightPos - vposition); // Light dir (direction toward light)
  //vec3 L = sunDir;
  vec3 V = normalize(eye - vposition); // View dir (direction toward camera eye)
  vec3 H = normalize(V + L);           // halfway dir
  float NL = max(dot(N, L),0.0);

  float ambientStrength = 0.33;
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
