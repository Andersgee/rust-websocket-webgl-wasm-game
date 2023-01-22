#version 300 es
precision mediump float;
precision mediump sampler2D;

///////////////////////////////////////////////////////////////////////////////

#ifdef VERT

in vec2 position;
in vec2 uv;

out vec2 vuv;

void main() {
  vuv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}

#endif

///////////////////////////////////////////////////////////////////////////////

#ifdef FRAG

uniform sampler2D lowpoly_texture; //0
uniform sampler2D lowpoly_depthtexture; //1
uniform sampler2D lowpoly_glowtexture; //2
uniform vec2 canvas_size;

in vec2 vuv;

layout(location = 0) out vec4 fragcolor;

// depthSample from depthTexture.r, for instance
// https://stackoverflow.com/a/33465663
// also more in depth: https://learnopengl.com/Advanced-OpenGL/Depth-testing
float linearDepth(float depthSample) {
  float nearclip = 0.1;
  float farclip = 1000.0;
  float d = 2.0 * depthSample - 1.0;
  return 2.0 * nearclip * farclip / (farclip + nearclip - d * (farclip - nearclip));
}

void main() {
  vec3 fogColor = vec3(0.83, 0.73, 0.64);

  vec3 texcolor = texture(lowpoly_texture, vuv).xyz;
  vec3 glowcolor = texture(lowpoly_glowtexture, vuv).rgb;
  float depthSample = texture(lowpoly_depthtexture, vuv).x;

  float dist = linearDepth(depthSample);
  float fogAmount = smoothstep(0.1, 30.0, dist);
  vec3 color = mix(texcolor, fogColor, fogAmount);

  color += glowcolor;
  fragcolor = vec4(color, 1.0);
}

#endif
