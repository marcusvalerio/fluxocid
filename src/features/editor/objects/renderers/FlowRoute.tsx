import { Arrow } from 'react-konva'
import { CATEGORY_COLORS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

const FLOW_STYLE: Record<string, { strokeWidth: number; dash?: number[] }> = {
  people: { strokeWidth: 2 },
  forklift: { strokeWidth: 5 },
  material: { strokeWidth: 2, dash: [10, 6] },
}

/** A directional route segment: rotation 0deg points along +X (local "forward"). */
export function FlowRoute({ widthPx, lengthPx, obj }: ObjectRenderProps) {
  const flowType = String(obj.properties.flowType ?? 'people')
  const style = FLOW_STYLE[flowType] ?? FLOW_STYLE.people
  const midY = lengthPx / 2

  return (
    <Arrow
      points={[0, midY, widthPx, midY]}
      stroke={CATEGORY_COLORS.flow}
      fill={CATEGORY_COLORS.flow}
      strokeWidth={style.strokeWidth}
      dash={style.dash}
      pointerLength={Math.min(16, widthPx * 0.25)}
      pointerWidth={Math.min(14, widthPx * 0.2)}
      lineCap="round"
    />
  )
}
