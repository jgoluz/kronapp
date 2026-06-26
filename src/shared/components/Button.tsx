import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<string, string> = {
  primary: 'text-[var(--kron-white)] font-bold uppercase tracking-widest',
  secondary: 'border border-[var(--kron-amber)] text-[var(--kron-amber)] font-semibold uppercase tracking-widest',
  ghost: 'text-[var(--kron-cream)] font-semibold',
  danger: 'text-red-400 border border-red-400 font-semibold uppercase tracking-widest',
}

const variantBg: Record<string, string> = {
  primary: 'var(--kron-primary)',
  secondary: 'transparent',
  ghost: 'transparent',
  danger: 'transparent',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth,
  style,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        active:scale-95 transition-transform duration-100 disabled:opacity-40
        flex items-center justify-center gap-2
        ${className}
      `}
      style={{ background: variantBg[variant], fontFamily: 'var(--font-main)', ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
