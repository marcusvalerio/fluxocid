import { Arrow, Label, Tag, Text } from 'react-konva'
import { cmToPx } from '../../../shared/lib/units'
import { FLOW_CONNECTION_STYLE, type FlowConnection, type FlowNode } from '../../../types/flow'
import type { LayoutObject } from '../../../types/layout'
import { routeConnection } from '../flow/connectionRouting'

interface FlowOverlayProps {
  flowConnections: FlowConnection[]
  flowNodes: FlowNode[]
  objects: LayoutObject[]
  pxPerMeter: number
}

/** Draws each Fluxo connection whose both endpoints are linked to a Layout object, directly on
 * the Layout canvas — connecting the two objects' centers. Preparação para futuramente indicar
 * sentido/cruzamentos/gargalos (ver docs/BUSINESS_RULES.md § Prancheta de Fluxo); por ora é só a
 * representação visual direta da conexão. Read-only: not selectable/editable from this board —
 * edit the connection on the Fluxo board itself. */
export function FlowOverlay({ flowConnections, flowNodes, objects, pxPerMeter }: FlowOverlayProps) {
  const nodesById = new Map(flowNodes.map((n) => [n.id, n]))
  const objectsById = new Map(objects.map((o) => [o.id, o]))

  const segments = flowConnections
    .map((conn) => {
      const fromNode = nodesById.get(conn.fromNodeId)
      const toNode = nodesById.get(conn.toNodeId)
      if (!fromNode?.linkedObjectId || !toNode?.linkedObjectId) return null
      const fromObj = objectsById.get(fromNode.linkedObjectId)
      const toObj = objectsById.get(toNode.linkedObjectId)
      if (!fromObj || !toObj) return null
      return { conn, fromObj, toObj }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  return (
    <>
      {segments.map(({ conn, fromObj, toObj }) => {
        const style = FLOW_CONNECTION_STYLE[conn.flowType]
        const fromBox = {
          x: cmToPx(fromObj.x, pxPerMeter),
          y: cmToPx(fromObj.y, pxPerMeter),
          width: cmToPx(fromObj.width, pxPerMeter),
          height: cmToPx(fromObj.length, pxPerMeter),
        }
        const toBox = {
          x: cmToPx(toObj.x, pxPerMeter),
          y: cmToPx(toObj.y, pxPerMeter),
          width: cmToPx(toObj.width, pxPerMeter),
          height: cmToPx(toObj.length, pxPerMeter),
        }
        const { points } = routeConnection(fromBox, toBox)
        return (
          <Arrow
            key={conn.id}
            points={points}
            bezier
            stroke={style.stroke}
            fill={style.stroke}
            strokeWidth={style.strokeWidth}
            dash={style.dash}
            opacity={0.75}
            pointerLength={14}
            pointerWidth={12}
            listening={false}
          />
        )
      })}
      {segments.length === 0 && flowConnections.length > 0 && (
        <Label x={16} y={16} listening={false}>
          <Tag fill="#08080C" opacity={0.75} cornerRadius={4} />
          <Text
            text="Nenhuma conexão de fluxo associada a áreas do Layout ainda"
            fill="#FFFFFF"
            fontSize={12}
            padding={6}
          />
        </Label>
      )}
    </>
  )
}
