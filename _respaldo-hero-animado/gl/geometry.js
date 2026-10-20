// Constructores de geometría.
// Cada uno devuelve { pos, nor, uv, idx }:
//   pos: posiciones x,y,z de cada vértice
//   nor: normales (hacia dónde "mira" la superficie, sirve para la luz)
//   uv:  coordenadas 2D sobre la superficie (para texturas y patrones)
//   idx: índices de a 3 → cada trío es un triángulo

const empty = () => ({ pos: [], nor: [], uv: [], idx: [] })

function pushVertex(g, p, n, uv) {
  g.pos.push(p[0], p[1], p[2])
  g.nor.push(n[0], n[1], n[2])
  g.uv.push(uv[0], uv[1])
  return g.pos.length / 3 - 1
}

/** Rectángulo en el plano XY mirando hacia +Z, centrado en el origen. uvScale permite UV en metros. */
export function quad(w, h, uvScale = [1, 1]) {
  const g = empty()
  const [su, sv] = uvScale
  const a = pushVertex(g, [-w / 2, -h / 2, 0], [0, 0, 1], [0, 0])
  const b = pushVertex(g, [w / 2, -h / 2, 0], [0, 0, 1], [su, 0])
  const c = pushVertex(g, [w / 2, h / 2, 0], [0, 0, 1], [su, sv])
  const d = pushVertex(g, [-w / 2, h / 2, 0], [0, 0, 1], [0, sv])
  g.idx.push(a, b, c, a, c, d)
  return g
}

/** Caja centrada en el origen. */
export function box(w, h, d) {
  const g = empty()
  const faces = [
    [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
    [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 0, 0], [0, 0, -1]],
    [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
    [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
  ]
  const half = [w / 2, h / 2, d / 2]
  for (const [n, u, v] of faces) {
    const corner = (su, sv) => [0, 1, 2].map((i) => (n[i] + u[i] * su + v[i] * sv) * half[i])
    const a = pushVertex(g, corner(-1, -1), n, [0, 0])
    const b = pushVertex(g, corner(1, -1), n, [1, 0])
    const c = pushVertex(g, corner(1, 1), n, [1, 1])
    const e = pushVertex(g, corner(-1, 1), n, [0, 1])
    g.idx.push(a, b, c, a, c, e)
  }
  return g
}

/** Esfera (la pelota). */
export function sphere(r, wSeg = 32, hSeg = 20) {
  const g = empty()
  for (let y = 0; y <= hSeg; y++) {
    const v = y / hSeg
    const th = v * Math.PI
    for (let x = 0; x <= wSeg; x++) {
      const u = x / wSeg
      const ph = u * Math.PI * 2
      const n = [-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th)]
      pushVertex(g, [n[0] * r, n[1] * r, n[2] * r], n, [u, v])
    }
  }
  for (let y = 0; y < hSeg; y++)
    for (let x = 0; x < wSeg; x++) {
      const a = y * (wSeg + 1) + x
      const b = a + wSeg + 1
      g.idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  return g
}

/** Cilindro vertical desde y=0 hasta y=h (postes, mango). */
export function cylinder(r, h, seg = 16) {
  const g = empty()
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2
    const n = [Math.cos(a), 0, Math.sin(a)]
    pushVertex(g, [n[0] * r, 0, n[2] * r], n, [i / seg, 0])
    pushVertex(g, [n[0] * r, h, n[2] * r], n, [i / seg, 1])
  }
  for (let i = 0; i < seg; i++) {
    const a = i * 2
    g.idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
  }
  return g
}

/** Mueve una geometría (para combinar piezas en una sola malla). */
export function translate(g, [tx, ty, tz]) {
  for (let i = 0; i < g.pos.length; i += 3) {
    g.pos[i] += tx
    g.pos[i + 1] += ty
    g.pos[i + 2] += tz
  }
  return g
}

/** Une varias geometrías en una. Menos mallas = menos llamadas de dibujo = más FPS. */
export function merge(...gs) {
  const out = empty()
  for (const g of gs) {
    const base = out.pos.length / 3
    out.pos.push(...g.pos)
    out.nor.push(...g.nor)
    out.uv.push(...g.uv)
    for (const i of g.idx) out.idx.push(i + base)
  }
  return out
}

// ---------------------------------------------------------------
// PALETA DE PÁDEL (medidas reales en metros, se escala al dibujarla)
// Origen = centro de la cara. La cara está en el plano XY y mira hacia +Z.
// Los agujeros NO están en la geometría: los "recorta" el shader (discard).
// Así la cámara puede pasar por uno de verdad.
// ---------------------------------------------------------------
export const PADDLE = { rx: 0.13, ry: 0.15, thickness: 0.038, holeSpacing: 0.024, holeRadius: 0.0068 }

const outline = (t) => {
  const { rx, ry } = PADDLE
  // Elipse levemente "lágrima": más ancha arriba que abajo
  return [rx * Math.sin(t) * (1 + 0.07 * Math.cos(t)), ry * Math.cos(t)]
}

export function paddleHead(seg = 72) {
  const g = empty()
  const h = PADDLE.thickness / 2
  for (const side of [1, -1]) {
    const n = [0, 0, side]
    const center = pushVertex(g, [0, 0, side * h], n, [0, 0])
    const first = g.pos.length / 3
    for (let i = 0; i < seg; i++) {
      const [x, y] = outline((i / seg) * Math.PI * 2)
      pushVertex(g, [x, y, side * h], n, [x, y])
    }
    for (let i = 0; i < seg; i++) {
      const a = first + i
      const b = first + ((i + 1) % seg)
      if (side > 0) g.idx.push(center, b, a)
      else g.idx.push(center, a, b)
    }
  }
  // Borde (canto) de la paleta
  const first = g.pos.length / 3
  for (let i = 0; i <= seg; i++) {
    const t = (i / seg) * Math.PI * 2
    const [x, y] = outline(t)
    const n = [x / PADDLE.rx ** 2, y / PADDLE.ry ** 2, 0]
    const l = Math.hypot(n[0], n[1])
    const nn = [n[0] / l, n[1] / l, 0]
    pushVertex(g, [x, y, h], nn, [x, y])
    pushVertex(g, [x, y, -h], nn, [x, y])
  }
  for (let i = 0; i < seg; i++) {
    const a = first + i * 2
    g.idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
  }
  return g
}

export function paddleHandle() {
  const { ry, thickness } = PADDLE
  const throat = translate(box(0.06, 0.07, thickness * 0.85), [0, -ry - 0.03, 0])
  const grip = translate(cylinder(0.019, 0.14, 14), [0, -ry - 0.2, 0])
  const cap = translate(cylinder(0.023, 0.012, 14), [0, -ry - 0.205, 0])
  return merge(throat, grip, cap)
}
