import { useState } from 'react'
import { CATEGORY_LABELS, getObjectTypesByCategory, OBJECT_CATEGORIES_ORDER } from '../objects/catalog'
import { CATEGORY_COLORS } from '../../../shared/lib/colors'
import type { ObjectTypeKey } from '../../../types/layout'

interface LibraryPanelProps {
  onInsert: (objectType: ObjectTypeKey) => void
}

export function LibraryPanel({ onInsert }: LibraryPanelProps) {
  const [category, setCategory] = useState<(typeof OBJECT_CATEGORIES_ORDER)[number]>('structure')
  const items = getObjectTypesByCategory(category)

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-3 mb-3 border-b border-border">
        {OBJECT_CATEGORIES_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              cat === category
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-surface-alt'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
        {items.map((def) => (
          <button
            key={def.key}
            onClick={() => onInsert(def.key)}
            className="flex items-center gap-3 p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-colors"
          >
            <span
              className="w-8 h-8 rounded shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[def.category], opacity: 0.85 }}
            />
            <span className="text-sm font-medium text-text-primary">{def.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
