import { Copy, RotateCcw, RotateCw, Trash2 } from 'lucide-react'
import { OBJECT_CATALOG } from '../objects/catalog'
import { useEditorStore } from '../state/useEditorStore'
import { cmToM, mToCm } from '../../../shared/lib/units'
import { NumberField } from '../../../shared/ui/NumberField'
import { IconButton } from '../../../shared/ui/IconButton'
import type { LayoutObject } from '../../../types/layout'

interface PropertiesPanelProps {
  object: LayoutObject
}

export function PropertiesPanel({ object }: PropertiesPanelProps) {
  const setProperty = useEditorStore((s) => s.setProperty)
  const deleteObject = useEditorStore((s) => s.deleteObject)
  const duplicateObject = useEditorStore((s) => s.duplicateObject)
  const rotateObject = useEditorStore((s) => s.rotateObject)

  const def = OBJECT_CATALOG[object.objectType]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-text-primary">{def.label}</h2>
        <div className="flex gap-1">
          <IconButton label="Girar -90°" onClick={() => rotateObject(object.id, -90)}>
            <RotateCcw size={18} />
          </IconButton>
          <IconButton label="Girar +90°" onClick={() => rotateObject(object.id, 90)}>
            <RotateCw size={18} />
          </IconButton>
          <IconButton label="Duplicar" onClick={() => duplicateObject(object.id)}>
            <Copy size={18} />
          </IconButton>
          <IconButton label="Excluir" onClick={() => deleteObject(object.id)}>
            <Trash2 size={18} className="text-danger" />
          </IconButton>
        </div>
      </div>

      <div className="space-y-3">
        {def.propertyFields.map((field) => {
          if (field.kind === 'text') {
            const value = field.key === 'name' ? (object.name ?? '') : String(object.properties[field.key] ?? '')
            return (
              <label key={field.key} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-text-secondary">{field.label}</span>
                <input
                  type="text"
                  value={value}
                  placeholder={def.label}
                  onChange={(e) => setProperty(object.id, field.key, e.target.value)}
                  className="w-32 rounded border border-border bg-white px-2 py-1.5 text-right text-base md:text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
            )
          }

          if (field.kind === 'number-m') {
            const raw = (object as unknown as Record<string, number>)[field.key]
            return (
              <NumberField
                key={field.key}
                label={field.label}
                unit="m"
                step={field.step ?? 0.1}
                min={field.min}
                value={cmToM(raw)}
                onCommit={(v) => setProperty(object.id, field.key, mToCm(v))}
              />
            )
          }

          if (field.kind === 'number-deg') {
            return (
              <NumberField
                key={field.key}
                label={field.label}
                unit="°"
                step={field.step ?? 15}
                value={object.rotationDeg}
                onCommit={(v) => setProperty(object.id, field.key, ((v % 360) + 360) % 360)}
              />
            )
          }

          if (field.kind === 'select') {
            const value = String(object.properties[field.key] ?? field.options?.[0]?.value ?? '')
            return (
              <label key={field.key} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-text-secondary">{field.label}</span>
                <select
                  value={value}
                  onChange={(e) => setProperty(object.id, field.key, e.target.value)}
                  className="w-32 rounded border border-border bg-white px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
