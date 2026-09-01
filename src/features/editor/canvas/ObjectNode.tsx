import { Group, Rect } from 'react-konva'
import type Konva from 'konva'
import { OBJECT_CATALOG } from '../objects/catalog'
import { useEditorStore } from '../state/useEditorStore'
import { cmToPx, pxToCm } from '../../../shared/lib/units'
import { snapToGrid } from '../../../shared/lib/geometry'
import type { LayoutObject } from '../../../types/layout'

interface ObjectNodeProps {
  obj: LayoutObject
  pxPerMeter: number
  selected: boolean
  onSelect: (id: string) => void
}

export function ObjectNode({ obj, pxPerMeter, selected, onSelect }: ObjectNodeProps) {
  const moveObjectLive = useEditorStore((s) => s.moveObjectLive)
  const commitObject = useEditorStore((s) => s.commitObject)
  const gridStepM = useEditorStore((s) => s.gridStepM)
  const snapEnabled = useEditorStore((s) => s.snapEnabled)

  const def = OBJECT_CATALOG[obj.objectType]
  const widthPx = cmToPx(obj.width, pxPerMeter)
  const lengthPx = cmToPx(obj.length, pxPerMeter)
  const centerXPx = cmToPx(obj.x + obj.width / 2, pxPerMeter)
  const centerYPx = cmToPx(obj.y + obj.length / 2, pxPerMeter)
  const Render = def.render

  function centerPxToTopLeftCm(centerXPxNow: number, centerYPxNow: number) {
    const stepCm = gridStepM * 100
    let x = pxToCm(centerXPxNow, pxPerMeter) - obj.width / 2
    let y = pxToCm(centerYPxNow, pxPerMeter) - obj.length / 2
    if (snapEnabled) {
      x = snapToGrid(x, stepCm)
      y = snapToGrid(y, stepCm)
    }
    return { x, y }
  }

  function handleDragMove(e: Konva.KonvaEventObject<DragEvent>) {
    const { x, y } = centerPxToTopLeftCm(e.target.x(), e.target.y())
    moveObjectLive(obj.id, x, y)
  }

  function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
    const { x, y } = centerPxToTopLeftCm(e.target.x(), e.target.y())
    commitObject(obj.id, { x, y })
  }

  return (
    <Group
      x={centerXPx}
      y={centerYPx}
      offsetX={widthPx / 2}
      offsetY={lengthPx / 2}
      rotation={obj.rotationDeg}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(obj.id)}
      onTap={() => onSelect(obj.id)}
    >
      <Render obj={obj} widthPx={widthPx} lengthPx={lengthPx} />
      {selected && (
        <Rect width={widthPx} height={lengthPx} stroke="#2563EB" strokeWidth={2} listening={false} />
      )}
    </Group>
  )
}
