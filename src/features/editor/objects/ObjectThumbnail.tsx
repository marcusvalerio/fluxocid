import { Group, Layer, Stage } from 'react-konva'
import { OBJECT_CATALOG } from './catalog'
import type { LayoutObject, ObjectTypeKey } from '../../../types/layout'

interface ObjectThumbnailProps {
  objectType: ObjectTypeKey
  width?: number
  height?: number
}

/**
 * Renders an object type's real technical drawing at a small, fixed size — using the exact same
 * `render` component the object uses on the canvas and in PNG export (see OBJECT_CATALOG,
 * ObjectRenderStatic). This is the "one symbol system" requirement (docs/DESIGN_SYSTEM.md § 6):
 * whatever appears in a library card is pixel-identical in spirit to what appears on the canvas,
 * because it's literally the same React component, not a separate icon set.
 *
 * A real object's own width/length ratio can be extreme (a wall is 300x20cm, 15:1) — left
 * unclamped, a thumbnail would render as a near-invisible sliver. The ratio is clamped to at most
 * 3:1 here so every symbol stays legible at icon scale; the canvas itself still uses the true
 * proportions (this component is only ever used for previews, never for the live editor object).
 */
export function ObjectThumbnail({ objectType, width = 120, height = 84 }: ObjectThumbnailProps) {
  const def = OBJECT_CATALOG[objectType]
  const Render = def.render
  const padding = 10
  const availW = width - padding * 2
  const availH = height - padding * 2

  const rawRatio = def.defaultWidth / def.defaultLength
  const clampedRatio = Math.min(3, Math.max(1 / 3, rawRatio))

  let widthPx: number
  let lengthPx: number
  if (availW / availH >= clampedRatio) {
    lengthPx = availH
    widthPx = availH * clampedRatio
  } else {
    widthPx = availW
    lengthPx = availW / clampedRatio
  }

  const previewObj: LayoutObject = {
    id: 'preview',
    objectType,
    category: def.category,
    x: 0,
    y: 0,
    width: def.defaultWidth,
    length: def.defaultLength,
    rotationDeg: 0,
    zIndex: 0,
    properties: { ...(def.defaultProperties ?? {}) },
  }

  return (
    <Stage width={width} height={height} listening={false}>
      <Layer listening={false}>
        <Group x={(width - widthPx) / 2} y={(height - lengthPx) / 2}>
          <Render obj={previewObj} widthPx={widthPx} lengthPx={lengthPx} compact />
        </Group>
      </Layer>
    </Stage>
  )
}
