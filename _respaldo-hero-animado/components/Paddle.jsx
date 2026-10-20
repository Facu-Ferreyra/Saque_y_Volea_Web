// Paleta de pádel dibujada en SVG.
// Se dibuja con el origen (0,0) en la mano y apuntando hacia ABAJO,
// así rotarla alrededor de (0,0) es como girar la muñeca.

const HEAD_CY = 170 // centro de la cara (coincide con headDist del layout)
const RX = 64
const RY = 74

// Agujeros de la cara: una grilla filtrada para que quede dentro del óvalo.
const holes = []
for (let gy = -3; gy <= 3; gy++) {
  for (let gx = -3; gx <= 3; gx++) {
    const x = gx * 15 + (gy % 2 ? 7.5 : 0)
    const y = gy * 15 + 6
    if ((x * x) / ((RX - 16) ** 2) + (y * y) / ((RY - 18) ** 2) <= 1) holes.push([x, y + HEAD_CY])
  }
}

export default function Paddle() {
  return (
    <g>
      {/* Mango con grip */}
      <rect x="-12" y="-14" width="24" height="82" rx="8" fill="var(--paddle-grip)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x="-12" y={-6 + i * 14} width="24" height="3" fill="var(--paddle-grip-line)" />
      ))}
      {/* Cuello / garganta */}
      <path d="M -12 64 L -26 104 L 26 104 L 12 64 Z" fill="var(--paddle-frame)" />
      {/* Marco y cara */}
      <ellipse cx="0" cy={HEAD_CY} rx={RX + 7} ry={RY + 7} fill="var(--paddle-frame)" />
      <ellipse cx="0" cy={HEAD_CY} rx={RX} ry={RY} fill="var(--paddle-face)" />
      {/* Franja decorativa del color de la pelota */}
      <path
        d={`M ${-RX + 4} ${HEAD_CY + 30} Q 0 ${HEAD_CY + 54} ${RX - 4} ${HEAD_CY + 30}`}
        stroke="var(--ball)"
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
      />
      {holes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.6" fill="var(--paddle-hole)" />
      ))}
    </g>
  )
}
