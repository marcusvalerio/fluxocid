import { useState } from 'react'
import { CATEGORY_LABELS, getObjectTypesByCategory, OBJECT_CATEGORIES_ORDER } from '../objects/catalog'
import { ObjectThumbnail } from '../objects/ObjectThumbnail'
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
            className="flex flex-col rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 text-left transition-colors overflow-hidden md:flex-row md:items-center"
          >
            <span className="flex items-center justify-center bg-surface-alt shrink-0">
              <ObjectThumbnail objectType={def.key} width={130} height={90} />
            </span>
            <span className="text-xs md:text-sm font-medium text-text-primary px-2 py-1.5 leading-tight">{def.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
