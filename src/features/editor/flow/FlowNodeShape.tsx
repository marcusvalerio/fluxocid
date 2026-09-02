import { Circle, Group, Rect, Text } from 'react-konva'
import type Konva from 'konva'
import { FLOW_NODE_SIZE, FLOW_NODE_TYPE_COLORS, FLOW_NODE_TYPE_LABELS, type FlowNode } from '../../../types/flow'

interface FlowNodeShapeProps {
  node: FlowNode
  selected: boolean
  linked: boolean
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  onDragMove: (id: string, x: number, y: number) => void
  onDragEnd: (id: string, x: number, y: number) => void
  onHandleDragStart: (id: string, x: number, y: number) => void
  registerRef: (id: string, node: Konva.Group | null) => void
}

const { width, height } = FLOW_NODE_SIZE

export function FlowNodeShape({ node, selected, linked, onSelect, onRename, onDragMove, onDragEnd, onHandleDragStart, registerRef }: FlowNodeShapeProps) {
  const color = FLOW_NODE_TYPE_COLORS[node.type]
  const defaultLabel = FLOW_NODE_TYPE_LABELS[node.type]
  const label = node.name?.trim() || defaultLabel

  function editName() {
    const value = window.prompt('Nome da etapa', node.name?.trim() || defaultLabel)
    if (value === null) return
    onRename(node.id, value.trim())
  }

  return (
    <Group
      ref={(n) => registerRef(node.id, n)}
      x={node.x}
      y={node.y}
      draggable
      onDragMove={(e) => onDragMove(node.id, e.target.x(), e.target.y())}
      onDragEnd={(e) => onDragEnd(node.id, e.target.x(), e.target.y())}
      onClick={() => onSelect(node.id)}
      onTap={() => onSelect(node.id)}
    >
      <Rect width={width} height={height} fill={color} opacity={0.14} stroke={color} strokeWidth={selected ? 3 : 1.5} cornerRadius={10} shadowColor="#000000" shadowOpacity={selected ? 0.18 : 0.08} shadowBlur={8} />
      <Rect x={0} y={0} width={6} height={height} fill={color} cornerRadius={[10, 0, 0, 10]} />
      <Text
        text={label}
        x={14}
        y={0}
        width={width - 28}
        height={height}
        verticalAlign="middle"
        fontSize={14}
        fontStyle="600"
        fill={color}
        wrap="word"
        ellipsis
        onDblClick={(e) => {
          e.cancelBubble = true
          editName()
        }}
        onDblTap={(e) => {
          e.cancelBubble = true
          editName()
        }}
      />
      {linked && <Circle x={width - 14} y={14} radius={4} fill="#16A34A" stroke="#FFFFFF" strokeWidth={1} />}
      <Circle
        x={width}
        y={height / 2}
        radius={9}
        hitStrokeWidth={12}
        fill="#FFFFFF"
        stroke={color}
        strokeWidth={2}
        onMouseDown={(e) => {
          e.cancelBubble = true
          onHandleDragStart(node.id, node.x + width, node.y + height / 2)
        }}
        onTouchStart={(e) => {
          e.cancelBubble = true
          onHandleDragStart(node.id, node.x + width, node.y + height / 2)
        }}
      />
    </Group>
  )
}
