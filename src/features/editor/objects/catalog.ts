import type { ObjectTypeKey } from '../../../types/layout'
import { AREA_TYPE_LABELS } from '../../../shared/lib/colors'
import { Area } from './renderers/Area'
import { Corridor } from './renderers/Corridor'
import { Dock } from './renderers/Dock'
import { Door } from './renderers/Door'
import { Forklift } from './renderers/Forklift'
import { Pallet } from './renderers/Pallet'
import { PalletJack } from './renderers/PalletJack'
import { Rack } from './renderers/Rack'
import { Wall } from './renderers/Wall'
import type { ObjectTypeDefinition, PropertyFieldDefinition } from './types'

const BASE_FIELDS: PropertyFieldDefinition[] = [
  { key: 'name', label: 'Nome', kind: 'text' },
  { key: 'x', label: 'Posição X', kind: 'number-m', step: 0.05 },
  { key: 'y', label: 'Posição Y', kind: 'number-m', step: 0.05 },
  { key: 'rotationDeg', label: 'Rotação', kind: 'number-deg', step: 15 },
]

const DIMENSION_FIELDS: PropertyFieldDefinition[] = [
  { key: 'width', label: 'Largura', kind: 'number-m', min: 0.1, step: 0.1 },
  { key: 'length', label: 'Comprimento', kind: 'number-m', min: 0.1, step: 0.1 },
]

const AREA_TYPE_OPTIONS = Object.entries(AREA_TYPE_LABELS).map(([value, label]) => ({ value, label }))

export const OBJECT_CATALOG: Record<ObjectTypeKey, ObjectTypeDefinition> = {
  wall: {
    key: 'wall',
    category: 'structure',
    label: 'Parede',
    defaultWidth: 300,
    defaultLength: 20,
    resizable: true,
    render: Wall,
    propertyFields: [...BASE_FIELDS, ...DIMENSION_FIELDS],
  },
  door: {
    key: 'door',
    category: 'structure',
    label: 'Porta',
    defaultWidth: 100,
    defaultLength: 20,
    resizable: true,
    render: Door,
    propertyFields: [...BASE_FIELDS, ...DIMENSION_FIELDS],
  },
  dock: {
    key: 'dock',
    category: 'structure',
    label: 'Doca',
    defaultWidth: 350,
    defaultLength: 50,
    resizable: true,
    render: Dock,
    propertyFields: [...BASE_FIELDS, ...DIMENSION_FIELDS],
  },
  rack: {
    key: 'rack',
    category: 'storage',
    label: 'Porta-paletes',
    defaultWidth: 270,
    defaultLength: 110,
    resizable: true,
    render: Rack,
    propertyFields: [
      ...BASE_FIELDS,
      ...DIMENSION_FIELDS,
      {
        key: 'bays',
        label: 'Vãos',
        kind: 'select',
        options: ['1', '2', '3', '4', '5', '6'].map((v) => ({ value: v, label: v })),
      },
    ],
    defaultProperties: { bays: 3 },
  },
  corridor: {
    key: 'corridor',
    category: 'storage',
    label: 'Corredor',
    defaultWidth: 300,
    defaultLength: 150,
    resizable: true,
    render: Corridor,
    propertyFields: [...BASE_FIELDS, ...DIMENSION_FIELDS],
  },
  pallet: {
    key: 'pallet',
    category: 'pallet',
    label: 'Pallet',
    defaultWidth: 120,
    defaultLength: 100,
    resizable: false,
    render: Pallet,
    propertyFields: [...BASE_FIELDS],
  },
  forklift: {
    key: 'forklift',
    category: 'equipment',
    label: 'Empilhadeira',
    defaultWidth: 120,
    defaultLength: 230,
    resizable: false,
    render: Forklift,
    propertyFields: [...BASE_FIELDS],
  },
  'pallet-jack': {
    key: 'pallet-jack',
    category: 'equipment',
    label: 'Paleteira',
    defaultWidth: 68,
    defaultLength: 150,
    resizable: false,
    render: PalletJack,
    propertyFields: [...BASE_FIELDS],
  },
  area: {
    key: 'area',
    category: 'area',
    label: 'Área',
    defaultWidth: 400,
    defaultLength: 400,
    resizable: true,
    render: Area,
    propertyFields: [
      ...BASE_FIELDS,
      ...DIMENSION_FIELDS,
      { key: 'areaType', label: 'Tipo de área', kind: 'select', options: AREA_TYPE_OPTIONS },
    ],
    defaultProperties: { areaType: 'storage' },
  },
}

export const OBJECT_CATEGORIES_ORDER = ['structure', 'storage', 'pallet', 'equipment', 'area'] as const

export const CATEGORY_LABELS: Record<string, string> = {
  structure: 'Estrutura',
  storage: 'Armazenagem',
  pallet: 'Paletes',
  equipment: 'Equipamentos',
  area: 'Áreas',
  flow: 'Fluxos',
  other: 'Outros',
}

export function getObjectTypesByCategory(category: string): ObjectTypeDefinition[] {
  return Object.values(OBJECT_CATALOG).filter((def) => def.category === category)
}
