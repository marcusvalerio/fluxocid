import type { ComponentType } from 'react'
import type { LayoutObject, ObjectCategory, ObjectTypeKey } from '../../../types/layout'

export interface ObjectRenderProps {
  obj: LayoutObject
  widthPx: number
  lengthPx: number
}

export type PropertyFieldKind = 'text' | 'number-m' | 'number-deg' | 'select'

export interface PropertyFieldOption {
  value: string
  label: string
}

export interface PropertyFieldDefinition {
  /** "name" | "x" | "y" | "width" | "length" | "rotationDeg" address top-level fields; anything else addresses properties.<key>. */
  key: string
  label: string
  kind: PropertyFieldKind
  options?: PropertyFieldOption[]
  min?: number
  step?: number
}

export interface ObjectTypeDefinition {
  key: ObjectTypeKey
  category: ObjectCategory
  label: string
  defaultWidth: number
  defaultLength: number
  resizable: boolean
  render: ComponentType<ObjectRenderProps>
  propertyFields: PropertyFieldDefinition[]
  defaultProperties?: Record<string, unknown>
}
