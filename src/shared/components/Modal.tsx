import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ background: 'rgba(13,11,8,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-t-3xl p-6 pb-8"
        style={{ background: 'var(--kron-surface)', border: '1px solid rgba(160,104,64,0.2)', borderBottom: 'none' }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <h3
            className="text-xl font-bold uppercase tracking-widest mb-4"
            style={{ color: 'var(--kron-cream)', fontFamily: 'var(--font-main)' }}
          >
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  )
}
