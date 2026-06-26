import { useNavigate } from 'react-router-dom'
import { METHODS } from '../../data/seed/methods'
import { useBrewStore } from '../../store/brewStore'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'
import { PageHeader } from '../../shared/components/PageHeader'

export function MethodSelect() {
  const navigate = useNavigate()
  const setMethod = useBrewStore(s => s.setMethod)
  const lang = useSettingsStore(s => s.language)
  const t = getTranslations(lang)

  const handleSelect = (id: string) => {
    setMethod(id as any)
    navigate(`/brew/profile/${id}`)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-black)' }}>
      <PageHeader title={t.brew.title} subtitle={t.brew.selectMethod} dark />
      <div className="page-scroll safe-bottom px-4 pt-4">
        <div className="grid grid-cols-2 gap-3 pb-4">
          {METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => handleSelect(m.id)}
              className="flex flex-col items-start p-4 rounded-2xl active:scale-95 transition-transform text-left"
              style={{ background: 'rgba(242,232,217,0.05)', border: '1px solid rgba(160,104,64,0.18)' }}
            >
              <span className="text-2xl mb-2">{m.emoji}</span>
              <span
                className="text-base font-bold uppercase tracking-wide leading-tight"
                style={{ color: 'var(--kron-white)', fontFamily: 'var(--font-main)' }}
              >
                {t.methods[m.id as keyof typeof t.methods] ?? m.name}
              </span>
              <span className="text-xs mt-1" style={{ color: 'var(--kron-amber)', opacity: 0.75 }}>
                {m.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
