import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { METHODS } from '../../data/seed/methods'
import { BREW_PROFILES } from '../../data/seed/profiles'
import { useBrewStore } from '../../store/brewStore'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'
import { db } from '../../data/db/database'
import { PageHeader } from '../../shared/components/PageHeader'

export function NewRecipe() {
  const navigate = useNavigate()
  const { setMethod, setProfile, setWater } = useBrewStore()
  const { language } = useSettingsStore()
  const t = getTranslations(language)

  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [waterMl, setWaterMl] = useState(300)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const availableProfiles = selectedMethodId
    ? BREW_PROFILES.filter(p => p.method_id === selectedMethodId)
    : []

  const selectedProfile = BREW_PROFILES.find(p => p.id === selectedProfileId)
  const ratio = selectedProfile?.ratio ?? 16
  const coffeeG = Math.round((waterMl / ratio) * 10) / 10
  const canSave = selectedMethodId && selectedProfileId

  const handleSelectMethod = (id: string) => {
    setSelectedMethodId(id)
    setSelectedProfileId(null)
  }

  const handleSave = async (andBrew = false) => {
    if (!selectedProfile || !selectedMethodId || saving) return
    const method = METHODS.find(m => m.id === selectedMethodId)
    if (!method) return
    setSaving(true)
    try {
      await db.recipes.add({
        method_id: selectedMethodId,
        profile_id: selectedProfileId!,
        profile_name: selectedProfile.profile_name,
        method_name: method.name,
        ratio,
        water_ml: waterMl,
        coffee_g: coffeeG,
        temp: selectedProfile.temp,
        grind: selectedProfile.grind,
        note,
        created_at: Date.now(),
        is_custom_ratio: false,
        adjustments: [],
      })
      if (andBrew) {
        setMethod(method.id)
        setProfile(selectedProfile)
        setWater(waterMl)
        navigate('/timer')
      } else {
        navigate('/recipes')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-black)' }}>
      <PageHeader
        title={t.recipes.newRecipe}
        onBack={() => navigate('/recipes')}
      />

      <div className="page-scroll safe-bottom px-4 pt-5">

        {/* Method selector */}
        <FormSection label={t.brew.selectMethod}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            {METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => handleSelectMethod(m.id)}
                className="active:scale-95 transition-transform"
                style={{
                  padding: '7px 14px',
                  borderRadius: 20,
                  fontFamily: 'var(--font-main)',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: selectedMethodId === m.id ? 'var(--kron-amber)' : 'rgba(160,104,64,0.08)',
                  color: selectedMethodId === m.id ? 'var(--kron-black)' : 'var(--kron-amber)',
                  border: `1px solid ${selectedMethodId === m.id ? 'var(--kron-amber)' : 'rgba(160,104,64,0.2)'}`,
                  cursor: 'pointer',
                }}
              >
                {t.methods[m.id as keyof typeof t.methods] ?? m.name}
              </button>
            ))}
          </div>
        </FormSection>

        {/* Profile selector */}
        {availableProfiles.length > 0 && (
          <FormSection label={t.brew.selectProfile}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {availableProfiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProfileId(p.id)}
                  className="active:scale-95 transition-transform"
                  style={{
                    padding: '7px 14px',
                    borderRadius: 20,
                    fontFamily: 'var(--font-main)',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    background: selectedProfileId === p.id ? 'var(--kron-amber)' : 'rgba(160,104,64,0.08)',
                    color: selectedProfileId === p.id ? 'var(--kron-black)' : 'var(--kron-amber)',
                    border: `1px solid ${selectedProfileId === p.id ? 'var(--kron-amber)' : 'rgba(160,104,64,0.2)'}`,
                    cursor: 'pointer',
                  }}
                >
                  {t.profiles[p.profile_name as keyof typeof t.profiles] ?? p.profile_name}
                </button>
              ))}
            </div>
          </FormSection>
        )}

        {/* Water + Coffee */}
        {selectedProfile && (
          <FormSection label={`${t.brew.water} (ml)`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={() => setWaterMl((v: number) => Math.max(50, v - 10))}
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(160,104,64,0.1)', border: '1px solid rgba(160,104,64,0.2)',
                  color: 'var(--kron-amber)', fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >−</button>
              <input
                type="range" min={50} max={1000} step={10} value={waterMl}
                onChange={e => setWaterMl(Number(e.target.value))}
                className="flex-1 h-1 rounded-full appearance-none outline-none"
                style={{ accentColor: 'var(--kron-amber)' }}
              />
              <button
                onClick={() => setWaterMl((v: number) => Math.min(1000, v + 10))}
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(160,104,64,0.1)', border: '1px solid rgba(160,104,64,0.2)',
                  color: 'var(--kron-amber)', fontSize: 20, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <Param label={t.brew.water} value={`${waterMl}ml`} />
              <Param label={t.brew.coffee} value={`${coffeeG}g`} />
              <Param label={t.brew.ratio} value={`1:${ratio}`} />
              <Param label={t.brew.temperature} value={selectedProfile.temp ? `${selectedProfile.temp}°C` : 'Frio'} />
            </div>
          </FormSection>
        )}

        {/* Note */}
        <FormSection label={t.recipes.note}>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder={t.recipes.notePlaceholder}
            rows={3}
            className="w-full rounded-xl p-3 text-sm resize-none outline-none"
            style={{
              background: 'rgba(160,104,64,0.06)',
              border: '1px solid rgba(160,104,64,0.2)',
              color: 'var(--kron-cream)',
              fontFamily: 'var(--font-main)',
              fontSize: 14,
            }}
          />
        </FormSection>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 16 }}>
          <button
            onClick={() => handleSave(true)}
            disabled={!canSave || saving}
            className="active:scale-[0.98] transition-transform"
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 14,
              fontFamily: 'var(--font-title)',
              fontSize: 20,
              letterSpacing: '0.06em',
              background: canSave ? 'var(--kron-amber)' : 'rgba(160,104,64,0.2)',
              color: canSave ? 'var(--kron-black)' : 'rgba(160,104,64,0.4)',
              border: 'none',
              cursor: canSave ? 'pointer' : 'default',
            }}
          >
            {t.recipes.saveAndBrew}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={!canSave || saving}
            className="active:scale-[0.98] transition-transform"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 14,
              fontFamily: 'var(--font-title)',
              fontSize: 18,
              letterSpacing: '0.06em',
              background: 'transparent',
              color: canSave ? 'var(--kron-amber)' : 'rgba(160,104,64,0.3)',
              border: `1px solid ${canSave ? 'rgba(160,104,64,0.35)' : 'rgba(160,104,64,0.12)'}`,
              cursor: canSave ? 'pointer' : 'default',
            }}
          >
            {t.diagnosis.save}
          </button>
        </div>

      </div>
    </div>
  )
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{
        fontFamily: 'var(--font-main)',
        fontSize: 10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--kron-amber)',
        opacity: 0.65,
        marginBottom: 10,
      }}>
        {label}
      </p>
      <div style={{
        borderRadius: 14,
        background: 'var(--kron-surface)',
        border: '1px solid rgba(160,104,64,0.15)',
        padding: '14px 16px',
      }}>
        {children}
      </div>
    </div>
  )
}

function Param({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--kron-amber)', opacity: 0.6 }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-title)', fontSize: 18, color: 'var(--kron-cream)', marginTop: 2 }}>
        {value}
      </span>
    </div>
  )
}
