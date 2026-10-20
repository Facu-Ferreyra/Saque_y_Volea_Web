// Shaders (programas que corren en la placa de video), en GLSL ES 3.0 (WebGL2).
// Usamos UN solo programa con varios "modos" (uMode) para no cambiar de programa
// en cada objeto. Cada modo es un material distinto:
//   0 sólido iluminado      1 piso de la cancha     2 malla (red y alambrado)
//   3 color plano/vidrio    4 textura (libre: para un logo real a futuro)
//   5 cara de la paleta (con agujeros)
//   6 pelota (con costura)  7 cielo (pantalla completa)
//   8 mancha radial (sombras y brillos de las luces)

export const VERT = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
in vec3 aPos;
in vec3 aNor;
in vec2 aUv;
uniform mat4 uProj, uView, uModel;
uniform int uMode;
out vec3 vWorld;
out vec3 vNor;
out vec2 vUv;
out vec3 vLocal;
out vec3 vLocalNor;

void main() {
  vUv = aUv;
  vLocal = aPos;
  vLocalNor = aNor;
  if (uMode == 7) {                       // cielo: un triángulo que tapa la pantalla
    vWorld = aPos;
    gl_Position = vec4(aPos.xy, 0.99999, 1.0);
    return;
  }
  vec4 w = uModel * vec4(aPos, 1.0);
  vWorld = w.xyz;
  vNor = normalize(mat3(uModel) * aNor);
  gl_Position = uProj * uView * w;
}`

export const FRAG = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
in vec3 vWorld;
in vec3 vNor;
in vec2 vUv;
in vec3 vLocal;
in vec3 vLocalNor;
uniform int uMode;
uniform vec3 uColor;
uniform float uAlpha;
uniform vec3 uCam;
uniform vec3 uLights[4];
uniform vec3 uSkyTop, uSkyHorizon;
uniform mat4 uInvProjView;
uniform sampler2D uTex;
uniform vec2 uGrid;            // x: tamaño de celda (m), y: grosor del alambre (m)
uniform vec3 uPaddle;          // x: radio X, y: radio Y, z: separación de agujeros
uniform float uHoleR;
uniform float uCut;
uniform sampler2D uEnv;        // foto 360° (equirectangular) del club, opcional
uniform vec3 uEnvParams;       // x: 1 si hay foto, y: giro (rad), z: brillo           // la paleta aparece desde el mango: se descarta lo que está por encima
out vec4 outColor;

// Luz: ambiente + 4 reflectores de la cancha con caída por distancia.
vec3 shade(vec3 base, vec3 n, vec3 p, float spec) {
  vec3 col = base * vec3(0.20, 0.23, 0.32);
  vec3 V = normalize(uCam - p);
  for (int i = 0; i < 4; i++) {
    vec3 L = uLights[i] - p;
    float d2 = dot(L, L);
    L *= inversesqrt(d2);
    float att = 40.0 / (d2 + 10.0);
    col += base * max(dot(n, L), 0.0) * att * vec3(1.0, 0.97, 0.9);
    if (spec > 0.0) {
      vec3 H = normalize(L + V);
      col += spec * pow(max(dot(n, H), 0.0), 60.0) * att;
    }
  }
  return col;
}

vec3 fog(vec3 col, vec3 p) {
  float f = 1.0 - exp(-length(p - uCam) * 0.028);
  return mix(col, uSkyHorizon, f * 0.7);
}

// Línea antialiasing: 1 sobre la línea, 0 fuera, borde suave de 1 píxel.
float line(float v, float c, float w) {
  float d = abs(v - c);
  float fw = fwidth(v);
  return 1.0 - smoothstep(w * 0.5 - fw, w * 0.5 + fw, d);
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  // ---------- 7: CIELO ----------
  if (uMode == 7) {
    vec4 far = uInvProjView * vec4(vWorld.xy, 1.0, 1.0);
    vec3 dir = normalize(far.xyz / far.w - uCam);
    float t = smoothstep(-0.05, 0.6, dir.y);
    vec3 sky = mix(uSkyHorizon, uSkyTop, t);
    if (uEnvParams.x > 0.5) {
      // Dirección → coordenadas de la foto 360: longitud (u) y latitud (v)
      float u = atan(dir.x, -dir.z) / 6.2831853 + 0.5 + uEnvParams.y / 6.2831853;
      float v = 0.5 + asin(clamp(dir.y, -1.0, 1.0)) / 3.1415927;
      sky = texture(uEnv, vec2(fract(u), v)).rgb * uEnvParams.z;
    }
    outColor = vec4(sky, 1.0);
    return;
  }
  vec3 n = normalize(vNor);
  if (!gl_FrontFacing) n = -n;
  if (vLocal.y > uCut) discard;
  float cutGlow = (1.0 - smoothstep(0.0, 0.015, uCut - vLocal.y)) * step(uCut, 0.5);

  // ---------- 1: PISO ----------
  if (uMode == 1) {
    vec2 p = vWorld.xz;
    bool inCourt = abs(p.x) < 5.0 && abs(p.y) < 10.0;
    float grain = hash(floor(p * 40.0)) * 0.06;
    vec3 base = inCourt ? vec3(0.11, 0.30, 0.66) : vec3(0.05, 0.08, 0.15);
    base *= 0.94 + grain;
    if (inCourt) {
      float l = 0.0;
      l = max(l, line(p.y, 6.95, 0.05) * step(abs(p.x), 5.0));
      l = max(l, line(p.y, -6.95, 0.05) * step(abs(p.x), 5.0));
      l = max(l, line(p.x, 0.0, 0.05) * step(abs(p.y), 6.95));
      base = mix(base, vec3(0.93), l);
    }
    vec3 col = shade(base, vec3(0, 1, 0), vWorld, 0.0);
    outColor = vec4(fog(col, vWorld), 1.0);
    return;
  }

  // ---------- 2: MALLA (red y alambrado) ----------
  if (uMode == 2) {
    vec2 g = vUv / uGrid.x;
    vec2 f = abs(fract(g) - 0.5);
    vec2 fw = fwidth(g);
    float wHalf = uGrid.y / uGrid.x * 0.5;
    vec2 wire = 1.0 - smoothstep(0.5 - wHalf - fw, 0.5 - wHalf + fw, f);
    float cover = max(wire.x, wire.y);
    // De lejos el patrón es más chico que un píxel: en vez de "moiré" usamos su densidad promedio.
    float avg = 1.0 - pow(1.0 - 2.0 * wHalf, 2.0);
    cover = mix(cover, avg, smoothstep(0.25, 0.6, max(fw.x, fw.y)));
    float a = cover * uAlpha;
    if (a < 0.01) discard;
    outColor = vec4(fog(uColor, vWorld), a);
    return;
  }

  // ---------- 3: COLOR PLANO / VIDRIO ----------
  if (uMode == 3) {
    float edge = 1.0 - min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)) * 40.0;
    float a = uAlpha + clamp(edge, 0.0, 1.0) * uAlpha * 2.0;
    outColor = vec4(uColor, min(a, 1.0));
    return;
  }

  // ---------- 4: TEXTURA (logo) ----------
  if (uMode == 4) {
    vec4 t = texture(uTex, vUv);
    outColor = vec4(t.rgb, t.a * uAlpha);
    return;
  }

  // ---------- 8: MANCHA RADIAL ----------
  if (uMode == 8) {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(1.0 - smoothstep(0.0, 1.0, d), 2.0) * uAlpha;
    outColor = vec4(uColor * a, a);   // premultiplicado: sirve para sumar o para oscurecer
    return;
  }

  // ---------- 5: CARA DE LA PALETA ----------
  if (uMode == 5) {
    vec2 q = vLocal.xy;
    bool face = abs(vLocalNor.z) > 0.5;
    vec3 base = vec3(0.06, 0.08, 0.14);                      // canto: oscuro
    float shine = 0.6;
    if (face) {
      float e = (q.x * q.x) / (uPaddle.x * uPaddle.x) + (q.y * q.y) / (uPaddle.y * uPaddle.y);
      // Grilla hexagonal de agujeros
      float s = uPaddle.z;
      float row = floor(q.y / (s * 0.866) + 0.5);
      float off = mod(row, 2.0) * 0.5 * s;
      float col = floor((q.x - off) / s + 0.5);
      vec2 c = vec2(col * s + off, row * s * 0.866);
      float ec = (c.x * c.x) / (uPaddle.x * uPaddle.x * 0.62) + (c.y * c.y) / (uPaddle.y * uPaddle.y * 0.66);
      float d = length(q - c);
      if (ec < 1.0 && d < uHoleR) discard;                   // ← el agujero
      base = vec3(0.90, 0.92, 0.95);
      float stripe = q.y + 3.2 * q.x * q.x;
      base = mix(base, vec3(0.83, 0.93, 0.23), step(-0.112, stripe) * step(stripe, -0.088));
      if (ec < 1.0) base *= mix(0.55, 1.0, smoothstep(uHoleR, uHoleR + 0.004, d)); // sombra en el borde del agujero
      base = mix(base, vec3(0.06, 0.08, 0.14), smoothstep(0.86, 0.9, e)); // marco
      shine = 0.35;
    }
    vec3 colr = shade(base, n, vWorld, shine) + vec3(0.86, 0.95, 0.24) * cutGlow * 1.4;
    outColor = vec4(fog(colr, vWorld), 1.0);
    return;
  }

  // ---------- 6: PELOTA ----------
  if (uMode == 6) {
    vec3 ln = normalize(vLocalNor);
    float ang = atan(ln.z, ln.x);
    float seamD = abs(ln.y - 0.55 * cos(2.0 * ang) * sqrt(max(0.0, 1.0 - ln.y * ln.y)));
    vec3 base = mix(vec3(0.86, 0.95, 0.24), vec3(0.97, 0.98, 0.9), 1.0 - smoothstep(0.035, 0.06, seamD));
    vec3 col = shade(base, n, vWorld, 0.15) + base * 0.28;  // luz de relleno: se lee aunque esté a contraluz
    float rim = pow(1.0 - max(dot(n, normalize(uCam - vWorld)), 0.0), 2.0);
    col += vec3(0.85, 0.95, 0.4) * rim * 0.35;                // pelusa en el borde
    outColor = vec4(col, 1.0);
    return;
  }

  // ---------- 0: SÓLIDO ----------
  vec3 col = shade(uColor, n, vWorld, 0.25) + vec3(0.86, 0.95, 0.24) * cutGlow * 1.4;
  outColor = vec4(fog(col, vWorld), 1.0);
}`
