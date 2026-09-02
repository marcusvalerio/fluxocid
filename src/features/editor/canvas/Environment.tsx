import { Rect } from 'react-konva'

interface EnvironmentProps {
  widthPx: number
  heightPx: number
  zoom: number
}

/** The physical space being planned — a distinct "floor" so the room's real bounds read at a
 * glance, instead of objects floating in an undifferentiated infinite canvas. */
export function Environment({ widthPx, heightPx, zoom }: EnvironmentProps) {
  return (
    <Rect
      x={0}
      y={0}
      width={widthPx}
      height={heightPx}
      fill="#FFFFFF"
      stroke="#1A1F27"
      strokeWidth={2 / zoom}
      shadowColor="#000000"
      shadowBlur={12 / zoom}
      shadowOpacity={0.08}
      listening={false}
    />
  )
}
