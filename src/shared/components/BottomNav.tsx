import { useLocation, useNavigate } from 'react-router-dom'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'

const TABS = [
  { path: '/brew',      icon: BrewIcon,      key: 'brew' as const },
  { path: '/recipes',   icon: RecipesIcon,   key: 'recipes' as const },
  { path: '/diagnosis', icon: DiagnosisIcon, key: 'diagnosis' as const },
  { path: '/settings',  icon: SettingsIcon,  key: 'settings' as const },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const lang = useSettingsStore(s => s.language)
  const t = getTranslations(lang)

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)', background: 'var(--kron-surface)', borderTop: '1px solid rgba(122,79,46,0.2)' }}
    >
      <div className="flex items-stretch h-[56px]">
        {TABS.map(tab => {
          const active = location.pathname.startsWith(tab.path)
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-opacity"
              style={{ opacity: active ? 1 : 0.45 }}
            >
              <Icon active={active} />
              <span
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: active ? 'var(--kron-amber)' : 'var(--kron-cream)', letterSpacing: '0.08em' }}
              >
                {t.nav[tab.key]}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function BrewIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--kron-amber)' : 'var(--kron-cream)'} strokeWidth="1.8">
      <path d="M3 6h18M3 6v12a2 2 0 002 2h14a2 2 0 002-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11v6M9 14h6" strokeLinecap="round" />
    </svg>
  )
}

function RecipesIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--kron-amber)' : 'var(--kron-cream)'} strokeWidth="1.8">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  )
}

function DiagnosisIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--kron-amber)' : 'var(--kron-cream)'} strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--kron-amber)' : 'var(--kron-cream)'} strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
