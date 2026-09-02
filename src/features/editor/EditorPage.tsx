import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Grid3x3,
  Magnet,
  Minus,
  MousePointerClick,
  Plus,
  Redo2,
  RotateCcw,
  RotateCw,
  Trash2,
  Undo2,
  Maximize,
  Warehouse,
  X,
} from 'lucide-react'
import { EditorCanvas, type EditorCanvasHandle } from './canvas/EditorCanvas'
import { EnvironmentPanel } from './environment-panel/EnvironmentPanel'
import { LibraryPanel } from './library-panel/LibraryPanel'
import { PropertiesPanel } from './properties-panel/PropertiesPanel'
import { SelectionToolbar } from './properties-panel/SelectionToolbar'
import { useEditorStore } from './state/useEditorStore'
import { layoutRepository } from '../../shared/data/LocalLayoutRepository'
import { findStorageOverlaps, getBoundsStatus } from '../../shared/lib/spatialRules'
import { IconButton } from '../../shared/ui/IconButton'
import { ThemeToggle } from '../../shared/ui/ThemeToggle'
import { BottomSheet } from '../../shared/ui/BottomSheet'
import type { ObjectTypeKey } from '../../types/layout'

export function EditorPage() {
  const { layoutId } = useParams<{ layoutId: string }>()
  const navigate = useNavigate()
  const canvasHandleRef = useRef<EditorCanvasHandle | null>(null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [environmentOpen, setEnvironmentOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  // Mobile properties sheet: starts collapsed on every new selection (so it never sits on top
  // of a just-inserted/selected object, which appears at the viewport center) and is forced
  // collapsed for the duration of any drag — it only re-expands when the user explicitly taps
  // it. See docs/UX.md § 2.2 and the Fase 1 mobile touch-interception fix.
  const [propertiesCollapsed, setPropertiesCollapsed] = useState(true)
  const [canvasDragging, setCanvasDragging] = useState(false)
  // Desktop properties panel is dismissible so it never blocks the canvas while editing.
  // A new selection opens it; closing it keeps it closed until another object is selected.
  const [propertiesOpen, setPropertiesOpen] = useState(true)

  const layoutName = useEditorStore((s) => s.layoutName)
  const objects = useEditorStore((s) => s.objects)
  // Live drag updates (moveObjectLive/moveManyLive) change `objects` every frame without touching
  // history — using history length as the autosave trigger instead means we only persist committed
  // changes, not every in-progress drag frame (BR-41: autosave on relevant changes, not live tracking).
  const historyVersion = useEditorStore((s) => s.history.past.length)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const selectObject = useEditorStore((s) => s.selectObject)
  const loadLayout = useEditorStore((s) => s.loadLayout)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const deleteSelected = useEditorStore((s) => s.deleteSelected)
  const duplicateSelected = useEditorStore((s) => s.duplicateSelected)
  const rotateSelected = useEditorStore((s) => s.rotateSelected)
  const multiSelectMode = useEditorStore((s) => s.multiSelectMode)
  const setMultiSelectMode = useEditorStore((s) => s.setMultiSelectMode)
  const snapEnabled = useEditorStore((s) => s.snapEnabled)
  const setSnapEnabled = useEditorStore((s) => s.setSnapEnabled)
  const gridVisible = useEditorStore((s) => s.gridVisible)
  const toggleGrid = useEditorStore((s) => s.toggleGrid)
  const saveStatus = useEditorStore((s) => s.saveStatus)
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus)
  const layoutId2 = useEditorStore((s) => s.layoutId)

  const envWidthM = useEditorStore((s) => s.envWidthM)
  const envHeightM = useEditorStore((s) => s.envHeightM)

  const selectedObject = selectedIds.length === 1 ? objects.find((o) => o.id === selectedIds[0]) : undefined
  const hasMultiSelection = selectedIds.length > 1
  const overlappingIds = useMemo(() => findStorageOverlaps(objects), [objects])
  const selectedBoundsStatus = selectedObject
    ? getBoundsStatus(selectedObject, envWidthM * 100, envHeightM * 100)
    : undefined

  const registerHandle = useCallback((handle: EditorCanvasHandle) => {
    canvasHandleRef.current = handle
  }, [])

  // Reset the mobile properties sheet to collapsed on every new selection.
  const selectedIdsKey = selectedIds.join(',')
  useEffect(() => {
    setPropertiesCollapsed(true)
    if (selectedIds.length === 1) setPropertiesOpen(true)
    if (selectedIds.length === 0) setPropertiesOpen(false)
  }, [selectedIdsKey])

  // A drag starting while the sheet happens to be expanded (the user opened it, then decided
  // to drag the object) latches it collapsed — so it doesn't pop back open the instant the
  // drag ends. It only comes back via an explicit tap (onToggleCollapsed).
  useEffect(() => {
    if (canvasDragging) {
      setPropertiesCollapsed(true)
      setPropertiesOpen(false)
    }
  }, [canvasDragging])

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!layoutId) return
      const layout = await layoutRepository.getLayout(layoutId)
      if (!cancelled && layout) {
        loadLayout(layout)
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [layoutId, loadLayout])

  // Autosave (debounced) on every committed change (undo history entry) after the initial load —
  // not on every live-drag frame, which changes `objects` without touching history.
  useEffect(() => {
    if (loading || !layoutId2) return
    setSaveStatus('saving')
    const timer = setTimeout(async () => {
      try {
        await layoutRepository.saveLayoutObjects(layoutId2, useEditorStore.getState().objects)
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyVersion, layoutId2, loading])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') return

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault()
        deleteSelected()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedIds.length > 0) {
        e.preventDefault()
        duplicateSelected()
      } else if (e.key === 'Escape') {
        selectObject(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, deleteSelected, duplicateSelected, selectObject, selectedIds])

  function handleInsert(objectType: ObjectTypeKey) {
    canvasHandleRef.current?.insertAtCenter(objectType)
    setLibraryOpen(false)
  }

  const saveStatusLabel: Record<typeof saveStatus, string> = {
    idle: '',
    saving: 'Salvando…',
    saved: 'Salvo',
    error: 'Erro ao salvar',
  }

  return (
    <div className="h-dvh w-full flex flex-col bg-bg">
      <header className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface shrink-0">
        <IconButton label="Voltar" onClick={() => navigate('/layouts')}>
          <ArrowLeft size={20} />
        </IconButton>
        <h1 className="font-display text-sm md:text-base font-semibold text-text-primary truncate flex-1">
          {layoutName || 'Layout'}
        </h1>
        <span
          className={`text-xs shrink-0 transition-colors duration-200 ${saveStatus === 'error' ? 'text-danger' : 'text-text-secondary'}`}
        >
          {saveStatusLabel[saveStatus]}
        </span>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <aside className="hidden md:block w-64 border-r border-border bg-surface overflow-y-auto p-3">
          <LibraryPanel onInsert={handleInsert} />
        </aside>

        <main className="flex-1 relative">
          <EditorCanvas registerHandle={registerHandle} onDraggingChange={setCanvasDragging} />

          <div className="absolute top-3 left-3 flex flex-col gap-1 bg-surface border border-border rounded-lg shadow-sm p-1">
            <IconButton label="Aumentar zoom" onClick={() => canvasHandleRef.current?.zoomIn()}>
              <Plus size={18} />
            </IconButton>
            <IconButton label="Diminuir zoom" onClick={() => canvasHandleRef.current?.zoomOut()}>
              <Minus size={18} />
            </IconButton>
            <IconButton label="Ajustar à tela" onClick={() => canvasHandleRef.current?.fitToView()}>
              <Maximize size={18} />
            </IconButton>
          </div>

          <div className="absolute top-3 left-16 flex gap-1 bg-surface border border-border rounded-lg shadow-sm p-1">
            <IconButton label="Desfazer" onClick={undo}>
              <Undo2 size={18} />
            </IconButton>
            <IconButton label="Refazer" onClick={redo}>
              <Redo2 size={18} />
            </IconButton>
          </div>

          <div className="absolute top-3 right-3 flex flex-col gap-1 bg-surface border border-border rounded-lg shadow-sm p-1">
            <IconButton label="Alternar grade" active={gridVisible} onClick={toggleGrid}>
              <Grid3x3 size={18} />
            </IconButton>
            <IconButton label="Alternar snap" active={snapEnabled} onClick={() => setSnapEnabled(!snapEnabled)}>
              <Magnet size={18} />
            </IconButton>
            <IconButton
              label="Configurar ambiente"
              active={environmentOpen}
              onClick={() => {
                selectObject(null)
                setEnvironmentOpen((v) => !v)
              }}
            >
              <Warehouse size={18} />
            </IconButton>
            <IconButton label="Exportar como imagem (PNG)" onClick={() => canvasHandleRef.current?.exportPng()}>
              <Download size={18} />
            </IconButton>
          </div>

          {environmentOpen && (
            <aside className="hidden md:block absolute bottom-3 right-3 w-72 bg-surface border border-border rounded-lg shadow-sm p-4 animate-panel-in">
              <EnvironmentPanel />
            </aside>
          )}

          {selectedObject && propertiesOpen && (
            <aside className="hidden md:block absolute top-3 right-16 w-72 bg-surface border border-border rounded-lg shadow-sm p-4 animate-panel-in">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading text-base font-semibold text-text-primary">Propriedades</h2>
                <IconButton label="Fechar propriedades" onClick={() => setPropertiesOpen(false)}>
                  <X size={18} />
                </IconButton>
              </div>
              <PropertiesPanel object={selectedObject} hasOverlap={overlappingIds.has(selectedObject.id)} boundsStatus={selectedBoundsStatus} />
            </aside>
          )}

          {hasMultiSelection && (
            <aside className="hidden md:block absolute top-3 right-16 w-72 bg-surface border border-border rounded-lg shadow-sm p-4 animate-panel-in">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-heading text-base font-semibold text-text-primary">Seleção</h2>
                <IconButton label="Fechar seleção" onClick={() => selectObject(null)}>
                  <X size={18} />
                </IconButton>
              </div>
              <SelectionToolbar />
            </aside>
          )}

          {multiSelectMode && (
            <div className="md:hidden absolute top-14 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary text-white rounded-full pl-3 pr-1 py-1 shadow-sm text-sm font-medium">
              <MousePointerClick size={16} />
              {selectedIds.length} selecionado{selectedIds.length === 1 ? '' : 's'}
              <button
                onClick={() => setMultiSelectMode(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30"
                aria-label="Concluir seleção"
              >
                <Check size={16} />
              </button>
            </div>
          )}
        </main>
      </div>

      <footer className="flex items-center justify-around gap-1 px-2 py-2 border-t border-border bg-surface shrink-0 md:hidden">
        <IconButton
          label="Inserir objeto"
          onClick={() => {
            selectObject(null)
            setLibraryOpen(true)
          }}
        >
          <Plus size={22} />
        </IconButton>
        {selectedIds.length > 0 && (
          <>
            <IconButton label="Girar -90°" onClick={() => rotateSelected(-90)}>
              <RotateCcw size={22} />
            </IconButton>
            <IconButton label="Girar +90°" onClick={() => rotateSelected(90)}>
              <RotateCw size={22} />
            </IconButton>
            <IconButton label="Duplicar" onClick={duplicateSelected}>
              <Copy size={22} />
            </IconButton>
            <IconButton label="Excluir" onClick={deleteSelected}>
              <Trash2 size={22} className="text-danger" />
            </IconButton>
          </>
        )}
      </footer>

      {libraryOpen && (
        <BottomSheet title="Biblioteca de objetos" onClose={() => setLibraryOpen(false)}>
          <LibraryPanel onInsert={handleInsert} />
        </BottomSheet>
      )}

      {selectedObject && (
        <div className="md:hidden">
          <BottomSheet
            title={selectedObject.name || 'Propriedades'}
            onClose={() => selectObject(null)}
            modal={false}
            collapsed={propertiesCollapsed || canvasDragging}
            onToggleCollapsed={() => setPropertiesCollapsed((v) => !v)}
          >
            <PropertiesPanel object={selectedObject} hasOverlap={overlappingIds.has(selectedObject.id)} boundsStatus={selectedBoundsStatus} />
          </BottomSheet>
        </div>
      )}

      {hasMultiSelection && (
        <div className="md:hidden">
          <BottomSheet title="Seleção múltipla" onClose={() => selectObject(null)} modal={false}>
            <SelectionToolbar />
          </BottomSheet>
        </div>
      )}

      {environmentOpen && (
        <div className="md:hidden">
          <BottomSheet title="Ambiente" onClose={() => setEnvironmentOpen(false)}>
            <EnvironmentPanel />
          </BottomSheet>
        </div>
      )}
    </div>
  )
}
