import { useEffect, useState } from 'react'
import { AlertTriangle, CloudUpload } from 'lucide-react'
import { getPendingLocalLayouts, importAllPendingLocalLayouts } from '../../shared/data/migration'
import { Button } from '../../shared/ui/Button'
import { Panel } from '../../shared/ui/Panel'
import type { LayoutSummary } from '../../types/layout'

interface MigrationBannerProps {
  /** Called after a successful import so the caller can refresh its own project list. */
  onImported: () => void
}

/** Offers to copy pre-Fase-9 localStorage layouts into the signed-in account's remote projects
 * (Fase 9 § Migração). Nothing is deleted locally and nothing is imported without the user
 * clicking "Importar" — see shared/data/migration.ts for the actual copy + dedupe logic. */
export function MigrationBanner({ onImported }: MigrationBannerProps) {
  const [pending, setPending] = useState<LayoutSummary[] | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getPendingLocalLayouts().then(setPending)
  }, [])

  if (!pending || pending.length === 0 || dismissed) return null

  async function handleImport() {
    setImporting(true)
    setError(null)
    try {
      await importAllPendingLocalLayouts((done, total) => setProgress({ done, total }))
      setPending([])
      onImported()
    } catch {
      setError('Não foi possível importar todos os projetos locais. Tente novamente.')
      // Re-check what's still pending — some may have imported successfully before the failure.
      setPending(await getPendingLocalLayouts())
    } finally {
      setImporting(false)
      setProgress(null)
    }
  }

  return (
    <Panel className="p-4 mb-4 border-primary/40 bg-primary/5">
      <div className="flex items-start gap-3">
        <CloudUpload size={20} className="text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary font-medium">
            {pending.length === 1
              ? 'Encontramos 1 projeto salvo neste dispositivo.'
              : `Encontramos ${pending.length} projetos salvos neste dispositivo.`}
          </p>
          <p className="text-sm text-text-secondary mt-1">
            Importe para sua conta e acesse de qualquer lugar. Nada é apagado deste dispositivo.
          </p>
          {error && (
            <div className="flex items-center gap-1.5 text-danger text-sm mt-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <Button variant="primary" onClick={handleImport} disabled={importing}>
              {importing
                ? progress
                  ? `Importando ${progress.done}/${progress.total}…`
                  : 'Importando…'
                : 'Importar para minha conta'}
            </Button>
            <Button variant="secondary" onClick={() => setDismissed(true)} disabled={importing}>
              Agora não
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  )
}
