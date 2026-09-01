import type { PropsWithChildren } from 'react'
import { X } from 'lucide-react'

interface BottomSheetProps {
  title: string
  onClose: () => void
  /**
   * When true (default), a full-screen backdrop captures the close tap — used for
   * the object library, which should be modal. The properties sheet passes false so
   * the canvas underneath stays interactive (the user can still drag/select objects
   * while it's open); it's dismissed via the explicit close button or by deselecting
   * on the canvas instead. See docs/UX.md § 2.2.
   *
   * Both variants stop above the fixed bottom action bar (see EditorPage's footer)
   * so its undo/redo/insert controls stay reachable while a sheet is open.
   */
  modal?: boolean
}

export function BottomSheet({ title, onClose, modal = true, children }: PropsWithChildren<BottomSheetProps>) {
  return (
    <div
      className={`fixed inset-x-0 top-0 bottom-16 z-30 flex flex-col justify-end md:hidden ${modal ? '' : 'pointer-events-none'}`}
      role="dialog"
      aria-label={title}
    >
      {modal && <button aria-label="Fechar" onClick={onClose} className="absolute inset-0 bg-black/30" />}
      <div className="relative bg-surface rounded-t-xl border-t border-border shadow-lg max-h-full flex flex-col pointer-events-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="mx-auto absolute left-1/2 -translate-x-1/2 -top-2 w-10 h-1 rounded-full bg-border" />
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          <button aria-label="Fechar" onClick={onClose} className="w-9 h-9 flex items-center justify-center text-text-secondary">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  )
}
