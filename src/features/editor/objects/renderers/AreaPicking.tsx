import { Line, Rect, Text } from 'react-konva'
import type { ObjectRenderProps } from '../types'

const COLOR = '#7C3AED'

/** A picking zone: translucent tinted floor area plus a small basket pictogram, so it reads
 * distinctly from the generic Área object's plain dashed rectangle. */
export function AreaPicking({ widthPx, lengthPx, obj, compact }: ObjectRenderProps) {
  const label = obj.name ?? 'Picking'
  const iconSize = compact ? Math.min(widthPx, lengthPx) * 0.42 : Math.min(28, widthPx * 0.3, lengthPx * 0.5)
  const ix = compact ? (widthPx - iconSize) / 2 : 10
  const iy = compact ? (lengthPx - iconSize) / 2 + iconSize * 0.3 : 10

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={COLOR} opacity={0.1} stroke={COLOR} strokeWidth={1.5} dash={[8, 5]} />
      <Line
        points={[ix, iy, ix + iconSize, iy, ix + iconSize * 0.85, iy + iconSize * 0.7, ix + iconSize * 0.15, iy + iconSize * 0.7]}
        closed
        stroke={COLOR}
        strokeWidth={1.5}
        fill={COLOR}
        opacity={0.25}
      />
      <Line
        points={[ix + iconSize * 0.2, iy, ix + iconSize * 0.5, iy - iconSize * 0.35, ix + iconSize * 0.8, iy]}
        stroke={COLOR}
        strokeWidth={1.5}
        lineCap="round"
      />
      {!compact && (
        <Text text={label} width={widthPx} height={lengthPx} align="center" verticalAlign="middle" fill={COLOR} fontStyle="600" fontSize={14} listening={false} />
      )}
    </>
  )
}
