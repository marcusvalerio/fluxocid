export type ObjectCategory =
  | 'structure'
  | 'storage'
  | 'pallet'
  | 'equipment'
  | 'area'
  | 'flow'
  | 'other'

export type ObjectTypeKey =
  | 'wall'
  | 'door'
  | 'dock'
  | 'rack'
  | 'corridor'
  | 'pallet'
  | 'forklift'
  | 'pallet-jack'
  | 'area'
  | 'flow-route'
  | 'shelf'
  | 'storage-block'
  | 'area-picking'
  | 'area-staging'
  | 'conveyor'
  | 'sorting-bench'
  | 'packing-table'
  | 'scale'
  | 'label-printer'
  | 'rf-scanner'
  | 'area-inspection'
  | 'area-shipping'
  | 'area-receiving'
  | 'directional-arrow'
  | 'traffic-lane'
  | 'intersection'
  | 'safety-zone'
  | 'pedestrian-lane'
  | 'platform-cart'

/** All measurements (x, y, width, length) are in centimeters. Rotation is in degrees [0, 360). */
export interface LayoutObject {
  id: string
  objectType: ObjectTypeKey
  category: ObjectCategory
  name?: string
  x: number
  y: number
  width: number
  length: number
  rotationDeg: number
  zIndex: number
  properties: Record<string, unknown>
}

export interface Layout {
  id: string
  organizationId: string
  name: string
  scalePxPerMeter: number
  gridStepM: number
  widthM?: number
  heightM?: number
  createdAt: string
  updatedAt: string
  objects: LayoutObject[]
  /** Fluxo board data — belongs to the same project as `objects` (Layout), see docs/ARCHITECTURE.md
   * § Fluxo. Optional/absent on layouts saved before this field existed. */
  flowNodes?: import('./flow').FlowNode[]
  flowConnections?: import('./flow').FlowConnection[]
}

export type LayoutSummary = Pick<
  Layout,
  'id' | 'organizationId' | 'name' | 'createdAt' | 'updatedAt'
>

export interface NewLayoutInput {
  name: string
  widthM?: number
  heightM?: number
}
