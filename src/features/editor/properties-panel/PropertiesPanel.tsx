import { AlertTriangle, BringToFront, Copy, RotateCcw, RotateCw, SendToBack, Trash2 } from 'lucide-react'
import { OBJECT_CATALOG } from '../objects/catalog'
import { useEditorStore } from '../state/useEditorStore'
import { cmToM, mToCm } from '../../../shared/lib/units'
import { NumberField } from '../../../shared/ui/NumberField'
import { IconButton } from '../../../shared/ui/IconButton'
import type { BoundsStatus } from '../../../shared/lib/spatialRules'
import type { LayoutObject } from '../../../types/layout'

interface PropertiesPanelProps {
  object: LayoutObject
  hasOverlap?: boolean
  boundsStatus?: BoundsStatus
}

const BOUNDS_WARNING_TEXT: Partial<Record<BoundsStatus, string>> = {
  partial: 'Parcialmente fora do ambiente — parte do objeto ultrapassa o limite.',
  outside: 'Totalmente fora do ambiente — o objeto está fora dos limites definidos.',
}

export function PropertiesPanel({ object, hasOverlap, boundsStatus }: PropertiesPanelProps) {
  const setProperty = useEditorStore((s) => s.setProperty)
  const deleteObject = useEditorStore((s) => s.deleteObject)
  const duplicateObject = useEditorStore((s) => s.duplicateObject)
  const rotateObject = useEditorStore((s) => s.rotateObject)
  const commitObject = useEditorStore((s) => s.commitObject)
  const objects = useEditorStore((s) => s.objects)

  const def = OBJECT_CATALOG[object.objectType]
  const boundsWarning = boundsStatus ? BOUNDS_WARNING_TEXT[boundsStatus] : undefined

  function bringToFront() {
    if (objects.length < 2) return
    const maxZ = Math.max(...objects.map((o) => o.zIndex))
    if (object.zIndex === maxZ) return
    commitObject(object.id, { zIndex: maxZ + 1 })
  }

  function sendToBack() {
    if (objects.length < 2) return
    const minZ = Math.min(...objects.map((o) => o.zIndex))
    if (object.zIndex === minZ) return
    commitObject(object.id, { zIndex: minZ - 1 })
  }

  return (
    <div className="space-y-4">
      {hasOverlap && (
        <div className="flex items-start gap-2 rounded-md bg-danger/10 text-danger text-sm p-2.5">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>Sobreposto com outro porta-paletes ou corredor — ajuste a posição.</span>
        </div>
      )}
      {boundsWarning && (
        <div className="flex items-start gap-2 rounded-md bg-warning/10 text-warning text-sm p-2.5">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{boundsWarning}</span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-base font-semibold text-text-primary">{def.label}</h2>
        <div className="flex gap-1">
          <IconButton label="Trazer para frente" onClick={bringToFront}>
            <BringToFront size={18} />
          </IconButton>
          <IconButton label="Enviar para trás" onClick={sendToBack}>
            <SendToBack size={18} />
          </IconButton>
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
                <input type="text" value={value} placeholder={def.label} onChange={(e) => setProperty(object.id, field.key, e.target.value)} className="w-32 rounded border border-border bg-white px-2 py-1.5 text-right text-base md:text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </label>
            )
          }
          if (field.kind === 'number-m') {
            const raw = (object as unknown as Record<string, number>)[field.key]
            return <NumberField key={field.key} label={field.label} unit="m" step={field.step ?? 0.1} min={field.min} value={cmToM(raw)} onCommit={(v) => setProperty(object.id, field.key, mToCm(v))} />
          }
          if (field.kind === 'number-deg') {
            return <NumberField key={field.key} label={field.label} unit="°" step={field.step ?? 15} value={object.rotationDeg} onCommit={(v) => setProperty(object.id, field.key, ((v % 360) + 360) % 360)} />
          }
          if (field.kind === 'number-plain') {
            const raw = Number(object.properties[field.key] ?? 0)
            return <NumberField key={field.key} label={field.label} unit={field.unit ?? ''} step={field.step ?? 1} min={field.min} value={raw} onCommit={(v) => setProperty(object.id, field.key, v)} />
          }
          if (field.kind === 'select') {
            const value = String(object.properties[field.key] ?? field.options?.[0]?.value ?? '')
            return (
              <label key={field.key} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-text-secondary">{field.label}</span>
                <select value={value} onChange={(e) => setProperty(object.id, field.key, e.target.value)} className="w-32 rounded border border-border bg-white px-2 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary/40">
                  {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>
            )
          }
          if (field.kind === 'info') {
            return <div key={field.key} className="flex items-center justify-between gap-2 text-sm"><span className="text-text-secondary">{field.label}</span><span className="text-text-primary font-medium">{field.compute?.(object)}</span></div>
          }
          return null
        })}
      </div>
    </div>
  )
}