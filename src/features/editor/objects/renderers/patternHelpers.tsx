import { Line } from 'react-konva'

/**
 * A row of chevrons ">" spaced along the longer axis of a widthPx×lengthPx box, pointing along
 * that axis — the shared "flow direction" motif used by corridors and conveyors.
 */
export function buildChevrons(widthPx: number, lengthPx: number, color: string, opacity = 0.5) {
  const horizontal = widthPx >= lengthPx
  const laneLength = horizontal ? widthPx : lengthPx
  const laneThickness = horizontal ? lengthPx : widthPx
  const chevronSize = Math.min(14, laneThickness * 0.35)
  const step = Math.max(chevronSize * 3, 40)

  const chevrons = []
  for (let pos = step / 2; pos < laneLength; pos += step) {
    const cx = horizontal ? pos : widthPx / 2
    const cy = horizontal ? lengthPx / 2 : pos
    const points = horizontal
      ? [cx - chevronSize / 2, cy - chevronSize / 2, cx + chevronSize / 2, cy, cx - chevronSize / 2, cy + chevronSize / 2]
      : [cx - chevronSize / 2, cy - chevronSize / 2, cx, cy + chevronSize / 2, cx + chevronSize / 2, cy - chevronSize / 2]
    chevrons.push(
      <Line
        key={pos}
        points={points}
        stroke={color}
        strokeWidth={1.5}
        opacity={opacity}
        lineCap="round"
        lineJoin="round"
      />,
    )
  }
  return chevrons
}

/** Diagonal 45° hatch lines clipped to a widthPx×lengthPx box — the shared "restricted surface"
 * texture used by docks and hazard-marked safety zones. */
export function buildDiagonalHatch(widthPx: number, lengthPx: number, color: string, opacity = 0.5, stepDivisor = 6) {
  const hatchLines = []
  const step = Math.max(8, widthPx / stepDivisor)
  for (let x = -lengthPx; x < widthPx; x += step) {
    hatchLines.push(
      <Line
        key={x}
        points={[x, lengthPx, x + lengthPx, 0]}
        stroke={color}
        strokeWidth={1}
        opacity={opacity}
      />,
    )
  }
  return hatchLines
}
