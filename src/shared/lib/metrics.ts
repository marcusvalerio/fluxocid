import type { LayoutObject } from '../../types/layout'
import type { FlowNode } from '../../types/flow'

export interface ProjectMetrics {
  areaTotalM2: number
  areaArmazenagemM2: number
  areaOperacionalM2: number
  areaCirculacaoM2: number
  posicoesPallet: number
  qtdEquipamentos: number
  qtdDocas: number
  comprimentoCorredoresM: number
  qtdAreas: number
  qtdEtapasFluxo: number
}

/** Exported for reuse by spatialRules.ts (e.g. "área operacional sobreposta" / corridor-blocking
 * checks need the same type groupings as the metrics they're derived from). */
export const CIRCULATION_TYPES = new Set(['corridor', 'traffic-lane', 'pedestrian-lane', 'intersection'])
export const AREA_TYPES = new Set([
  'area',
  'area-picking',
  'area-staging',
  'area-inspection',
  'area-shipping',
  'area-receiving',
])

function footprintM2(o: LayoutObject): number {
  return (o.width * o.length) / 10000
}

/** Aggregate indicators for the whole project (Layout + Fluxo) — see docs/BUSINESS_RULES.md §
 * Métricas (P8/Fase 5). Sums are directional estimates from bounding footprint, same caveat as
 * computeOccupancyPercent: overlapping objects (e.g. a pallet inside a rack) are double-counted. */
export function computeProjectMetrics(
  objects: LayoutObject[],
  flowNodes: FlowNode[],
  envWidthM: number,
  envHeightM: number,
): ProjectMetrics {
  let areaArmazenagemM2 = 0
  let areaOperacionalM2 = 0
  let areaCirculacaoM2 = 0
  let posicoesPallet = 0
  let qtdEquipamentos = 0
  let qtdDocas = 0
  let comprimentoCorredoresM = 0
  let qtdAreas = 0

  for (const o of objects) {
    // Corridors carry category 'storage' historically (see catalog.ts) but are circulation, not
    // storage footprint — excluded here so "área de armazenagem" isn't inflated by aisles.
    if (o.category === 'storage' && !CIRCULATION_TYPES.has(o.objectType)) areaArmazenagemM2 += footprintM2(o)
    if (o.category === 'equipment') {
      areaOperacionalM2 += footprintM2(o)
      qtdEquipamentos += 1
    }
    if (CIRCULATION_TYPES.has(o.objectType)) {
      areaCirculacaoM2 += footprintM2(o)
      if (o.objectType === 'corridor') comprimentoCorredoresM += Math.max(o.width, o.length) / 100
    }
    if (o.objectType === 'rack') {
      const bays = Number(o.properties.bays ?? 0)
      const levels = Number(o.properties.levels ?? 0)
      posicoesPallet += bays * levels
    }
    if (o.objectType === 'dock') qtdDocas += 1
    if (AREA_TYPES.has(o.objectType) || o.category === 'area') qtdAreas += 1
  }

  return {
    areaTotalM2: envWidthM * envHeightM,
    areaArmazenagemM2,
    areaOperacionalM2,
    areaCirculacaoM2,
    posicoesPallet,
    qtdEquipamentos,
    qtdDocas,
    comprimentoCorredoresM,
    qtdAreas,
    qtdEtapasFluxo: flowNodes.length,
  }
}
