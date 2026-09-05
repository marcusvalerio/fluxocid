export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface BezierRoute {
  /** [p0x, p0y, c0x, c0y, c1x, c1y, p1x, p1y] — Konva's `bezier` point format for Line/Arrow. */
  points: number[]
  /** Point at t=0.5 along the curve, for label placement. */
  mid: { x: number; y: number }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/** Routes a smooth cubic-bezier connector between two rectangular boxes, exiting/entering
 * perpendicular to whichever pair of edges faces the other box (right→left, left→right,
 * bottom→top or top→bottom — mirroring how directional flowchart connectors are usually drawn).
 * This is a heuristic, not a full obstacle-avoidance router: for the small node counts a Fluxo
 * board realistically has, exiting perpendicular to the box and bowing toward the target already
 * keeps the curve from cutting diagonally through boxes sitting between the two endpoints, which
 * is what "roteamento básico" calls for. */
export function routeConnection(fromBox: Box, toBox: Box): BezierRoute {
  const c1 = { x: fromBox.x + fromBox.width / 2, y: fromBox.y + fromBox.height / 2 }
  const c2 = { x: toBox.x + toBox.width / 2, y: toBox.y + toBox.height / 2 }
  const dx = c2.x - c1.x
  const dy = c2.y - c1.y

  if (dx === 0 && dy === 0) {
    return { points: [c1.x, c1.y, c1.x, c1.y, c1.x, c1.y, c1.x, c1.y], mid: c1 }
  }

  const horizontal = Math.abs(dx) >= Math.abs(dy)

  let start: { x: number; y: number }
  let end: { x: number; y: number }
  let cp1: { x: number; y: number }
  let cp2: { x: number; y: number }

  if (horizontal) {
    const exitRight = dx > 0
    start = { x: exitRight ? fromBox.x + fromBox.width : fromBox.x, y: c1.y }
    end = { x: exitRight ? toBox.x : toBox.x + toBox.width, y: c2.y }
    const handleLen = clamp(Math.abs(end.x - start.x) * 0.5, 24, 140)
    cp1 = { x: start.x + (exitRight ? handleLen : -handleLen), y: start.y }
    cp2 = { x: end.x - (exitRight ? handleLen : -handleLen), y: end.y }
  } else {
    const exitDown = dy > 0
    start = { x: c1.x, y: exitDown ? fromBox.y + fromBox.height : fromBox.y }
    end = { x: c2.x, y: exitDown ? toBox.y : toBox.y + toBox.height }
    const handleLen = clamp(Math.abs(end.y - start.y) * 0.5, 24, 140)
    cp1 = { x: start.x, y: start.y + (exitDown ? handleLen : -handleLen) }
    cp2 = { x: end.x, y: end.y - (exitDown ? handleLen : -handleLen) }
  }

  const mid = {
    x: 0.125 * start.x + 0.375 * cp1.x + 0.375 * cp2.x + 0.125 * end.x,
    y: 0.125 * start.y + 0.375 * cp1.y + 0.375 * cp2.y + 0.125 * end.y,
  }

  return {
    points: [start.x, start.y, cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y],
    mid,
  }
}
