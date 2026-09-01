import { Rect, Text } from 'react-konva'
import { AREA_TYPE_COLORS, AREA_TYPE_LABELS } from '../../../../shared/lib/colors'
import type { ObjectRenderProps } from '../types'

export function Area({ widthPx, lengthPx, obj }: ObjectRenderProps) {
  const areaType = String(obj.properties.areaType ?? 'custom')
  const color = AREA_TYPE_COLORS[areaType] ?? AREA_TYPE_COLORS.custom
  const label = obj.name ?? AREA_TYPE_LABELS[areaType] ?? 'Área'

  return (
    <>
      <Rect width={widthPx} height={lengthPx} fill={color} opacity={0.12} stroke={color} strokeWidth={1.5} dash={[8, 5]} />
      <Text
        text={label}
        width={widthPx}
        height={lengthPx}
        align="center"
        verticalAlign="middle"
        fill={color}
        fontStyle="600"
        fontSize={14}
        listening={false}
      />
    </>
  )
}
