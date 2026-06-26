import { useState } from 'react'
import {
  getDiagnosis,
  mapChipsToCombined,
  type SymptomChip,
  type Category,
} from '../../data/seed/diagnosis'
import { useBrewStore } from '../../store/brewStore'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'
import { PageHeader } from '../../shared/components/PageHeader'
import { Button } from '../../shared/components/Button'
import { METHODS } from '../../data/seed/methods'
import { db } from '../../data/db/database'

type Step = 'symptom' | 'category' | 'result'

const CHIPS: SymptomChip[] = ['acid', 'bitter', 'weak', 'perfect']
const CATEGORIES: Category[] = ['filtered', 'immersion', 'pressure']

const CHIP_COLOR: Record<SymptomChip, string> = {
  acid:    '#D4BF14',
  bitter:  '#8B3030',
  weak:    '#2F7CB8',
  perfect: '#3D8B4F',
}

const CATEGORY_COLOR: Record<Category, string> = {
  filtered:  '#A06840',
  immersion: '#4A7E9E',
  pressure:  '#9E4444',
}

export function Diagnosis() {
  const { selectedProfile, selectedMethodId, waterMl, coffeeG, customRatio } = useBrewStore()
  const lang = useSettingsStore(s => s.language)
  const t = getTranslations(lang)

  const method = METHODS.find(m => m.id === selectedMethodId)
  const autoCategory: Category | null =
    method?.category === 'filtered' ? 'filtered'
    : method?.category === 'immersion' ? 'immersion'
    : method?.category === 'pressure' ? 'pressure'
    : null

  const [step, setStep] = useState<Step>('symptom')
  const [selectedChips, setSelectedChips] = useState<Set<SymptomChip>>(new Set())
  const [category, setCategory] = useState<Category | null>(autoCategory)
  const [saved, setSaved] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const combinedSymptom = selectedChips.size > 0 ? mapChipsToCombined(selectedChips) : null
  const diagnosis = combinedSymptom && category ? getDiagnosis(combinedSymptom, category) : null
  const isPerfect = selectedChips.has('perfect')
  const symptomColor = selectedChips.size > 0
    ? (isPerfect ? CHIP_COLOR.perfect : CHIP_COLOR[Array.from(selectedChips)[0]])
    : 'var(--kron-amber)'

  const toggleChip = (chip: SymptomChip) => {
    setSelectedChips(prev => {
      const next = new Set(prev)
      if (chip === 'perfect') {
        if (next.has('perfect')) {
          next.delete('perfect')
        } else {
          next.clear()
          next.add('perfect')
        }
      } else {
        next.delete('perfect')
        if (next.has(chip)) {
          next.delete(chip)
        } else {
          next.add(chip)
        }
      }
      return next
    })
  }

  const handleConfirm = () => {
    if (selectedChips.size === 0) return
    if (autoCategory) {
      setCategory(autoCategory)
      setStep('result')
    } else {
      setStep('category')
    }
  }

  const handleCategory = (c: Category) => {
    setCategory(c)
    setStep('result')
  }

  const handleBack = () => {
    if (step === 'result') {
      if (autoCategory) setStep('symptom')
      else setStep('category')
    } else if (step === 'category') {
      setStep('symptom')
    }
  }

  const handleReset = () => {
    setStep('symptom')
    setSelectedChips(new Set())
    setCategory(autoCategory)
    setSaved(false)
    setNote('')
  }

  const handleSave = async () => {
    if (!selectedProfile || saving) return
    setSaving(true)
    try {
      await db.recipes.add({
        method_id: selectedMethodId ?? '',
        profile_id: selectedProfile.id,
        profile_name: selectedProfile.profile_name,
        method_name: method?.name ?? '',
        ratio: customRatio ?? selectedProfile.ratio,
        water_ml: waterMl,
        coffee_g: coffeeG,
        temp: selectedProfile.temp,
        grind: selectedProfile.grind,
        note,
        created_at: Date.now(),
        is_custom_ratio: customRatio !== null,
        adjustments: [],
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-black)' }}>
      <PageHeader
        title={t.diagnosis.title}
        right={step !== 'symptom' ? (
          <button
            onClick={handleBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl active:scale-90 transition-transform"
            style={{ background: 'rgba(160,104,64,0.1)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="var(--kron-amber)" strokeWidth="2.2" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        ) : undefined}
      />

      <div className="page-scroll safe-bottom px-4 pt-4">

        {/* ── Step: Symptom chips ── */}
        {step === 'symptom' && (
          <div className="flex flex-col gap-4">
            <p style={{
              fontFamily: 'var(--font-main)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--kron-amber)',
              opacity: 0.7,
              margin: 0,
            }}>
              {t.diagnosis.symptom}
            </p>

            {/* Chips grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}>
              {CHIPS.map(chip => {
                const isSelected = selectedChips.has(chip)
                const color = CHIP_COLOR[chip]
                return (
                  <button
                    key={chip}
                    onClick={() => toggleChip(chip)}
                    style={{
                      padding: '18px 14px',
                      borderRadius: 18,
                      background: isSelected
                        ? `${color}22`
                        : 'var(--kron-surface)',
                      border: isSelected
                        ? `2px solid ${color}`
                        : '2px solid rgba(160,104,64,0.15)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <div style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: color,
                      opacity: isSelected ? 1 : 0.4,
                      transition: 'opacity 150ms ease',
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-title)',
                      fontSize: 22,
                      color: isSelected ? 'var(--kron-white)' : 'var(--kron-cream)',
                      letterSpacing: '0.02em',
                      lineHeight: 1,
                    }}>
                      {t.diagnosis.symptoms[chip]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Confirm button — only when at least 1 chip selected */}
            {selectedChips.size > 0 && (
              <Button variant="primary" size="lg" fullWidth onClick={handleConfirm}
                style={{ marginTop: 4 }}>
                {t.diagnosis.confirm}
              </Button>
            )}
          </div>
        )}

        {/* ── Step: Category ── */}
        {step === 'category' && (
          <div className="flex flex-col gap-2.5">
            <p style={{
              fontFamily: 'var(--font-main)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--kron-amber)',
              opacity: 0.7,
              marginBottom: 6,
            }}>
              {t.diagnosis.category}
            </p>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => handleCategory(c)}
                className="w-full text-left active:scale-[0.98] transition-transform"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '14px 16px',
                  borderRadius: 16,
                  background: 'var(--kron-surface)',
                  borderTop: '1px solid rgba(160,104,64,0.12)',
                  borderRight: '1px solid rgba(160,104,64,0.12)',
                  borderBottom: '1px solid rgba(160,104,64,0.12)',
                  borderLeft: `4px solid ${CATEGORY_COLOR[c]}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: 22,
                    color: 'var(--kron-cream)',
                    letterSpacing: '0.03em',
                    display: 'block',
                  }}>
                    {t.diagnosis[c as keyof typeof t.diagnosis] as string}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--kron-amber)', opacity: 0.6 }}>
                    <CategoryHint id={c} lang={lang} />
                  </span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="var(--kron-amber)" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* ── Step: Result ── */}
        {step === 'result' && diagnosis && (
          <div className="flex flex-col gap-3 pb-4">
            {/* Cause card */}
            <div style={{
              borderRadius: 16,
              background: 'var(--kron-surface)',
              borderTop: `3px solid ${symptomColor}`,
              borderRight: '1px solid rgba(160,104,64,0.15)',
              borderBottom: '1px solid rgba(160,104,64,0.15)',
              borderLeft: '1px solid rgba(160,104,64,0.15)',
              padding: '16px 18px',
            }}>
              <p style={{
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--kron-amber)',
                marginBottom: 6,
                fontFamily: 'var(--font-main)',
              }}>
                {t.diagnosis.cause}
              </p>
              <p style={{
                fontFamily: 'var(--font-title)',
                fontSize: 28,
                color: 'var(--kron-cream)',
                lineHeight: 1.1,
                letterSpacing: '0.02em',
              }}>
                {t.diagnosis.causes[diagnosis.cause_key]}
              </p>
            </div>

            {/* Recommendations */}
            <div style={{
              borderRadius: 16,
              background: 'var(--kron-surface)',
              border: '1px solid rgba(160,104,64,0.15)',
              padding: '16px 18px',
            }}>
              <p style={{
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--kron-amber)',
                marginBottom: 12,
                fontFamily: 'var(--font-main)',
              }}>
                {t.diagnosis.recommendations}
              </p>
              <div className="flex flex-col gap-3">
                {diagnosis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: symptomColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--kron-black)', fontFamily: 'var(--font-main)' }}>
                        {i + 1}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--kron-cream)', opacity: 0.85 }}>
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Save recipe — only if active brew and perfect */}
            {selectedProfile && isPerfect && (
              <div style={{
                borderRadius: 16,
                background: 'var(--kron-surface)',
                border: '1px solid rgba(160,104,64,0.15)',
                padding: '16px 18px',
              }}>
                <p style={{
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--kron-amber)',
                  marginBottom: 10,
                  fontFamily: 'var(--font-main)',
                }}>
                  {t.recipes.note}
                </p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={t.recipes.notePlaceholder}
                  rows={2}
                  className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                  style={{
                    background: 'rgba(160,104,64,0.08)',
                    border: '1px solid rgba(160,104,64,0.2)',
                    color: 'var(--kron-cream)',
                    fontFamily: 'var(--font-main)',
                  }}
                />
                {!saved ? (
                  <Button variant="primary" size="md" fullWidth onClick={handleSave}
                    className="mt-3" disabled={saving}>
                    {t.diagnosis.saveExtraction}
                  </Button>
                ) : (
                  <div className="mt-3 py-3 text-center rounded-xl"
                    style={{ background: 'rgba(160,104,64,0.12)', color: 'var(--kron-amber)' }}>
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: 16, letterSpacing: '0.08em' }}>
                      ✓ {t.recipes.saved}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Save recipe for non-perfect */}
            {selectedProfile && !isPerfect && (
              <div style={{
                borderRadius: 16,
                background: 'var(--kron-surface)',
                border: '1px solid rgba(160,104,64,0.15)',
                padding: '16px 18px',
              }}>
                <p style={{
                  fontSize: 9,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--kron-amber)',
                  marginBottom: 10,
                  fontFamily: 'var(--font-main)',
                }}>
                  {t.recipes.note}
                </p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={t.recipes.notePlaceholder}
                  rows={2}
                  className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                  style={{
                    background: 'rgba(160,104,64,0.08)',
                    border: '1px solid rgba(160,104,64,0.2)',
                    color: 'var(--kron-cream)',
                    fontFamily: 'var(--font-main)',
                  }}
                />
                {!saved ? (
                  <Button variant="secondary" size="md" fullWidth onClick={handleSave}
                    className="mt-3" disabled={saving}>
                    {t.diagnosis.save}
                  </Button>
                ) : (
                  <div className="mt-3 py-3 text-center rounded-xl"
                    style={{ background: 'rgba(160,104,64,0.12)', color: 'var(--kron-amber)' }}>
                    <span style={{ fontFamily: 'var(--font-title)', fontSize: 16, letterSpacing: '0.08em' }}>
                      ✓ {t.recipes.saved}
                    </span>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="secondary" size="md" fullWidth
              onClick={handleReset}
              style={{ borderColor: 'rgba(160,104,64,0.3)', color: 'var(--kron-amber)' }}
            >
              {lang === 'pt' ? 'Nova Avaliação' : lang === 'es' ? 'Nueva Evaluación' : 'New Assessment'}
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}

function CategoryHint({ id, lang }: { id: Category; lang: string }) {
  const hints: Record<Category, Record<string, string>> = {
    filtered:  { pt: 'V60, Melitta, Chemex, Kalita, Colador', es: 'V60, Melitta, Chemex, Kalita, Colador', en: 'V60, Melitta, Chemex, Kalita, Cloth' },
    immersion: { pt: 'Prensa, Clever Dripper, Cold Brew', es: 'Prensa, Clever, Cold Brew', en: 'Press, Clever, Cold Brew' },
    pressure:  { pt: 'Espresso, Moka, AeroPress', es: 'Espresso, Moka, AeroPress', en: 'Espresso, Moka, AeroPress' },
  }
  return <>{hints[id][lang] ?? hints[id].pt}</>
}
