import { useNavigate, useParams } from 'react-router-dom'
import { BREW_PROFILES } from '../../data/seed/profiles'
import { METHODS } from '../../data/seed/methods'
import { useBrewStore } from '../../store/brewStore'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'
import { PageHeader } from '../../shared/components/PageHeader'
import { Badge } from '../../shared/components/Badge'

const SOURCE_LABELS: Record<string, string> = {
  hoffmann: 'James Hoffmann',
  bsca: 'BSCA',
  wbc: 'WBC',
  sca: 'SCA',
}

export function ProfileSelect() {
  const { methodId } = useParams<{ methodId: string }>()
  const navigate = useNavigate()
  const { setProfile } = useBrewStore()
  const lang = useSettingsStore(s => s.language)
  const t = getTranslations(lang)

  const method = METHODS.find(m => m.id === methodId)
  const profiles = BREW_PROFILES.filter(p => p.method_id === methodId)

  const handleSelect = (profile: typeof profiles[0]) => {
    setProfile(profile)
    navigate(`/brew/calculator`)
  }

  if (!method) return null

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-black)' }}>
      <PageHeader
        title={t.methods[method.id as keyof typeof t.methods] ?? method.name}
        subtitle={t.brew.selectProfile}
        dark
        onBack={() => navigate('/brew')}
      />
      <div className="page-scroll safe-bottom px-4 pt-4">
        <div className="flex flex-col gap-3 pb-4">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className="flex flex-col gap-3 p-4 rounded-2xl active:scale-[0.98] transition-transform text-left"
              style={{ background: 'rgba(242,232,217,0.05)', border: '1px solid rgba(160,104,64,0.18)' }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xl font-bold uppercase tracking-wider"
                  style={{ color: 'var(--kron-white)', fontFamily: 'var(--font-main)' }}
                >
                  {t.profiles[p.profile_name as keyof typeof t.profiles] ?? p.profile_name}
                </span>
                <Badge variant="source">{SOURCE_LABELS[p.source]}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <ParamChip label={t.brew.ratio} value={`1:${p.ratio}`} />
                <ParamChip label={t.brew.temperature} value={p.temp ? `${p.temp}°C` : 'Frio'} />
                <ParamChip label={t.brew.grind} value={t.grind[p.grind as keyof typeof t.grind]} />
              </div>
              {p.notes && (
                <p className="text-xs" style={{ color: 'var(--kron-amber)', opacity: 0.7 }}>{p.notes}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ParamChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center p-2 rounded-xl" style={{ background: 'rgba(74,48,32,0.3)' }}>
      <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--kron-amber)', opacity: 0.7 }}>
        {label}
      </span>
      <span className="text-sm font-bold mt-0.5" style={{ color: 'var(--kron-cream)', fontFamily: 'var(--font-main)' }}>
        {value}
      </span>
    </div>
  )
}
