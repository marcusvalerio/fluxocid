import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, Plus, Trash2 } from 'lucide-react'
import { layoutRepository } from '../../shared/data/LocalLayoutRepository'
import { Button } from '../../shared/ui/Button'
import { Panel } from '../../shared/ui/Panel'
import { IconButton } from '../../shared/ui/IconButton'
import type { LayoutSummary } from '../../types/layout'

export function LayoutsListPage() {
  const navigate = useNavigate()
  const [layouts, setLayouts] = useState<LayoutSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  async function refresh() {
    setLayouts(await layoutRepository.listLayouts())
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleCreate() {
    const name = newName.trim() || 'Novo layout'
    const layout = await layoutRepository.createLayout({ name })
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
          <h1 className="text-xl font-semibold text-text-primary">FluxoCit</h1>
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus size={18} />
            Novo layout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {creating && (
          <Panel className="p-4 mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">Nome do layout</label>
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Ex.: CD São Paulo — Galpão 1"
                className="flex-1 rounded-md border border-border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
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
