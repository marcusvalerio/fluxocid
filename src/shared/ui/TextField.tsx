import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function TextField({ label, id, className = '', ...props }: TextFieldProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <label htmlFor={fieldId} className="block text-sm">
      <span className="block text-text-secondary mb-1.5">{label}</span>
      <input
        id={fieldId}
        className={`w-full rounded-md border border-border bg-surface px-3 py-2.5 text-base text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 ${className}`}
        {...props}
      />
    </label>
  )
}
