// Renderer WebGL2 de la cancha.
// Crea las mallas UNA vez (cancha, red, vidrios, pelota, paleta) y en cada frame
// solo cambia matrices y uniforms según lo que diga la línea de tiempo.

import { VERT, FRAG } from './shaders.js'
import * as G from './geometry.js'
import {
  identity, chain, translation, scaling, rotationX, rotationY, perspective, lookAt, invert, mul,
  sub, normalize, cross,
} from './math3d.js'

const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]

export const PALETTE = {
  skyTop: hex('#03070f'),
  skyHorizon: hex('#152754'),
  structure: hex('#141a28'),
  netMesh: hex('#d5dbe6'),
  fence: hex('#8a96ad'),
  glass: hex('#9cc4ff'),
  lamp: hex('#fff3d0'),
  handle: hex('#151c30'),
}

export const LIGHTS = [
  [-5.4, 6.2, -4.5], [5.4, 6.2, -4.5], [-5.4, 6.2, 4.5], [5.4, 6.2, 4.5],
]

function compile(gl, type, src) {
  const s = gl.createShader(type)
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s))
  return s
}

/** Sube una geometría a la GPU y devuelve un "mesh" listo para dibujar. */
function upload(gl, prog, geo) {
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  const attr = (name, data, size) => {
    const loc = gl.getAttribLocation(prog, name)
    if (loc < 0) return
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0)
  }
  attr('aPos', geo.pos, 3)
  attr('aNor', geo.nor, 3)
  attr('aUv', geo.uv, 2)
  const ib = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib)
  const big = geo.pos.length / 3 > 65535
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, big ? new Uint32Array(geo.idx) : new Uint16Array(geo.idx), gl.STATIC_DRAW)
  gl.bindVertexArray(null)
  return { vao, count: geo.idx.length, type: big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT }
}

/** Construye la estructura fija: postes, marcos, reflectores. */
function buildStructure() {
  const parts = []
  const post = (x, z, h = 4) => parts.push(G.translate(G.box(0.07, h, 0.07), [x, h / 2, z]))
  for (let z = -10; z <= 10; z += 2.5) {
    post(-5.03, z)
    post(5.03, z)
  }
  for (const x of [-5, 5]) post(x, -10.03) // solo esquinas: el título del cuadro final queda limpio
  // Travesaños superiores
  parts.push(G.translate(G.box(0.06, 0.06, 20), [-5.03, 4, 0]))
  parts.push(G.translate(G.box(0.06, 0.06, 20), [5.03, 4, 0]))
  parts.push(G.translate(G.box(10, 0.06, 0.06), [0, 4, -10.03]))
  parts.push(G.translate(G.box(10, 0.06, 0.06), [0, 3, -10.03]))
  // Postes de la red
  parts.push(G.translate(G.cylinder(0.04, 0.92), [-5.12, 0, 0]))
  parts.push(G.translate(G.cylinder(0.04, 0.92), [5.12, 0, 0]))
  // Columnas de los reflectores
  for (const [x, y, z] of LIGHTS) {
    parts.push(G.translate(G.cylinder(0.06, y), [x + Math.sign(x) * 0.25, 0, z]))
    parts.push(G.translate(G.box(0.5, 0.05, 0.05), [x + Math.sign(x) * 0.05, y, z]))
  }
  return G.merge(...parts)
}

/**
 * @param {HTMLCanvasElement} canvas
 * @returns renderer o null si el navegador no tiene WebGL2
 */
export function createRenderer(canvas) {
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' })
  if (!gl) return null

  const prog = gl.createProgram()
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG))
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog))
  gl.useProgram(prog)

  // Ubicación de cada uniform (se busca una vez y se reutiliza)
  const U = {}
  const names = ['uProj', 'uView', 'uModel', 'uMode', 'uColor', 'uAlpha', 'uCam', 'uLights', 'uSkyTop',
    'uSkyHorizon', 'uInvProjView', 'uTex', 'uGrid', 'uPaddle', 'uHoleR', 'uCut', 'uEnv', 'uEnvParams']
  for (const n of names) U[n] = gl.getUniformLocation(prog, n)

  // ---------- Mallas ----------
  const M = {
    sky: upload(gl, prog, { pos: [-1, -1, 0, 3, -1, 0, -1, 3, 0], nor: [0, 0, 1, 0, 0, 1, 0, 0, 1], uv: [0, 0, 0, 0, 0, 0], idx: [0, 1, 2] }),
    floor: upload(gl, prog, G.quad(90, 90)),
    structure: upload(gl, prog, buildStructure()),
    ball: upload(gl, prog, G.sphere(1, 36, 24)),
    paddleHead: upload(gl, prog, G.paddleHead()),
    paddleHandle: upload(gl, prog, G.paddleHandle()),
    unit: upload(gl, prog, G.quad(1, 1)),
    netTape: upload(gl, prog, G.box(10.24, 0.05, 0.012)),
    lampHead: upload(gl, prog, G.box(0.5, 0.18, 0.3)),
  }
  // Mallas de malla metálica / vidrio: UV en metros para que el patrón tenga tamaño real.
  const meshQuad = (w, h) => upload(gl, prog, G.quad(w, h, [w, h]))
  const fence = {
    side: meshQuad(12, 4), // laterales centrales (alambrado)
    sideTop: meshQuad(4, 1), // arriba de los vidrios laterales
    backTop: meshQuad(10, 1),
    net: meshQuad(10.24, 0.86),
  }

  const glassPanels = [
    { m: chain(translation(0, 1.5, -10), scaling(10, 3, 1)) },
    ...[-1, 1].flatMap((sx) =>
      [-8, 8].map((z) => ({ m: chain(translation(sx * 5, 1.5, z), rotationY(Math.PI / 2), scaling(4, 3, 1)) })),
    ),
  ] // el vidrio de fondo de nuestro lado no se dibuja: la cámara arranca "parada" ahí

  // ---------- Entorno 360° (opcional) ----------
  const envTex = gl.createTexture()
  let envOn = false
  let envParams = [0, 0, 1]
  /**
   * Usa una foto 360° equirectangular (proporción 2:1) como fondo del club.
   * yawDeg gira la foto para alinearla con la cancha; brightness la oscurece para la noche.
   */
  function setEnvironment(img, { yawDeg = 0, brightness = 0.85 } = {}) {
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, envTex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    // Sin mipmaps: evita una costura visible donde la foto "da la vuelta"
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.activeTexture(gl.TEXTURE0)
    envOn = true
    envParams = [1, (yawDeg * Math.PI) / 180, brightness]
  }

  // ---------- Estado fijo ----------
  gl.uniform3fv(U.uLights, LIGHTS.flat())
  gl.uniform3fv(U.uSkyTop, PALETTE.skyTop)
  gl.uniform3fv(U.uSkyHorizon, PALETTE.skyHorizon)
  gl.uniform3f(U.uPaddle, G.PADDLE.rx, G.PADDLE.ry, G.PADDLE.holeSpacing)
  gl.uniform1f(U.uHoleR, G.PADDLE.holeRadius)
  gl.uniform1i(U.uTex, 0)
  gl.uniform1i(U.uEnv, 1)
  gl.uniform1f(U.uCut, 99) // sin recorte para todo lo que no es la paleta
  gl.enable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)

  let width = 1
  let height = 1
  function resize(cssW, cssH, dpr) {
    width = Math.max(1, Math.round(cssW * dpr))
    height = Math.max(1, Math.round(cssH * dpr))
    canvas.width = width
    canvas.height = height
  }

  const draw = (mesh, mode, model, color = [1, 1, 1], alpha = 1) => {
    gl.uniform1i(U.uMode, mode)
    gl.uniformMatrix4fv(U.uModel, false, model)
    gl.uniform3fv(U.uColor, color)
    gl.uniform1f(U.uAlpha, alpha)
    gl.bindVertexArray(mesh.vao)
    gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0)
  }

  /** Dibuja un frame. `f` viene de computeCourtFrame (timeline3d.js). */
  function render(f) {
    const aspect = width / height
    const { eye, target, fov } = f.camera
    const proj = perspective(fov, aspect, 0.003, 90)
    const view = lookAt(eye, target)
    const pv = mul(proj, view)

    gl.viewport(0, 0, width, height)
    gl.clearColor(...PALETTE.skyHorizon, 1)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.uniformMatrix4fv(U.uProj, false, proj)
    gl.uniformMatrix4fv(U.uView, false, view)
    gl.uniformMatrix4fv(U.uInvProjView, false, invert(pv))
    gl.uniform3fv(U.uCam, eye)
    gl.uniform3fv(U.uEnvParams, envParams)

    // 1) Opacos
    gl.disable(gl.BLEND)
    gl.depthMask(false)
    draw(M.sky, 7, identity())
    gl.depthMask(true)
    // Con foto 360, el piso 3D cubre solo la cancha y un margen: más allá se ve la foto.
    draw(M.floor, 1, envOn ? chain(rotationX(-Math.PI / 2), scaling(16 / 90, 26 / 90, 1)) : rotationX(-Math.PI / 2))
    draw(M.structure, 0, identity(), PALETTE.structure)
    draw(M.netTape, 0, translation(0, 0.88, 0), [0.92, 0.93, 0.96])
    for (const [x, y, z] of LIGHTS) draw(M.lampHead, 3, translation(x, y + 0.1, z), PALETTE.lamp, 1)

    if (f.ball.visible) {
      const { pos, spin, squash, radius } = f.ball
      const model = chain(translation(...pos), scaling(radius * (1 + (1 - squash) * 0.5), radius * squash, radius), rotationX(spin))
      draw(M.ball, 6, model)
    }
    if (f.paddle.visible) {
      gl.uniform1f(U.uCut, f.paddle.cut)
      draw(M.paddleHead, 5, f.paddle.matrix)
      draw(M.paddleHandle, 0, f.paddle.matrix, PALETTE.handle)
      gl.uniform1f(U.uCut, 99)
    }

    // 2) Transparentes (sin escribir profundidad, de atrás hacia adelante)
    gl.enable(gl.BLEND)
    gl.depthMask(false)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA) // premultiplicado
    if (f.ball.visible) {
      const s = f.shadow
      draw(M.unit, 8, chain(translation(s.pos[0], 0.012, s.pos[2]), rotationX(-Math.PI / 2), scaling(s.size)), [0, 0, 0], s.alpha)
    }

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.uniform2f(U.uGrid, 0.05, 0.006)
    for (const sx of [-1, 1]) {
      draw(fence.side, 2, chain(translation(sx * 5, 2, 0), rotationY(Math.PI / 2)), PALETTE.fence, 0.55)
      for (const z of [-8, 8]) draw(fence.sideTop, 2, chain(translation(sx * 5, 3.5, z), rotationY(Math.PI / 2)), PALETTE.fence, 0.55)
    }
    draw(fence.backTop, 2, translation(0, 3.5, -10), PALETTE.fence, 0.55)
    gl.uniform2f(U.uGrid, 0.045, 0.004)
    draw(fence.net, 2, translation(0, 0.43, 0), PALETTE.netMesh, 0.5)
    for (const g of glassPanels) draw(M.unit, 3, g.m, PALETTE.glass, 0.045)

    // 3) Brillos de los reflectores (suma de luz, siempre miran a la cámara)
    gl.blendFunc(gl.ONE, gl.ONE)
    const fwd = normalize(sub(target, eye))
    const right = normalize(cross(fwd, [0, 1, 0]))
    const up = cross(right, fwd)
    for (const [x, y, z] of LIGHTS) {
      const s = 3.2
      const bb = new Float32Array([right[0] * s, right[1] * s, right[2] * s, 0, up[0] * s, up[1] * s, up[2] * s, 0, -fwd[0], -fwd[1], -fwd[2], 0, x, y + 0.05, z, 1])
      draw(M.unit, 8, bb, PALETTE.lamp, 0.55)
    }
    gl.depthMask(true)
  }

  function dispose() {
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  }

  return { gl, resize, render, setEnvironment, dispose }
}
