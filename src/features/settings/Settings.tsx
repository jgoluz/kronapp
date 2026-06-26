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
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-black)' }}>
      <PageHeader title={t.settings.title} />

      <div className="page-scroll safe-bottom px-4 pt-5">

        {/* Language */}
        <Section label={t.settings.language}>
          <div style={{ display: 'flex', gap: 8 }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className="active:scale-95 transition-transform"
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '12px 8px',
                  borderRadius: 12,
                  background: language === lang.id ? 'var(--kron-amber)' : 'rgba(160,104,64,0.08)',
                  border: `1px solid ${language === lang.id ? 'var(--kron-amber)' : 'rgba(160,104,64,0.18)'}`,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 20 }}>{lang.flag}</span>
                <span style={{
                  fontFamily: 'var(--font-main)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: language === lang.id ? 'var(--kron-black)' : 'var(--kron-amber)',
                }}>
                  {lang.label}
                </span>
              </button>
            ))}
          </div>
        </Section>

        {/* Default water */}
        <Section label={t.settings.defaultWater}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input
              type="range"
              min={100}
              max={1000}
              step={10}
              value={defaultWater}
              onChange={e => setDefaultWater(Number(e.target.value))}
              className="flex-1 h-1 rounded-full appearance-none outline-none"
              style={{ accentColor: 'var(--kron-amber)' }}
            />
            <span style={{
              fontFamily: 'var(--font-title)',
              fontSize: 22,
              color: 'var(--kron-cream)',
              minWidth: 64,
              textAlign: 'right',
            }}>
              {defaultWater}ml
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 6,
            fontSize: 10,
            color: 'var(--kron-amber)',
            opacity: 0.4,
            fontFamily: 'var(--font-main)',
          }}>
            <span>100ml</span>
            <span>1000ml</span>
          </div>
        </Section>

        {/* Toggles */}
        <Section label="">
          <ToggleRow
            label={t.settings.vibration}
            value={vibration}
            onChange={setVibration}
          />
          <div style={{ height: 1, background: 'rgba(160,104,64,0.1)', margin: '10px 0' }} />
          <ToggleRow
            label={t.settings.sound}
            value={sound}
            onChange={setSound}
          />
        </Section>

        {/* About */}
        <Section label={t.settings.about}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(160,104,64,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: 22,
                  color: 'var(--kron-amber)',
                  letterSpacing: '0.02em',
                }}>K</span>
              </div>
              <div>
                <p style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: 22,
                  color: 'var(--kron-cream)',
                  lineHeight: 1,
                  letterSpacing: '0.04em',
                }}>
                  KOFFIE
                </p>
                <p style={{ fontSize: 11, color: 'var(--kron-amber)', opacity: 0.55 }}>
                  {t.settings.version} 1.0.0 · PWA Offline
                </p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--kron-cream)', opacity: 0.55, lineHeight: 1.5 }}>
              {t.settings.credits}
            </p>
          </div>
        </Section>

        {/* Clear data */}
        <div style={{ paddingBottom: 8 }}>
          {cleared ? (
            <div style={{
              padding: '14px',
              textAlign: 'center',
              borderRadius: 14,
              background: 'rgba(160,104,64,0.1)',
              color: 'var(--kron-amber)',
            }}>
              <span style={{ fontFamily: 'var(--font-title)', fontSize: 18, letterSpacing: '0.06em' }}>
                ✓ {language === 'pt' ? 'Dados apagados' : language === 'es' ? 'Datos borrados' : 'Data cleared'}
              </span>
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
    <div style={{ marginBottom: 20 }}>
      {label && (
        <p style={{
          fontFamily: 'var(--font-main)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--kron-amber)',
          opacity: 0.6,
          marginBottom: 8,
        }}>
          {label}
        </p>
      )}
      <div style={{
        borderRadius: 14,
        padding: '14px 16px',
        background: 'var(--kron-surface)',
        border: '1px solid rgba(160,104,64,0.15)',
      }}>
        {children}
      </div>
    </div>
  )
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
      <span style={{
        fontFamily: 'var(--font-main)',
        fontSize: 15,
        fontWeight: 600,
        color: 'var(--kron-cream)',
      }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!value)}
        style={{
          position: 'relative',
          width: 44,
          height: 24,
          borderRadius: 12,
          background: value ? 'var(--kron-amber)' : 'rgba(160,104,64,0.2)',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute',
          top: 2,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'var(--kron-white)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          transform: value ? 'translateX(22px)' : 'translateX(2px)',
          transition: 'transform 0.2s',
        }} />
      </button>
    </div>
  )
}
