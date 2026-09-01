import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Copy,
  Grid3x3,
  Magnet,
  Minus,
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
import { useEditorStore } from './state/useEditorStore'
import { layoutRepository } from '../../shared/data/LocalLayoutRepository'
import { IconButton } from '../../shared/ui/IconButton'
import { BottomSheet } from '../../shared/ui/BottomSheet'
import type { ObjectTypeKey } from '../../types/layout'

export function EditorPage() {
  const { layoutId } = useParams<{ layoutId: string }>()
  const navigate = useNavigate()
  const canvasHandleRef = useRef<EditorCanvasHandle | null>(null)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const layoutName = useEditorStore((s) => s.layoutName)
  const objects = useEditorStore((s) => s.objects)
  const selectedIds = useEditorStore((s) => s.selectedIds)
  const selectObject = useEditorStore((s) => s.selectObject)
  const loadLayout = useEditorStore((s) => s.loadLayout)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const deleteObject = useEditorStore((s) => s.deleteObject)
  const duplicateObject = useEditorStore((s) => s.duplicateObject)
  const rotateObject = useEditorStore((s) => s.rotateObject)
  const snapEnabled = useEditorStore((s) => s.snapEnabled)
  const setSnapEnabled = useEditorStore((s) => s.setSnapEnabled)
  const gridVisible = useEditorStore((s) => s.gridVisible)
  const toggleGrid = useEditorStore((s) => s.toggleGrid)
  const saveStatus = useEditorStore((s) => s.saveStatus)
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus)
  const layoutId2 = useEditorStore((s) => s.layoutId)

  const selectedObject = objects.find((o) => o.id === selectedIds[0])

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

  // Autosave (debounced) whenever the object list changes after the initial load.
  useEffect(() => {
    if (loading || !layoutId2) return
    setSaveStatus('saving')
    const timer = setTimeout(async () => {
      try {
        await layoutRepository.saveLayoutObjects(layoutId2, objects)
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objects, layoutId2, loading])

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
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds[0]) {
        e.preventDefault()
        deleteObject(selectedIds[0])
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedIds[0]) {
        e.preventDefault()
        duplicateObject(selectedIds[0])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, deleteObject, duplicateObject, selectedIds])

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

        <main className="flex-1 relative">
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
              <PropertiesPanel object={selectedObject} />
            </aside>
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
        <IconButton label="Desfazer" onClick={undo}>
          <Undo2 size={22} />
        </IconButton>
        <IconButton label="Refazer" onClick={redo}>
          <Redo2 size={22} />
        </IconButton>
        {selectedObject && (
          <>
            <IconButton label="Girar -90°" onClick={() => rotateObject(selectedObject.id, -90)}>
              <RotateCcw size={22} />
            </IconButton>
            <IconButton label="Girar +90°" onClick={() => rotateObject(selectedObject.id, 90)}>
              <RotateCw size={22} />
            </IconButton>
            <IconButton label="Duplicar" onClick={() => duplicateObject(selectedObject.id)}>
              <Copy size={22} />
            </IconButton>
            <IconButton label="Excluir" onClick={() => deleteObject(selectedObject.id)}>
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
          >
            <PropertiesPanel object={selectedObject} />
          </BottomSheet>
        </div>
      )}
    </div>
  )
}
