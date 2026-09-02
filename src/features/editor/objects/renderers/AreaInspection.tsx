import { Line, Rect, Text } from 'react-konva'
import type { ObjectRenderProps } from '../types'

const COLOR = '#0EA5E9'

/** A conference/inspection zone: translucent tinted floor area plus a clipboard-checkmark
 * pictogram. */
export function AreaInspection({ widthPx, lengthPx, obj }: ObjectRenderProps) {
  const label = obj.name ?? 'Conferência'
  const iconSize = Math.min(24, widthPx * 0.28, lengthPx * 0.5)
  const ix = 10
  const iy = 10

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={COLOR} opacity={0.1} stroke={COLOR} strokeWidth={1.5} dash={[8, 5]} />
      <Rect x={ix} y={iy} width={iconSize * 0.75} height={iconSize} stroke={COLOR} strokeWidth={1.5} fill="#FFFFFF" />
      <Line
        points={[ix + iconSize * 0.15, iy + iconSize * 0.55, ix + iconSize * 0.35, iy + iconSize * 0.75, ix + iconSize * 0.65, iy + iconSize * 0.25]}
        stroke={COLOR}
        strokeWidth={1.8}
        lineCap="round"
        lineJoin="round"
      />
      <Text text={label} width={widthPx} height={lengthPx} align="center" verticalAlign="middle" fill={COLOR} fontStyle="600" fontSize={14} listening={false} />
    </>
  )
}
