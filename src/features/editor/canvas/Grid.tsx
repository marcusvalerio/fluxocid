import { Group, Line } from 'react-konva'
import { cmToPx } from '../../../shared/lib/units'
import { useIsDarkMode } from '../../../shared/lib/useIsDarkMode'

interface GridProps {
  pxPerMeter: number
  camera: { x: number; y: number; zoom: number }
  stageWidth: number
  stageHeight: number
  /** Grid is clipped to the environment's physical bounds — no grid in the "no man's land" outside it. */
  envWidthPx: number
  envHeightPx: number
}

const MAJOR_STEP_M = 1

/** Kept deliberately faint (low opacity, not just a light color) so the environment floor and
 * the objects on it stay the visual focus — the grid is a measuring aid, not the subject. */
const GRID_COLOR_LIGHT = '#4B4F58'
const GRID_COLOR_DARK = '#8B8FA0'
const GRID_OPACITY = 0.12

export function Grid({ pxPerMeter, camera, stageWidth, stageHeight, envWidthPx, envHeightPx }: GridProps) {
  const gridColor = useIsDarkMode() ? GRID_COLOR_DARK : GRID_COLOR_LIGHT
  const majorStepPx = cmToPx(MAJOR_STEP_M * 100, pxPerMeter)

  const rawLeft = -camera.x / camera.zoom
  const rawTop = -camera.y / camera.zoom
  const rawRight = rawLeft + stageWidth / camera.zoom
  const rawBottom = rawTop + stageHeight / camera.zoom

  const visibleLeft = Math.max(0, rawLeft)
  const visibleTop = Math.max(0, rawTop)
  const visibleRight = Math.min(envWidthPx, rawRight)
  const visibleBottom = Math.min(envHeightPx, rawBottom)

  if (visibleRight <= visibleLeft || visibleBottom <= visibleTop) return null

  const startCol = Math.max(0, Math.floor(visibleLeft / majorStepPx))
  const endCol = Math.min(Math.ceil(envWidthPx / majorStepPx), Math.ceil(visibleRight / majorStepPx))
  const startRow = Math.max(0, Math.floor(visibleTop / majorStepPx))
  const endRow = Math.min(Math.ceil(envHeightPx / majorStepPx), Math.ceil(visibleBottom / majorStepPx))

  const lines = []
  for (let col = startCol; col <= endCol; col++) {
    const x = col * majorStepPx
    lines.push(
      <Line
        key={`v${col}`}
        points={[x, 0, x, envHeightPx]}
        stroke={gridColor}
        opacity={GRID_OPACITY}
        strokeWidth={1 / camera.zoom}
      />,
    )
  }
  for (let row = startRow; row <= endRow; row++) {
    const y = row * majorStepPx
    lines.push(
      <Line
        key={`h${row}`}
        points={[0, y, envWidthPx, y]}
        stroke={gridColor}
        opacity={GRID_OPACITY}
        strokeWidth={1 / camera.zoom}
      />,
    )
  }

  return (
    <Group clipFunc={(ctx) => ctx.rect(0, 0, envWidthPx, envHeightPx)}>{lines}</Group>
  )
}
