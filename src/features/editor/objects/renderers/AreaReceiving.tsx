import { Arrow, Rect, Text } from 'react-konva'
import { AREA_TYPE_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

const COLOR = AREA_TYPE_COLORS.receiving

/** A recebimento (inbound receiving) zone: translucent tinted floor area plus an inward-pointing
 * arrow pictogram — mirrors AreaShipping's arrow direction to read as the opposite flow. */
export function AreaReceiving({ widthPx, lengthPx, obj }: ObjectRenderProps) {
  const label = obj.name ?? 'Recebimento'
  const arrowSize = Math.min(30, widthPx * 0.35, lengthPx * 0.6)
  const cx = 10 + arrowSize / 2
  const cy = 10 + arrowSize / 2

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={COLOR} opacity={0.1} stroke={COLOR} strokeWidth={1.5} dash={[8, 5]} />
      <Arrow
        points={[cx + arrowSize / 2, cy, cx - arrowSize / 2, cy]}
        stroke={COLOR}
        fill={COLOR}
        strokeWidth={2.5}
        pointerLength={arrowSize * 0.35}
        pointerWidth={arrowSize * 0.3}
      />
      <Text text={label} width={widthPx} height={lengthPx} align="center" verticalAlign="middle" fill={COLOR} fontStyle="600" fontSize={14} listening={false} />
    </>
  )
}
