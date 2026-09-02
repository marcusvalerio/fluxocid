import { Label, Line, Tag, Text } from 'react-konva'
import { cmToPx, formatMeters } from '../../../shared/lib/units'

export interface SnapGuides {
  /** World position (cm) of a vertical object-snap guide, if matched on this move. */
  x?: number
  /** World position (cm) of a horizontal object-snap guide, if matched on this move. */
  y?: number
  /** Current world position (cm) of the object being dragged/transformed, for the coordinate readout. */
  readoutXCm: number
  readoutYCm: number
}

interface GuideLinesProps {
  guides: SnapGuides | null
  pxPerMeter: number
  camera: { x: number; y: number; zoom: number }
  stageWidth: number
  stageHeight: number
}

const GUIDE_COLOR = '#0796D7'

export function GuideLines({ guides, pxPerMeter, camera, stageWidth, stageHeight }: GuideLinesProps) {
  if (!guides) return null

  const worldTop = -camera.y / camera.zoom
  const worldBottom = worldTop + stageHeight / camera.zoom
  const worldLeft = -camera.x / camera.zoom
  const worldRight = worldLeft + stageWidth / camera.zoom

  const readoutXPx = cmToPx(guides.readoutXCm, pxPerMeter)
  const readoutYPx = cmToPx(guides.readoutYCm, pxPerMeter)

  return (
    <>
      {guides.x !== undefined && (
        <Line
          points={[cmToPx(guides.x, pxPerMeter), worldTop, cmToPx(guides.x, pxPerMeter), worldBottom]}
          stroke={GUIDE_COLOR}
          strokeWidth={1.5 / camera.zoom}
          dash={[6 / camera.zoom, 4 / camera.zoom]}
          listening={false}
        />
      )}
      {guides.y !== undefined && (
        <Line
          points={[worldLeft, cmToPx(guides.y, pxPerMeter), worldRight, cmToPx(guides.y, pxPerMeter)]}
          stroke={GUIDE_COLOR}
          strokeWidth={1.5 / camera.zoom}
          dash={[6 / camera.zoom, 4 / camera.zoom]}
          listening={false}
        />
      )}
      <Label x={readoutXPx} y={readoutYPx - 34 / camera.zoom} listening={false} scaleX={1 / camera.zoom} scaleY={1 / camera.zoom}>
        <Tag fill="#08080C" cornerRadius={4} opacity={0.85} />
        <Text
          text={`X: ${formatMeters(guides.readoutXCm)} m   Y: ${formatMeters(guides.readoutYCm)} m`}
          fill="#FFFFFF"
          fontSize={12}
          padding={6}
        />
      </Label>
    </>
  )
}
