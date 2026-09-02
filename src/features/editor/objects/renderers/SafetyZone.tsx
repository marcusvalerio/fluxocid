import { Group, Rect } from 'react-konva'
import { buildDiagonalHatch } from './patternHelpers'
import type { ObjectRenderProps } from '../types'

const AMBER = '#D97706'
const DARK = '#1A1F27'

/** A safety zone: black-and-amber hazard hatching, the universal caution-tape floor marking —
 * unmistakably different from every other area/flow object. */
export function SafetyZone({ widthPx, lengthPx }: ObjectRenderProps) {
  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={DARK} opacity={0.08} stroke={AMBER} strokeWidth={2} />
      <Group clipFunc={(ctx) => ctx.rect(0, 0, widthPx, lengthPx)}>
        {buildDiagonalHatch(widthPx, lengthPx, AMBER, 0.7, 5)}
      </Group>
    </>
  )
}
