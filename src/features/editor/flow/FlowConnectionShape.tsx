import { Arrow, Label, Tag, Text } from 'react-konva'
import { FLOW_CONNECTION_STYLE, FLOW_NODE_SIZE, type FlowConnection, type FlowNode } from '../../../types/flow'
import { routeConnection } from './connectionRouting'

interface FlowConnectionShapeProps {
  connection: FlowConnection
  fromNode: FlowNode
  toNode: FlowNode
  selected: boolean
  onSelect: (id: string) => void
}

const { width, height } = FLOW_NODE_SIZE

export function FlowConnectionShape({ connection, fromNode, toNode, selected, onSelect }: FlowConnectionShapeProps) {
  const style = FLOW_CONNECTION_STYLE[connection.flowType]
  const fromBox = { x: fromNode.x, y: fromNode.y, width, height }
  const toBox = { x: toNode.x, y: toNode.y, width, height }
  const { points, mid } = routeConnection(fromBox, toBox)

  return (
    <>
      <Arrow
        points={points}
        bezier
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
        <Label x={mid.x} y={mid.y} offsetX={-4} offsetY={10}>
          <Tag fill="#FFFFFF" stroke={style.stroke} strokeWidth={1} cornerRadius={3} />
          <Text text={connection.label} fontSize={11} padding={3} fill={style.stroke} />
        </Label>
      )}
    </>
  )
}
