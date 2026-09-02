import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-surface text-text-primary border border-border hover:bg-surface-alt',
  danger: 'bg-surface text-danger border border-danger/40 hover:bg-danger/10',
}

export function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 min-h-11 md:min-h-9 text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}
