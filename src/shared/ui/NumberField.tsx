import { useEffect, useState } from 'react'

interface NumberFieldProps {
  label: string
  value: number
  unit: string
  step?: number
  min?: number
  onCommit: (value: number) => void
}

export function NumberField({ label, value, unit, step = 1, min, onCommit }: NumberFieldProps) {
  const [text, setText] = useState(() => value.toString())

  useEffect(() => {
    setText(value.toString())
  }, [value])

  function handleBlur() {
    const parsed = Number.parseFloat(text.replace(',', '.'))
    if (Number.isNaN(parsed)) {
      setText(value.toString())
      return
    }
    const clamped = min !== undefined ? Math.max(min, parsed) : parsed
    onCommit(clamped)
    setText(clamped.toString())
  }

  return (
    <label className="flex items-center justify-between gap-2 text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="flex items-center gap-1">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          step={step}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          }}
          className="w-20 rounded border border-border bg-white px-2 py-1.5 text-right text-base md:text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <span className="text-text-secondary w-5">{unit}</span>
      </span>
    </label>
  )
}
