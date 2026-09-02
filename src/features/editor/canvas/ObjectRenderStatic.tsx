import { Group } from 'react-konva'
import { OBJECT_CATALOG } from '../objects/catalog'
import { cmToPx } from '../../../shared/lib/units'
import type { LayoutObject } from '../../../types/layout'

interface ObjectRenderStaticProps {
  obj: LayoutObject
  pxPerMeter: number
}

/** Non-interactive rendering of a single object — the same visual the live editor shows via
 * ObjectNode, minus drag/selection/touch handling. Used for PNG export, where only the picture
 * matters and none of the editing chrome (selection outlines, transformer) should appear. */
export function ObjectRenderStatic({ obj, pxPerMeter }: ObjectRenderStaticProps) {
  const def = OBJECT_CATALOG[obj.objectType]
  const widthPx = cmToPx(obj.width, pxPerMeter)
  const lengthPx = cmToPx(obj.length, pxPerMeter)
  const centerXPx = cmToPx(obj.x + obj.width / 2, pxPerMeter)
  const centerYPx = cmToPx(obj.y + obj.length / 2, pxPerMeter)
  const Render = def.render

  return (
    <Group
      x={centerXPx}
      y={centerYPx}
      offsetX={widthPx / 2}
      offsetY={lengthPx / 2}
      rotation={obj.rotationDeg}
      listening={false}
    >
      <Render obj={obj} widthPx={widthPx} lengthPx={lengthPx} />
    </Group>
  )
}
