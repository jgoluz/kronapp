import { useEffect, useMemo, useState } from 'react'

const PHRASES: Record<string, string[]> = {
  pt: [
    'O café começa antes da primeira gota',
    'Extração é intenção',
    'Cada despejo tem um propósito',
    'O tempo também é um ingrediente',
  ],
  es: [
    'El café empieza antes de la primera gota',
    'Extraer es decidir',
    'Cada vertido tiene un propósito',
    'El tiempo también es un ingrediente',
  ],
  en: [
    'Coffee starts before the first drop',
    'Extraction is intention',
    'Every pour has a purpose',
    'Time is also an ingredient',
  ],
}

function detectLang(): string {
  const nav = navigator.language.toLowerCase()
  if (nav.startsWith('pt')) return 'pt'
  if (nav.startsWith('es')) return 'es'
  return 'en'
}

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true)

  const phrase = useMemo(() => {
    const lang = detectLang()
    const list = PHRASES[lang] ?? PHRASES.en
    return list[Math.floor(Math.random() * list.length)]
  }, [])

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), 2500)
    const done = setTimeout(() => onDone(), 2900)
    return () => {
      clearTimeout(hide)
      clearTimeout(done)
    }
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0D0B08',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 400ms ease',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <h1
        style={{
          fontFamily: 'Sansita',
          fontStyle: 'italic',
          fontWeight: 900,
          fontSize: 72,
          color: '#A06840',
          margin: 0,
          lineHeight: 1,
          letterSpacing: '-1px',
        }}
      >
        Koffie
      </h1>
      <p
        style={{
          fontFamily: 'Sansita',
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 15,
          color: '#7A4F2E',
          margin: '14px 0 0',
          textAlign: 'center',
          padding: '0 48px',
          lineHeight: 1.5,
        }}
      >
        {phrase}
      </p>
    </div>
  )
}
