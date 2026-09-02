import { Rect } from 'react-konva'
import { useIsDarkMode } from '../../../shared/lib/useIsDarkMode'

interface EnvironmentProps {
  widthPx: number
  heightPx: number
  zoom: number
}

const LIGHT = { fill: '#F6F4F0', stroke: '#4B4F58', shadowColor: '#000000', shadowOpacity: 0.08 }
const DARK = { fill: '#20242D', stroke: '#454A56', shadowColor: '#000000', shadowOpacity: 0.35 }

/** The physical space being planned — a distinct "floor" so the room's real bounds read at a
 * glance, instead of objects floating in an undifferentiated infinite canvas. Reads as a plate
 * lifted above the surrounding "outside" area in both themes (lighter than its surroundings in
 * light mode via a soft shadow, and a lighter-than-background tone plus shadow in dark mode). */
export function Environment({ widthPx, heightPx, zoom }: EnvironmentProps) {
  const palette = useIsDarkMode() ? DARK : LIGHT

  return (
    <Rect
      x={0}
      y={0}
      width={widthPx}
      height={heightPx}
      fill={palette.fill}
      stroke={palette.stroke}
      strokeWidth={2 / zoom}
      shadowColor={palette.shadowColor}
      shadowBlur={12 / zoom}
      shadowOpacity={palette.shadowOpacity}
      listening={false}
    />
  )
}
