import type { ButtonHTMLAttributes } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  label: string
}

export function IconButton({ active, label, className = '', children, ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-md w-11 h-11 md:w-9 md:h-9 transition-[color,background-color,transform] duration-150 active:scale-[0.93] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 ${
        active ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-surface-alt hover:text-text-primary'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
