import { Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import { buildChevrons } from './patternHelpers'
import type { ObjectRenderProps } from '../types'

/** Drive-in racking: continuous storage lanes with no cross-bay posts (forklifts drive directly
 * into the lane) plus chevrons marking the travel direction — distinct from Rack's bay-divided
 * framing. */
export function DriveIn({ widthPx, lengthPx }: ObjectRenderProps) {
  const lanes = 3
  const lines = []
  for (let i = 1; i < lanes; i++) {
    const x = (widthPx / lanes) * i
    lines.push(<Line key={i} points={[x, 0, x, lengthPx]} stroke={CATEGORY_COLORS.storage} strokeWidth={1.5} opacity={0.6} />)
  }
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill="#FEF3E2" stroke={CATEGORY_COLORS.storage} strokeWidth={2} />
      {lines}
      {buildChevrons(widthPx, lengthPx, CATEGORY_COLORS.storage, 0.55)}
    </>
  )
}
