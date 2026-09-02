import { Arrow, Rect, Text } from 'react-konva'
import { AREA_TYPE_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

const COLOR = AREA_TYPE_COLORS.shipping

/** An expedição (outbound shipping) zone: translucent tinted floor area plus an outward-pointing
 * arrow pictogram, so it reads distinctly from the generic Área object. */
export function AreaShipping({ widthPx, lengthPx, obj, compact }: ObjectRenderProps) {
  const label = obj.name ?? 'Expedição'
  const arrowSize = compact ? Math.min(widthPx, lengthPx) * 0.6 : Math.min(30, widthPx * 0.35, lengthPx * 0.6)
  const cx = compact ? widthPx / 2 : 10 + arrowSize / 2
  const cy = compact ? lengthPx / 2 : 10 + arrowSize / 2

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={COLOR} opacity={0.1} stroke={COLOR} strokeWidth={1.5} dash={[8, 5]} />
      <Arrow
        points={[cx - arrowSize / 2, cy, cx + arrowSize / 2, cy]}
        stroke={COLOR}
        fill={COLOR}
        strokeWidth={2.5}
        pointerLength={arrowSize * 0.35}
        pointerWidth={arrowSize * 0.3}
      />
      {!compact && (
        <Text text={label} width={widthPx} height={lengthPx} align="center" verticalAlign="middle" fill={COLOR} fontStyle="600" fontSize={14} listening={false} />
      )}
    </>
  )
}
