/** Process-step node types for the Fluxo board — mirrors the área subtypes used on the Layout
 * board (docs/DESIGN_SYSTEM.md § 2.3) so a node's color/identity stays consistent whether it's
 * viewed as a flow step or as a physical area. */
export type FlowNodeType =
  | 'receiving'
  | 'inspection'
  | 'storage'
  | 'picking'
  | 'staging'
  | 'shipping'
  | 'returns'
  | 'quarantine'
  | 'administrative'
  | 'custom'

export interface FlowNode {
  id: string
  type: FlowNodeType
  name?: string
  x: number
  y: number
  notes?: string
  /** Optional link to a LayoutObject.id — associates this process step with a physical
   * area/object already placed on the Layout board (see docs/ARCHITECTURE.md § Fluxo). */
  linkedObjectId?: string
}

/** Extensible per BR: each connection carries a semantic flow type (material/pallet/pessoas/
 * empilhadeira/picking), not just a generic arrow. */
export type FlowConnectionType = 'material' | 'pallet' | 'people' | 'forklift' | 'picking'

export interface FlowConnection {
  id: string
  fromNodeId: string
  toNodeId: string
  flowType: FlowConnectionType
  label?: string
}

export const FLOW_NODE_SIZE = { width: 160, height: 64 }

export const FLOW_NODE_TYPE_LABELS: Record<FlowNodeType, string> = {
  receiving: 'Recebimento',
  inspection: 'Conferência',
  storage: 'Armazenagem',
  picking: 'Picking',
  staging: 'Staging',
  shipping: 'Expedição',
  returns: 'Devolução',
  quarantine: 'Quarentena',
  administrative: 'Área administrativa',
  custom: 'Área personalizada',
}

/** Same hues as AREA_TYPE_COLORS (src/shared/lib/colors.ts) — 'inspection' is the one type with
 * no área-subtype equivalent there, matching AreaInspection.tsx's own accent. */
export const FLOW_NODE_TYPE_COLORS: Record<FlowNodeType, string> = {
  receiving: '#0D9488',
  inspection: '#0EA5E9',
  storage: '#B45309',
  picking: '#7C3AED',
  staging: '#D97706',
  shipping: '#2563EB',
  returns: '#DB2777',
  quarantine: '#DC2626',
  administrative: '#0EA5E9',
  custom: '#334155',
}

export const FLOW_NODE_TYPES_ORDER: FlowNodeType[] = [
  'receiving',
  'inspection',
  'storage',
  'picking',
  'staging',
  'shipping',
  'returns',
  'quarantine',
  'administrative',
  'custom',
]

export const FLOW_CONNECTION_TYPE_LABELS: Record<FlowConnectionType, string> = {
  material: 'Materiais',
  pallet: 'Pallets',
  people: 'Pessoas',
  forklift: 'Empilhadeiras',
  picking: 'Picking',
}
