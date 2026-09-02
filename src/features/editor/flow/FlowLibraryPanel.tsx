import { FLOW_NODE_TYPES_ORDER, FLOW_NODE_TYPE_COLORS, FLOW_NODE_TYPE_LABELS, type FlowNodeType } from '../../../types/flow'

interface FlowLibraryPanelProps {
  onInsert: (type: FlowNodeType) => void
}

/** Palette of process-step types for the Fluxo board — mirrors LibraryPanel's insert-by-tap
 * pattern from the Layout board, for a consistent "biblioteca" feel across both pranchetas. */
export function FlowLibraryPanel({ onInsert }: FlowLibraryPanelProps) {
  return (
    <div>
      <h2 className="font-heading text-sm font-semibold text-text-secondary mb-3">Etapas de processo</h2>
      <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
        {FLOW_NODE_TYPES_ORDER.map((type) => (
          <button
            key={type}
            onClick={() => onInsert(type)}
            className="flex items-center gap-3 p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-colors"
          >
            <span
              className="w-8 h-8 rounded shrink-0"
              style={{ backgroundColor: FLOW_NODE_TYPE_COLORS[type], opacity: 0.85 }}
            />
            <span className="text-sm font-medium text-text-primary">{FLOW_NODE_TYPE_LABELS[type]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
