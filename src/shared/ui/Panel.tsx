import type { PropsWithChildren } from 'react'

export function Panel({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`bg-surface border border-border rounded-lg shadow-sm ${className}`}>{children}</div>
  )
}
