import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Copy,
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
} from 'lucide-react'
import { EditorCanvas, type EditorCanvasHandle } from './canvas/EditorCanvas'
import { LibraryPanel } from './library-panel/LibraryPanel'
import { PropertiesPanel } from './properties-panel/PropertiesPanel'
import { SelectionToolbar } from './properties-panel/SelectionToolbar'
import { useEditorStore } from './state/useEditorStore'
import { layoutRepository } from '../../shared/data/LocalLayoutRepository'
import { findStorageOverlaps } from '../../shared/lib/spatialRules'
import { IconButton } from '../../shared/ui/IconButton'
import { BottomSheet } from '../../shared/ui/BottomSheet'
import type { ObjectTypeKey } from '../../types/layout'

export function EditorPage() {
  const { layoutId } = useParams<{ layoutId: string }>()
  const navigate = useNavigate()
  const canvasHandleRef = useRef<EditorCanvasHandle | null>(null)
  const editorMainRef = useRef<HTMLElement>(null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [propertiesOpen, setPropertiesOpen] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const selectedObject = selectedIds.length === 1 ? objects.find((o) => o.id === selectedIds[0]) : undefined
  const hasMultiSelection = selectedIds.length > 1
  const overlappingIds = useMemo(() => findStorageOverlaps(objects), [objects])

  const registerHandle = useCallback((handle: EditorCanvasHandle) => {
    canvasHandleRef.current = handle
  }, [])

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

  // A single selection opens the mobile properties sheet as before. Closing it for a drag must
  // not clear selection, otherwise the object would lose its active state mid-interaction.
  useEffect(() => {
    if (selectedObject) {
      setPropertiesOpen(true)
    } else {
      setPropertiesOpen(false)
    }
  }, [selectedObject?.id])

  // On mobile, if the selected object is visible on the canvas, let the first touch/press used to
  // move it dismiss the properties sheet and continue into the canvas. This prevents the sheet
  // from becoming a dead-end after insertion/selection while preserving the current selection.
  useEffect(() => {
    function handleCanvasInteraction(event: PointerEvent) {
      if (!propertiesOpen || !editorMainRef.current) return
      if (window.matchMedia('(min-width: 768px)').matches) return
      const target = event.target as Node | null
      if (target && editorMainRef.current.contains(target)) {
        setPropertiesOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleCanvasInteraction, true)
    return () => document.removeEventListener('pointerdown', handleCanvasInteraction, true)
  }, [propertiesOpen])

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
        <h1 className="text-sm md:text-base font-semibold text-text-primary truncate flex-1">
          {layoutName || 'Layout'}
        </h1>
        <span
          className={`text-xs shrink-0 ${saveStatus === 'error' ? 'text-danger' : 'text-text-secondary'}`}
        >
          {saveStatusLabel[saveStatus]}
        </span>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <aside className="hidden md:block w-64 border-r border-border bg-surface overflow-y-auto p-3">
          <LibraryPanel onInsert={handleInsert} />
        </aside>

        <main ref={editorMainRef} className="flex-1 relative">
          <EditorCanvas registerHandle={registerHandle} />

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
          </div>

          {selectedObject && (
            <aside className="hidden md:block absolute top-3 right-16 w-72 bg-surface border border-border rounded-lg shadow-sm p-4">
              <PropertiesPanel object={selectedObject} hasOverlap={overlappingIds.has(selectedObject.id)} />
            </aside>
          )}

          {hasMultiSelection && (
            <aside className="hidden md:block absolute top-3 right-16 w-72 bg-surface border border-border rounded-lg shadow-sm p-4">
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

      {selectedObject && propertiesOpen && (
        <div className="md:hidden">
          <BottomSheet
            title={selectedObject.name || 'Propriedades'}
            onClose={() => {
              setPropertiesOpen(false)
              selectObject(null)
            }}
            modal={false}
          >
            <PropertiesPanel object={selectedObject} hasOverlap={overlappingIds.has(selectedObject.id)} />
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
    </div>
  )
}
