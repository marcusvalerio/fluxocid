import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Plus, Trash2 } from 'lucide-react'
import { layoutRepository } from '../../shared/data/repository'
import { DEFAULT_ENV_HEIGHT_M, DEFAULT_ENV_WIDTH_M } from '../editor/state/useEditorStore'
import { Button } from '../../shared/ui/Button'
import { Panel } from '../../shared/ui/Panel'
import { IconButton } from '../../shared/ui/IconButton'
import { ThemeToggle } from '../../shared/ui/ThemeToggle'
import type { LayoutSummary } from '../../types/layout'

export function LayoutsListPage() {
  const navigate = useNavigate()
  const [layouts, setLayouts] = useState<LayoutSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newWidthM, setNewWidthM] = useState(String(DEFAULT_ENV_WIDTH_M))
  const [newHeightM, setNewHeightM] = useState(String(DEFAULT_ENV_HEIGHT_M))

  async function refresh() {
    setLayouts(await layoutRepository.listLayouts())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleCreate() {
    const name = newName.trim() || 'Novo layout'
    const widthM = Math.max(1, Number.parseFloat(newWidthM.replace(',', '.')) || DEFAULT_ENV_WIDTH_M)
    const heightM = Math.max(1, Number.parseFloat(newHeightM.replace(',', '.')) || DEFAULT_ENV_HEIGHT_M)
    const layout = await layoutRepository.createLayout({ name, widthM, heightM })
    navigate(`/editor/${layout.id}`)
  }

  async function handleDelete(id: string) {
    await layoutRepository.deleteLayout(id)
    refresh()
  }

  return (
    <div className="min-h-dvh bg-bg">
      <header className="border-b border-border bg-surface">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold text-text-primary">FluxoCit</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Plus size={18} />
              Novo layout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {creating && (
          <Panel className="p-4 mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">Nome do layout</label>
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Ex.: CD São Paulo — Galpão 1"
              className="w-full rounded-md border border-border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 mb-3"
            />
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Dimensões do ambiente (largura × comprimento, em metros)
            </label>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                inputMode="decimal"
                value={newWidthM}
                onChange={(e) => setNewWidthM(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                aria-label="Largura do ambiente em metros"
                className="w-24 rounded-md border border-border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <span className="text-text-secondary">m ×</span>
              <input
                type="text"
                inputMode="decimal"
                value={newHeightM}
                onChange={(e) => setNewHeightM(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                aria-label="Comprimento do ambiente em metros"
                className="w-24 rounded-md border border-border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <span className="text-text-secondary">m</span>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleCreate}>
                Criar
              </Button>
              <Button variant="secondary" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
            </div>
          </Panel>
        )}

        {!loading && layouts.length === 0 && !creating && (
          <Panel className="p-10 flex flex-col items-center text-center gap-3">
            <LayoutGrid size={40} className="text-text-disabled" />
            <p className="text-text-secondary">Nenhum layout criado ainda.</p>
            <Button variant="primary" onClick={() => setCreating(true)}>
              <Plus size={18} />
              Criar novo layout
            </Button>
          </Panel>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {layouts.map((layout) => (
            <Panel key={layout.id} className="p-4 flex flex-col gap-3">
              <button
                onClick={() => navigate(`/editor/${layout.id}`)}
                className="text-left flex-1"
              >
                <div className="aspect-video rounded-md bg-surface-alt border border-border mb-3 flex items-center justify-center">
                  <LayoutGrid size={28} className="text-text-disabled" />
                </div>
                <p className="font-medium text-text-primary truncate">{layout.name}</p>
                <p className="text-xs text-text-secondary mt-1">
                  Atualizado em {new Date(layout.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </button>
              <div className="flex justify-end">
                <IconButton label="Excluir layout" onClick={() => handleDelete(layout.id)}>
                  <Trash2 size={18} className="text-danger" />
                </IconButton>
              </div>
            </Panel>
          ))}
        </div>
      </main>
    </div>
  )
}
