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

/** Clips the line from the node's center toward `toward` to the point where it crosses the
 * node's rectangular border — so the arrow visibly starts/ends at the box edge, not its center. */
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

export function FlowConnectionShape({ connection, fromNode, toNode, selected, onSelect }: FlowConnectionShapeProps) {
  const style = FLOW_CONNECTION_STYLE[connection.flowType]
  const fromCenter = { x: fromNode.x + width / 2, y: fromNode.y + height / 2 }
  const toCenter = { x: toNode.x + width / 2, y: toNode.y + height / 2 }
  const start = clipToBorder(fromCenter.x, fromCenter.y, toCenter.x, toCenter.y)
  const end = clipToBorder(toCenter.x, toCenter.y, fromCenter.x, fromCenter.y)
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2

  return (
    <>
      <Arrow
        points={[start.x, start.y, end.x, end.y]}
        stroke={selected ? '#0796D7' : style.stroke}
        fill={selected ? '#0796D7' : style.stroke}
        strokeWidth={selected ? style.strokeWidth + 1.5 : style.strokeWidth}
        dash={style.dash}
        pointerLength={12}
        pointerWidth={10}
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
