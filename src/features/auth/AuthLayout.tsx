import type { ReactNode } from 'react'

export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-bg flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6">
          <div className="font-display text-2xl font-semibold text-text-primary">FluxoCit</div>
          <h1 className="mt-2 text-lg font-semibold text-text-primary">{title}</h1>
        </div>
        {children}
      </section>
    </main>
  )
}
