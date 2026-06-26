import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  subtitle?: string
  dark?: boolean
  onBack?: () => void
  right?: ReactNode
}

export function PageHeader({ title, subtitle, dark = true, onBack, right }: PageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) onBack()
    else navigate(-1)
  }

  return (
    <div
      className="flex items-center gap-3 px-5 pt-safe"
      style={{
        paddingTop: `calc(env(safe-area-inset-top) + 16px)`,
        paddingBottom: '16px',
        background: dark ? 'var(--kron-black)' : 'var(--kron-cream)',
        borderBottom: `1px solid ${dark ? 'rgba(160,104,64,0.15)' : 'rgba(122,79,46,0.15)'}`,
      }}
    >
      {onBack !== undefined && (
        <button
          onClick={handleBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-90 transition-transform"
          style={{ background: dark ? 'rgba(160,104,64,0.1)' : 'rgba(122,79,46,0.1)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={dark ? 'var(--kron-amber)' : 'var(--kron-primary)'} strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <div className="flex-1">
        <h1
          className="text-2xl font-bold uppercase leading-none"
          style={{ color: dark ? 'var(--kron-white)' : 'var(--kron-black)', fontFamily: 'var(--font-title)', letterSpacing: '0.04em' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: dark ? 'var(--kron-amber)' : 'var(--kron-primary)', opacity: 0.8 }}>
            {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  )
}
