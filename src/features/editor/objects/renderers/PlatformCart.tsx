import { Circle, Line, Rect } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

/** A platform/load cart: a flat deck with four corner wheels and a push handle on the trailing
 * short edge (rotation 0deg = handle at -X, pushed toward +X). */
export function PlatformCart({ widthPx, lengthPx }: ObjectRenderProps) {
  const wheelRadius = Math.min(5, widthPx * 0.06, lengthPx * 0.06)
  const inset = wheelRadius * 1.4
  const wheels = [
    [inset, inset],
    [widthPx - inset, inset],
    [inset, lengthPx - inset],
    [widthPx - inset, lengthPx - inset],
  ]

  return (
    <>
      <Line points={[-widthPx * 0.08, lengthPx * 0.3, -widthPx * 0.08, lengthPx * 0.7]} stroke={CATEGORY_COLORS.equipment} strokeWidth={3} lineCap="round" />
      <Rect width={widthPx} height={lengthPx} fill={CATEGORY_COLORS.equipment} opacity={0.85} cornerRadius={2} />
      {wheels.map(([x, y]) => (
        <Circle key={`${x}-${y}`} x={x} y={y} radius={wheelRadius} fill="#1E3A8A" />
      ))}
    </>
  )
}
