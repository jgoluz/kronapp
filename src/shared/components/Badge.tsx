import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'amber' | 'cream' | 'custom' | 'source'
}

const styles = {
  amber: { background: 'rgba(160,104,64,0.2)', color: 'var(--kron-amber)', border: '1px solid rgba(160,104,64,0.4)' },
  cream: { background: 'rgba(242,232,217,0.1)', color: 'var(--kron-cream)', border: '1px solid rgba(242,232,217,0.2)' },
  custom: { background: 'rgba(122,79,46,0.25)', color: 'var(--kron-white)', border: '1px solid var(--kron-primary)' },
  source: { background: 'rgba(74,48,32,0.4)', color: 'var(--kron-cream)', border: '1px solid rgba(160,104,64,0.3)' },
}

export function Badge({ children, variant = 'amber' }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-widest"
      style={{ fontFamily: 'var(--font-main)', ...styles[variant] }}
    >
      {children}
    </span>
  )
}
