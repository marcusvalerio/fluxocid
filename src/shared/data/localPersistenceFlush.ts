import { useEditorStore } from '../../features/editor/state/useEditorStore'
import { flushLocalLayoutSnapshot } from './LocalLayoutRepository'

function flushCurrentLayout(): void {
  if (typeof window === 'undefined') return

  const state = useEditorStore.getState()
  if (!state.layoutId) return

  flushLocalLayoutSnapshot(
    state.layoutId,
    state.objects,
    state.flowNodes,
    state.flowConnections,
  )
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushCurrentLayout)
  window.addEventListener('beforeunload', flushCurrentLayout)
}
