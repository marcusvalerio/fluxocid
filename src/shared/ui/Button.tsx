import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-surface text-text-primary border border-border hover:bg-surface-alt',
  danger: 'bg-white text-danger border border-danger/40 hover:bg-danger/5',
}

export function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 min-h-11 md:min-h-9 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
