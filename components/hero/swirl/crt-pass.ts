export const BARREL_GAIN = 0.1;

export const BARREL_PINCH = 0.085;

export const BARREL_EDGE = 0.05;

export const ABERRATION_UV = 0.0028;

export const VIGNETTE = 0.7;

export const TONEMAP_EXPOSURE = 2.2;

export const CURVE_RAMP_SEC = 3.0;

export const CRT_FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uRes;
uniform float uScanline;
uniform float uAberration;
uniform float uCurvature;
uniform vec3 uBg;
float easeOutQuad(float t){ return t*(2.0-t); }
void main(){
  float prog = min(uTime / ${CRT_NUM(CURVE_RAMP_SEC)}, 1.0);
  float curve = easeOutQuad(prog) * uCurvature;
  vec2 c = vUv * 2.0 - 1.0;
  c *= 1.0 + ${CRT_NUM(BARREL_GAIN)} * curve;
  c *= 1.0 - ${CRT_NUM(BARREL_PINCH)} * curve + ${CRT_NUM(BARREL_EDGE)} * curve * pow(abs(c.yx), vec2(2.0));
  c = c * 0.5 + 0.5;
  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0){ gl_FragColor = vec4(uBg, 1.0); return; }
  float d = uAberration * ${CRT_NUM(ABERRATION_UV)};
  float r = texture2D(uTex, vec2(c.x + d, c.y)).r;
  float g = texture2D(uTex, c).g;
  float b = texture2D(uTex, vec2(c.x - d, c.y)).b;
  vec3 col = vec3(r, g, b);

  float bgLum = dot(uBg, vec3(0.299, 0.587, 0.114));
  float darkMode = 1.0 - smoothstep(0.4, 0.8, bgLum);

  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 phosphor = vec3(0.22, 0.92, 0.72) * smoothstep(0.55, 0.98, luma) * 0.24 * darkMode;
  col += phosphor;

  float scan = max(0.0, sin((c.y + uTime * 0.0005) * uRes.y)) * 0.5;
  col = mix(col, col - vec3(scan), uScanline);

  float vig = length(c - 0.5) * ${CRT_NUM(VIGNETTE)};
  col = mix(col, uBg, clamp(vig, 0.0, 1.0) * darkMode);

  vec3 toned = 1.0 - exp(-col * ${CRT_NUM(TONEMAP_EXPOSURE)});
  col = mix(col, toned, darkMode);

  gl_FragColor = vec4(col, 1.0);
}`;

export const CRT_VERT = `attribute vec4 aPos; attribute vec2 aUv; varying vec2 vUv;
void main(){ gl_Position = aPos; vUv = aUv; }`;

export const TEXT_VERT = `attribute vec2 aCorner; attribute vec4 aBounds; attribute vec4 aGlyphUv; attribute vec4 aColor;
uniform vec2 uTarget; varying vec2 vGlyphUv; varying vec4 vColor;
void main(){
  vec2 px = mix(aBounds.xy, aBounds.zw, aCorner);
  vec2 clip = vec2((px.x / uTarget.x) * 2.0 - 1.0, 1.0 - (px.y / uTarget.y) * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  vGlyphUv = mix(aGlyphUv.xy, aGlyphUv.zw, aCorner);
  vColor = aColor;
}`;

export const TEXT_FRAG = `precision mediump float; varying vec2 vGlyphUv; varying vec4 vColor; uniform sampler2D uAtlas;
void main(){ float a = texture2D(uAtlas, vGlyphUv).a; if(a <= 0.001) discard; gl_FragColor = vec4(vColor.rgb, vColor.a * a); }`;

function CRT_NUM(n: number): string {
  const s = String(n);
  return s.includes('.') ? s : s + '.0';
}
