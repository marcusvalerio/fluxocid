import { Button } from './Button'
import { Panel } from './Panel'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Lightweight confirmation overlay for destructive actions (BR: "confirmar exclusões
 * destrutivas") — deliberately minimal (no portal/focus-trap library) to match the rest of the
 * app's hand-rolled UI kit. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
      role="presentation"
    >
      <Panel className="w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-heading text-base font-semibold text-text-primary mb-2">{title}</h2>
        <p className="text-sm text-text-secondary mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </Panel>
    </div>
  )
}
