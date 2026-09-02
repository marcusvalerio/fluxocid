import { Arrow, Label, Tag, Text } from 'react-konva'
import { FLOW_CONNECTION_STYLE, FLOW_NODE_SIZE, type FlowConnection, type FlowNode } from '../../../types/flow'

interface FlowConnectionShapeProps {
  connection: FlowConnection
  fromNode: FlowNode
  toNode: FlowNode
  selected: boolean
  onSelect: (id: string) => void
}

const { width, height } = FLOW_NODE_SIZE

function clipToBorder(cx: number, cy: number, towardX: number, towardY: number): { x: number; y: number } {
  const dx = towardX - cx
  const dy = towardY - cy
  if (dx === 0 && dy === 0) return { x: cx, y: cy }
  const halfW = width / 2
  const halfH = height / 2
  const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity
  const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity
  const scale = Math.min(scaleX, scaleY)
  return { x: cx + dx * scale, y: cy + dy * scale }
}

/** Creates a smooth, React-Flow-like route using intermediate points and Konva's spline tension. */
function getSmoothPoints(start: { x: number; y: number }, end: { x: number; y: number }) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const horizontal = Math.abs(dx) >= Math.abs(dy)
  const bend = Math.max(36, Math.min(140, (horizontal ? Math.abs(dx) : Math.abs(dy)) * 0.42))
  if (horizontal) {
    const direction = dx >= 0 ? 1 : -1
    return [
      start.x, start.y,
      start.x + bend * direction, start.y,
      end.x - bend * direction, end.y,
      end.x, end.y,
    ]
  }
  const direction = dy >= 0 ? 1 : -1
  return [
    start.x, start.y,
    start.x, start.y + bend * direction,
    end.x, end.y - bend * direction,
    end.x, end.y,
  ]
}

export function FlowConnectionShape({ connection, fromNode, toNode, selected, onSelect }: FlowConnectionShapeProps) {
  const style = FLOW_CONNECTION_STYLE[connection.flowType]
  const fromCenter = { x: fromNode.x + width / 2, y: fromNode.y + height / 2 }
  const toCenter = { x: toNode.x + width / 2, y: toNode.y + height / 2 }
  const start = clipToBorder(fromCenter.x, fromCenter.y, toCenter.x, toCenter.y)
  const end = clipToBorder(toCenter.x, toCenter.y, fromCenter.x, fromCenter.y)
  const points = getSmoothPoints(start, end)
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2

  return (
    <>
      <Arrow
        points={points}
        tension={0.55}
        lineCap="round"
        lineJoin="round"
        stroke={selected ? '#0796D7' : style.stroke}
        fill={selected ? '#0796D7' : style.stroke}
        strokeWidth={selected ? style.strokeWidth + 1.5 : style.strokeWidth}
        dash={style.dash}
        pointerLength={10}
        pointerWidth={9}
        hitStrokeWidth={16}
        onClick={() => onSelect(connection.id)}
        onTap={() => onSelect(connection.id)}
      />
      {connection.label && (
        <Label x={midX} y={midY} offsetX={-4} offsetY={10}>
          <Tag fill="#FFFFFF" stroke={style.stroke} strokeWidth={1} cornerRadius={3} />
          <Text text={connection.label} fontSize={11} padding={3} fill={style.stroke} />
        </Label>
      )}
    </>
  )
}
