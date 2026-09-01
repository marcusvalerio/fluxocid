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
