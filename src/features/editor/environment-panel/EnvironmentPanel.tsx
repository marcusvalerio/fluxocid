import { useEditorStore } from '../state/useEditorStore'
import { layoutRepository } from '../../../shared/data/LocalLayoutRepository'
import { computeOccupancyPercent } from '../../../shared/lib/spatialRules'
import { NumberField } from '../../../shared/ui/NumberField'

/** Environment (physical space) settings: real-world dimensions, total area, and an approximate
 * occupancy figure — the editor's way of answering "how big is my room, and how full is it?" */
export function EnvironmentPanel() {
  const envWidthM = useEditorStore((s) => s.envWidthM)
  const envHeightM = useEditorStore((s) => s.envHeightM)
  const objects = useEditorStore((s) => s.objects)
  const layoutId = useEditorStore((s) => s.layoutId)
  const setEnvironmentSize = useEditorStore((s) => s.setEnvironmentSize)

  const areaM2 = envWidthM * envHeightM
  const occupancyPercent = computeOccupancyPercent(objects, envWidthM * 100, envHeightM * 100)

  function commitSize(widthM: number, heightM: number) {
    setEnvironmentSize(widthM, heightM)
    if (layoutId) {
      layoutRepository.updateLayoutSettings(layoutId, { widthM, heightM })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-text-primary">Ambiente</h2>

      <div className="space-y-3">
        <NumberField
          label="Largura"
          unit="m"
          step={0.5}
          min={1}
          value={envWidthM}
          onCommit={(v) => commitSize(v, envHeightM)}
        />
        <NumberField
          label="Comprimento"
          unit="m"
          step={0.5}
          min={1}
          value={envHeightM}
          onCommit={(v) => commitSize(envWidthM, v)}
        />
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Área total</span>
          <span className="text-text-primary font-medium">{areaM2.toFixed(1)} m²</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Ocupação (aprox.)</span>
          <span className="text-text-primary font-medium">{Math.min(999, occupancyPercent).toFixed(0)}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-surface-alt overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${Math.min(100, occupancyPercent)}%` }}
          />
        </div>
        <p className="text-xs text-text-disabled">
          Estimativa por soma de área ocupada; objetos sobrepostos (ex.: pallet sobre
          porta-paletes) podem ser contados mais de uma vez.
        </p>
      </div>
    </div>
  )
}
