import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useEditorStore } from '../state/useEditorStore'
import { computeProjectMetrics } from '../../../shared/lib/metrics'
import { computeOccupancyPercent, computeSpatialViolations } from '../../../shared/lib/spatialRules'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  )
}

/** Aggregate project indicators (Layout + Fluxo) — see docs/BUSINESS_RULES.md § Métricas. */
export function MetricsPanel() {
  const objects = useEditorStore((s) => s.objects)
  const flowNodes = useEditorStore((s) => s.flowNodes)
  const envWidthM = useEditorStore((s) => s.envWidthM)
  const envHeightM = useEditorStore((s) => s.envHeightM)

  const m = computeProjectMetrics(objects, flowNodes, envWidthM, envHeightM)
  const occupancy = computeOccupancyPercent(objects, envWidthM * 100, envHeightM * 100)
  const violations = computeSpatialViolations(objects, envWidthM * 100, envHeightM * 100)
  const criticalCount = violations.filter((v) => v.severity === 'critical').length
  const warningCount = violations.length - criticalCount

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-base font-semibold text-text-primary">Métricas</h2>

      <div className="space-y-2">
        <Row label="Área total" value={`${m.areaTotalM2.toFixed(1)} m²`} />
        <Row label="Área de armazenagem" value={`${m.areaArmazenagemM2.toFixed(1)} m²`} />
        <Row label="Área operacional" value={`${m.areaOperacionalM2.toFixed(1)} m²`} />
        <Row label="Área de circulação" value={`${m.areaCirculacaoM2.toFixed(1)} m²`} />
        <Row label="Ocupação (aprox.)" value={`${Math.min(999, occupancy).toFixed(0)}%`} />
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <Row label="Posições de pallet (racks)" value={String(m.posicoesPallet)} />
        <Row label="Equipamentos" value={String(m.qtdEquipamentos)} />
        <Row label="Docas" value={String(m.qtdDocas)} />
        <Row label="Comprimento de corredores" value={`${m.comprimentoCorredoresM.toFixed(1)} m`} />
        <Row label="Áreas" value={String(m.qtdAreas)} />
        <Row label="Etapas de fluxo" value={String(m.qtdEtapasFluxo)} />
      </div>

      <div className="border-t border-border pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-text-primary">Alertas</h3>
          {violations.length > 0 && (
            <span className="text-xs text-text-secondary">
              {criticalCount > 0 && `${criticalCount} conflito${criticalCount > 1 ? 's' : ''}`}
              {criticalCount > 0 && warningCount > 0 && ' · '}
              {warningCount > 0 && `${warningCount} atenção`}
            </span>
          )}
        </div>
        {violations.length === 0 ? (
          <div className="flex items-center gap-2 rounded-md bg-success/10 text-success text-sm p-2.5">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Nenhum conflito detectado no layout.</span>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {violations.map((v) => (
              <li
                key={v.id}
                className={`flex items-start gap-2 rounded-md text-sm p-2 ${
                  v.severity === 'critical' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                }`}
              >
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{v.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-text-disabled">
        Estimativas por soma de área/contagem de objetos; sobreposições (ex.: pallet sobre
        porta-paletes) podem ser contadas mais de uma vez.
      </p>
    </div>
  )
}
