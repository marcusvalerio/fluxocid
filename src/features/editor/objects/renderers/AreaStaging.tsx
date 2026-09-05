import { Rect, Text } from 'react-konva'
import type { ObjectRenderProps } from '../types'

const COLOR = '#D97706'

/** A staging zone: translucent tinted floor area plus a stacked-boxes pictogram, so it reads
 * distinctly from the generic Área object's plain dashed rectangle. */
export function AreaStaging({ widthPx, lengthPx, obj, compact }: ObjectRenderProps) {
  const label = obj.name ?? 'Staging'
  const box = compact ? Math.min(widthPx, lengthPx) * 0.28 : Math.min(16, widthPx * 0.2, lengthPx * 0.4)
  const ix = compact ? (widthPx - box * 1.55) / 2 : 10
  const iy = compact ? (lengthPx - box * 1.4) / 2 : 10

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={COLOR} opacity={0.1} stroke={COLOR} strokeWidth={1.5} dash={[8, 5]} />
      <Rect x={ix} y={iy + box * 0.4} width={box} height={box} stroke={COLOR} strokeWidth={1.5} fill={COLOR} opacity={0.25} />
      <Rect x={ix + box * 0.55} y={iy} width={box} height={box} stroke={COLOR} strokeWidth={1.5} fill={COLOR} opacity={0.35} />
      {!compact && (
        <Text text={label} width={widthPx} height={lengthPx} align="center" verticalAlign="middle" fill={COLOR} fontStyle="600" fontSize={14} listening={false} />
      )}
    </>
  )
}
