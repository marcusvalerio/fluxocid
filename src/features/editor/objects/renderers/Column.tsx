import { Group, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import { buildDiagonalHatch } from './patternHelpers'
import type { ObjectRenderProps } from '../types'

/** Top-down structural column/pillar: a solid hatched square, the standard architectural symbol
 * for a load-bearing post seen from above — distinct from Wall's plain solid bar. */
export function Column({ widthPx, lengthPx }: ObjectRenderProps) {
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={CATEGORY_COLORS.structure} opacity={0.25} stroke={CATEGORY_COLORS.structure} strokeWidth={2} />
      <Group clipFunc={(ctx) => ctx.rect(0, 0, widthPx, lengthPx)}>
        {buildDiagonalHatch(widthPx, lengthPx, CATEGORY_COLORS.structure, 0.6, 4)}
      </Group>
    </>
  )
}
