import { useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'
import { db } from '../../data/db/database'
import { PageHeader } from '../../shared/components/PageHeader'
import { Modal } from '../../shared/components/Modal'
import { Button } from '../../shared/components/Button'
import type { Language } from '../../i18n'

const LANGUAGES: { id: Language; label: string; flag: string }[] = [
  { id: 'pt', label: 'Português', flag: '🇧🇷' },
  { id: 'es', label: 'Español',   flag: '🇪🇸' },
  { id: 'en', label: 'English',   flag: '🇬🇧' },
]

export function Settings() {
  const {
    language, defaultWater, vibration, sound,
    setLanguage, setDefaultWater, setVibration, setSound,
  } = useSettingsStore()
  const t = getTranslations(language)
  const [showClearModal, setShowClearModal] = useState(false)
  const [cleared, setCleared] = useState(false)

  const handleClear = async () => {
    await db.recipes.clear()
    setShowClearModal(false)
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-cream)' }}>
      <PageHeader title={t.settings.title} dark={false} />

      <div className="page-scroll safe-bottom px-4 pt-4">
        {/* Language */}
        <Section label={t.settings.language}>
          <div className="flex gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl active:scale-95 transition-transform"
                style={{
                  background: language === lang.id ? 'var(--kron-primary)' : 'rgba(122,79,46,0.08)',
                  border: `1px solid ${language === lang.id ? 'var(--kron-primary)' : 'rgba(122,79,46,0.15)'}`,
                }}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: language === lang.id ? 'var(--kron-white)' : 'var(--kron-primary)', fontFamily: 'var(--font-main)' }}>
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* Default water */}
        <Section label={t.settings.defaultWater}>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={100}
              max={1000}
              step={10}
              value={defaultWater}
              onChange={e => setDefaultWater(Number(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none outline-none"
              style={{ accentColor: 'var(--kron-primary)' }}
            />
            <span className="text-lg font-bold w-16 text-right"
              style={{ color: 'var(--kron-black)', fontFamily: 'var(--font-main)' }}>
              {defaultWater}ml
            </span>
          </div>
        </Section>

        {/* Toggle: vibration */}
        <Section label="">
          <ToggleRow
            label={t.settings.vibration}
            value={vibration}
            onChange={setVibration}
          />
          <div style={{ height: 1, background: 'rgba(122,79,46,0.1)', margin: '8px 0' }} />
          <ToggleRow
            label={t.settings.sound}
            value={sound}
            onChange={setSound}
          />
        </Section>

        {/* About */}
        <Section label={t.settings.about}>
          <div className="flex flex-col gap-1">
            <p className="text-sm" style={{ color: 'var(--kron-primary)', opacity: 0.7 }}>
              {t.settings.credits}
            </p>
            <p className="text-xs" style={{ color: 'var(--kron-primary)', opacity: 0.45 }}>
              {t.settings.version} 1.0.0 · PWA Offline
            </p>
          </div>
        </Section>

        {/* Clear data */}
        <div className="pb-4">
          {cleared ? (
            <div className="py-3 text-center rounded-xl" style={{ background: 'rgba(122,79,46,0.1)', color: 'var(--kron-primary)' }}>
              <span className="font-bold uppercase tracking-widest text-sm">✓ Dados apagados</span>
            </div>
          ) : (
            <Button
              variant="danger" size="md" fullWidth
              onClick={() => setShowClearModal(true)}
              style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'rgba(239,68,68,0.8)' }}
            >
              {t.settings.clearData}
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        title={t.settings.confirmClear}
      >
        <div className="flex gap-3">
          <Button variant="ghost" size="md" fullWidth onClick={() => setShowClearModal(false)}>
            {language === 'pt' ? 'Cancelar' : language === 'es' ? 'Cancelar' : 'Cancel'}
          </Button>
          <Button variant="danger" size="md" fullWidth onClick={handleClear}>
            {language === 'pt' ? 'Apagar' : language === 'es' ? 'Borrar' : 'Clear'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      {label && (
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--kron-amber)', fontFamily: 'var(--font-main)' }}>
          {label}
        </p>
      )}
      <div className="rounded-2xl p-4" style={{ background: 'white', border: '1px solid rgba(122,79,46,0.12)' }}>
        {children}
      </div>
    </div>
  )
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm font-semibold" style={{ color: 'var(--kron-black)', fontFamily: 'var(--font-main)' }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{ background: value ? 'var(--kron-primary)' : 'rgba(122,79,46,0.2)' }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: value ? 'translateX(22px)' : 'translateX(2px)' }}
        />
      </button>
    </div>
  )
}
