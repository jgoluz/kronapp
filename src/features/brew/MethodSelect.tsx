import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { METHODS } from '../../data/seed/methods'
import { BREW_PROFILES } from '../../data/seed/profiles'
import { useBrewStore } from '../../store/brewStore'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'
import { db, type SavedRecipe } from '../../data/db/database'

export function MethodSelect() {
  const navigate = useNavigate()
  const { setMethod, setProfile, setCustomRatio, setWater } = useBrewStore()
  const lang = useSettingsStore(s => s.language)
  const t = getTranslations(lang)

  const [now, setNow] = useState(new Date())
  const [lastRecipe, setLastRecipe] = useState<SavedRecipe | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    db.recipes.orderBy('created_at').reverse().first().then(r => setLastRecipe(r ?? null))
  }, [])

  const handleSelect = (id: string) => {
    setMethod(id as any)
    navigate(`/brew/profile/${id}`)
  }

  const handleRepeat = () => {
    if (!lastRecipe) return
    const method = METHODS.find(m => m.id === lastRecipe.method_id)
    const profile = BREW_PROFILES.find(p => p.id === lastRecipe.profile_id)
    if (!method || !profile) return
    setMethod(method.id)
    setProfile(profile)
    if (lastRecipe.is_custom_ratio) setCustomRatio(lastRecipe.ratio)
    setWater(lastRecipe.water_ml)
    navigate('/timer')
  }

  const hh = now.getHours().toString().padStart(2, '0')
  const mm = now.getMinutes().toString().padStart(2, '0')

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-black)' }}>
      <div className="page-scroll">

        {/* ── Hero ── */}
        <div
          style={{
            paddingTop: 'calc(env(safe-area-inset-top) + 28px)',
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 20,
            background: 'linear-gradient(180deg, var(--kron-surface) 0%, var(--kron-black) 100%)',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-title)',
            fontSize: 80,
            lineHeight: 1,
            color: 'var(--kron-amber)',
            letterSpacing: '-1px',
          }}>
            {hh}:{mm}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-title)',
            fontSize: 30,
            lineHeight: 1.1,
            color: 'var(--kron-cream)',
            margin: '6px 0 0',
            letterSpacing: '0.04em',
          }}>
            O QUE VAMOS<br />PREPARAR?
          </h1>

          {lastRecipe && (
            <div
              style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 16,
                background: 'rgba(160,104,64,0.1)',
                border: '1px solid rgba(160,104,64,0.22)',
              }}
            >
              <div>
                <span style={{
                  fontFamily: 'var(--font-main)',
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--kron-amber)',
                  display: 'block',
                  marginBottom: 2,
                }}>
                  {t.brew.lastBrew}
                </span>
                <span style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: 22,
                  color: 'var(--kron-cream)',
                  display: 'block',
                  lineHeight: 1,
                }}>
                  {lastRecipe.method_name}
                </span>
                <span style={{
                  fontSize: 12,
                  color: 'var(--kron-amber)',
                  opacity: 0.7,
                  display: 'block',
                  marginTop: 3,
                }}>
                  {lastRecipe.coffee_g}g · {lastRecipe.water_ml}ml · 1:{lastRecipe.ratio}
                </span>
              </div>
              <button
                onClick={handleRepeat}
                className="active:scale-95 transition-transform"
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: 17,
                  letterSpacing: '0.06em',
                  padding: '10px 18px',
                  borderRadius: 12,
                  background: 'var(--kron-amber)',
                  color: 'var(--kron-black)',
                  border: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {t.brew.repeat}
              </button>
            </div>
          )}
        </div>

        {/* ── Section label ── */}
        <div style={{ padding: '20px 20px 10px' }}>
          <p style={{
            fontFamily: 'var(--font-main)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--kron-amber)',
            opacity: 0.55,
            margin: 0,
          }}>
            {t.brew.selectMethod}
          </p>
        </div>

        {/* ── Method grid ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            padding: '0 16px',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
          }}
        >
          {METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => handleSelect(m.id)}
              className="active:scale-95 transition-transform text-left"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 16,
                borderRadius: 18,
                background: 'var(--kron-surface)',
                border: '1px solid rgba(160,104,64,0.15)',
                cursor: 'pointer',
              }}
            >
              <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <MethodIcon id={m.id} />
              </div>
              <span style={{
                fontFamily: 'var(--font-title)',
                fontSize: 19,
                color: 'var(--kron-cream)',
                lineHeight: 1.1,
                letterSpacing: '0.02em',
                display: 'block',
              }}>
                {t.methods[m.id as keyof typeof t.methods] ?? m.name}
              </span>
              <span style={{
                fontSize: 11,
                color: 'var(--kron-amber)',
                opacity: 0.6,
                marginTop: 4,
                lineHeight: 1.35,
                display: 'block',
              }}>
                {m.description}
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}

function MethodIcon({ id }: { id: string }) {
  const c = 'var(--kron-amber)'
  const base = {
    width: 32,
    height: 32,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: c,
    strokeWidth: '1.6',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (id) {
    case 'v60':
      // Wide inverted cone — very distinctive triangle
      return (
        <svg {...base}>
          <path d="M3 4H21L12 22Z" />
          <path d="M6 9H18" strokeWidth="1" opacity="0.5" />
        </svg>
      )
    case 'melitta':
      // Trapezoid with three drip holes
      return (
        <svg {...base}>
          <path d="M5 4H19L16 19H8Z" />
          <path d="M10 19V21M12 19V22M14 19V21" strokeWidth="1.4" />
        </svg>
      )
    case 'chemex':
      // Hourglass — two triangles meeting at waist
      return (
        <svg {...base}>
          <path d="M4 4H20L12 12L4 4Z" />
          <path d="M4 21H20L12 12L4 21Z" />
        </svg>
      )
    case 'kalita':
      // Flat funnel with wavy bottom edge
      return (
        <svg {...base}>
          <path d="M5 4H19L17 14C15.5 17 14 15.5 12 17C10 15.5 8.5 17 7 14Z" />
        </svg>
      )
    case 'colador':
      // Rounded cloth bag / pouch
      return (
        <svg {...base}>
          <path d="M9 3C9 3 4 5.5 4 12C4 17 7.5 21 12 21C16.5 21 20 17 20 12C20 5.5 15 3 15 3L12 2Z" />
          <path d="M9 3L12 2L15 3" strokeWidth="1.2" />
        </svg>
      )
    case 'prensa':
      // French press — rectangle with piston
      return (
        <svg {...base}>
          <rect x="7" y="7" width="10" height="13" rx="1" />
          <path d="M10 7V4M14 7V4" />
          <path d="M7 13H17" strokeWidth="1.4" />
        </svg>
      )
    case 'clever':
      // Square body with valve dots at bottom
      return (
        <svg {...base}>
          <rect x="5" y="4" width="14" height="14" rx="2" />
          <path d="M9 18V20M15 18V20" strokeWidth="1.4" />
          <circle cx="12" cy="22" r="1.2" fill={c} stroke="none" />
        </svg>
      )
    case 'cold_brew':
      return <span style={{ fontSize: 30, lineHeight: 1, display: 'block' }}>❄</span>
    case 'espresso':
      // Portafilter — ellipse top + handle + extraction dots
      return (
        <svg {...base}>
          <ellipse cx="12" cy="9" rx="7" ry="5" />
          <path d="M12 14V21" strokeWidth="1.8" />
          <circle cx="9" cy="9" r="1.3" fill={c} stroke="none" />
          <circle cx="12" cy="9" r="1.3" fill={c} stroke="none" />
          <circle cx="15" cy="9" r="1.3" fill={c} stroke="none" />
        </svg>
      )
    case 'moka':
      // Octagonal moka pot body with waist line
      return (
        <svg {...base}>
          <path d="M9 3H15L20 8V15L15 21H9L4 15V8Z" />
          <line x1="4" y1="11" x2="20" y2="11" strokeWidth="1.4" />
        </svg>
      )
    case 'aeropress':
      // Cylinder with plunger cap
      return (
        <svg {...base}>
          <rect x="8" y="7" width="8" height="13" rx="2" />
          <rect x="10" y="2" width="4" height="6" rx="1" />
          <path d="M8 16H16" strokeWidth="1.3" />
        </svg>
      )
    default:
      return <span style={{ fontSize: 20 }}>☕</span>
  }
}
