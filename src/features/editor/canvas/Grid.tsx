import { Line } from 'react-konva'
import { cmToPx } from '../../../shared/lib/units'

interface GridProps {
  pxPerMeter: number
  camera: { x: number; y: number; zoom: number }
  stageWidth: number
  stageHeight: number
}

const MAJOR_STEP_M = 1
const WORLD_EXTENT_M = 200 // generous bounds so panning far still shows grid; recalculated per view below

export function Grid({ pxPerMeter, camera, stageWidth, stageHeight }: GridProps) {
  const majorStepPx = cmToPx(MAJOR_STEP_M * 100, pxPerMeter)

  const worldLeft = -camera.x / camera.zoom
  const worldTop = -camera.y / camera.zoom
  const worldRight = worldLeft + stageWidth / camera.zoom
  const worldBottom = worldTop + stageHeight / camera.zoom

  const startCol = Math.floor(worldLeft / majorStepPx) - 1
  const endCol = Math.ceil(worldRight / majorStepPx) + 1
  const startRow = Math.floor(worldTop / majorStepPx) - 1
  const endRow = Math.ceil(worldBottom / majorStepPx) + 1

  const lines = []
  const maxLines = WORLD_EXTENT_M

  for (let col = startCol, count = 0; col <= endCol && count < maxLines; col++, count++) {
    const x = col * majorStepPx
    lines.push(
      <Line
        key={`v${col}`}
        points={[x, startRow * majorStepPx, x, endRow * majorStepPx]}
        stroke="#DCE0E6"
        strokeWidth={1 / camera.zoom}
      />,
    )
  }
  for (let row = startRow, count = 0; row <= endRow && count < maxLines; row++, count++) {
    const y = row * majorStepPx
    lines.push(
      <Line
        key={`h${row}`}
        points={[startCol * majorStepPx, y, endCol * majorStepPx, y]}
        stroke="#DCE0E6"
        strokeWidth={1 / camera.zoom}
      />,
    )
  }

  return <>{lines}</>
}
