import { describe, expect, it } from 'vitest'
import { computeProjectMetrics } from './metrics'
import type { LayoutObject } from '../../types/layout'
import type { FlowNode } from '../../types/flow'

function obj(partial: Partial<LayoutObject>): LayoutObject {
  return {
    id: 'x',
    objectType: 'wall',
    category: 'structure',
    x: 0,
    y: 0,
    width: 100,
    length: 100,
    rotationDeg: 0,
    zIndex: 0,
    properties: {},
    ...partial,
  }
}

describe('computeProjectMetrics', () => {
  it('computes area total from environment dimensions', () => {
    const m = computeProjectMetrics([], [], 20, 15)
    expect(m.areaTotalM2).toBe(300)
  })

  it('sums storage footprint into areaArmazenagemM2', () => {
    const objects = [
      obj({ id: 'r1', objectType: 'rack', category: 'storage', width: 270, length: 110 }),
      obj({ id: 's1', objectType: 'shelf', category: 'storage', width: 100, length: 40 }),
    ]
    const m = computeProjectMetrics(objects, [], 20, 15)
    expect(m.areaArmazenagemM2).toBeCloseTo((270 * 110 + 100 * 40) / 10000, 5)
  })

  it('counts equipment and sums their footprint as areaOperacionalM2', () => {
    const objects = [
      obj({ id: 'f1', objectType: 'forklift', category: 'equipment', width: 120, length: 230 }),
      obj({ id: 'f2', objectType: 'pallet-jack', category: 'equipment', width: 68, length: 150 }),
    ]
    const m = computeProjectMetrics(objects, [], 20, 15)
    expect(m.qtdEquipamentos).toBe(2)
    expect(m.areaOperacionalM2).toBeCloseTo((120 * 230 + 68 * 150) / 10000, 5)
  })

  it('computes rack capacity as bays x levels, summed across racks', () => {
    const objects = [
      obj({ id: 'r1', objectType: 'rack', category: 'storage', properties: { bays: 3, levels: 4 } }),
      obj({ id: 'r2', objectType: 'rack', category: 'storage', properties: { bays: 2, levels: 3 } }),
    ]
    const m = computeProjectMetrics(objects, [], 20, 15)
    expect(m.posicoesPallet).toBe(3 * 4 + 2 * 3)
  })

  it('counts docks and corridor length', () => {
    const objects = [
      obj({ id: 'd1', objectType: 'dock', category: 'structure' }),
      obj({ id: 'd2', objectType: 'dock', category: 'structure' }),
      obj({ id: 'c1', objectType: 'corridor', category: 'storage', width: 300, length: 150 }),
    ]
    const m = computeProjectMetrics(objects, [], 20, 15)
    expect(m.qtdDocas).toBe(2)
    expect(m.comprimentoCorredoresM).toBeCloseTo(3, 5) // max(300,150)/100
  })

  it('counts area-like objects regardless of exact objectType', () => {
    const objects = [
      obj({ id: 'a1', objectType: 'area', category: 'area' }),
      obj({ id: 'a2', objectType: 'area-picking', category: 'storage' }),
      obj({ id: 'a3', objectType: 'area-shipping', category: 'area' }),
    ]
    const m = computeProjectMetrics(objects, [], 20, 15)
    expect(m.qtdAreas).toBe(3)
  })

  it('counts flow steps from flowNodes length', () => {
    const flowNodes: FlowNode[] = [
      { id: 'n1', type: 'receiving', x: 0, y: 0 },
      { id: 'n2', type: 'storage', x: 0, y: 0 },
    ]
    const m = computeProjectMetrics([], flowNodes, 20, 15)
    expect(m.qtdEtapasFluxo).toBe(2)
  })
})
