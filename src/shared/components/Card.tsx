import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  dark?: boolean
  active?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export function Card({ children, dark, active, padding = 'md', className = '', style, ...props }: CardProps) {
  const bg = dark
    ? 'var(--kron-surface)'
    : 'rgba(242, 232, 217, 0.06)'
  const border = active
    ? '1.5px solid var(--kron-amber)'
    : '1px solid rgba(160, 104, 64, 0.2)'
  const pad = { sm: '12px', md: '16px', lg: '20px' }[padding]

  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{ background: bg, border, padding: pad, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}
