import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDiagnosis, type Symptom, type Category } from '../../data/seed/diagnosis'
import { useBrewStore } from '../../store/brewStore'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'
import { PageHeader } from '../../shared/components/PageHeader'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import { METHODS } from '../../data/seed/methods'
import { db } from '../../data/db/database'

type Step = 'symptom' | 'category' | 'result'

const SYMPTOMS: { id: Symptom; emoji: string }[] = [
  { id: 'acid',    emoji: '🍋' },
  { id: 'bitter',  emoji: '😬' },
  { id: 'weak',    emoji: '💧' },
  { id: 'strong',  emoji: '💪' },
  { id: 'perfect', emoji: '✨' },
]

const CATEGORIES: { id: Category; emoji: string }[] = [
  { id: 'filtered',  emoji: '▽' },
  { id: 'immersion', emoji: '⬛' },
  { id: 'pressure',  emoji: '⚡' },
]

export function Diagnosis() {
  const navigate = useNavigate()
  const { selectedProfile, selectedMethodId, waterMl, coffeeG, customRatio } = useBrewStore()
  const lang = useSettingsStore(s => s.language)
  const t = getTranslations(lang)

  // Pre-fill category from current method if available
  const method = METHODS.find(m => m.id === selectedMethodId)
  const autoCategory: Category | null =
    method?.category === 'filtered' ? 'filtered'
    : method?.category === 'immersion' ? 'immersion'
    : method?.category === 'pressure' ? 'pressure'
    : null

  const [step, setStep] = useState<Step>('symptom')
  const [symptom, setSymptom] = useState<Symptom | null>(null)
  const [category, setCategory] = useState<Category | null>(autoCategory)
  const [saved, setSaved] = useState(false)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const diagnosis = symptom && category ? getDiagnosis(symptom, category) : null

  const handleSymptom = (s: Symptom) => {
    setSymptom(s)
    if (s === 'perfect' && autoCategory) {
      setCategory(autoCategory)
      setStep('result')
    } else if (s === 'perfect') {
      setStep('category')
    } else {
      setStep('category')
    }
  }

  const handleCategory = (c: Category) => {
    setCategory(c)
    setStep('result')
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
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-cream)' }}>
      <PageHeader title={t.diagnosis.title} dark={false}
        right={step !== 'symptom' && (
          <button onClick={() => {
            if (step === 'result') setStep('category')
            else if (step === 'category') setStep('symptom')
          }} className="text-xs uppercase tracking-widest font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: 'rgba(122,79,46,0.1)', color: 'var(--kron-primary)' }}>
            Voltar
          </button>
        ) as any}
      />

      <div className="page-scroll safe-bottom px-4 pt-4">
        {/* Step: Symptom */}
        {step === 'symptom' && (
          <div className="flex flex-col gap-3">
            <p className="text-base font-semibold mb-2" style={{ color: 'var(--kron-primary)', fontFamily: 'var(--font-main)' }}>
              {t.diagnosis.symptom}
            </p>
            {SYMPTOMS.map(s => (
              <button
                key={s.id}
                onClick={() => handleSymptom(s.id)}
                className="flex items-center gap-4 p-4 rounded-2xl active:scale-[0.98] transition-transform text-left"
                style={{ background: 'white', border: '1px solid rgba(122,79,46,0.12)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <span className="text-3xl">{s.emoji}</span>
                <span className="text-xl font-bold uppercase tracking-wide"
                  style={{ color: 'var(--kron-black)', fontFamily: 'var(--font-main)' }}>
                  {t.diagnosis.symptoms[s.id]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step: Category */}
        {step === 'category' && (
          <div className="flex flex-col gap-3">
            <p className="text-base font-semibold mb-2" style={{ color: 'var(--kron-primary)', fontFamily: 'var(--font-main)' }}>
              {t.diagnosis.category}
            </p>
            {CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => handleCategory(c.id)}
                className="flex items-center gap-4 p-4 rounded-2xl active:scale-[0.98] transition-transform text-left"
                style={{ background: 'white', border: '1px solid rgba(122,79,46,0.12)', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
              >
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-xl font-bold uppercase tracking-wide"
                  style={{ color: 'var(--kron-black)', fontFamily: 'var(--font-main)' }}>
                  {t.diagnosis[c.id as keyof typeof t.diagnosis] as string}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step: Result */}
        {step === 'result' && diagnosis && (
          <div className="flex flex-col gap-4 pb-4">
            {/* Symptom + cause */}
            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(122,79,46,0.12)' }}>
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--kron-amber)' }}>
                {t.diagnosis.cause}
              </p>
              <p className="text-2xl font-bold uppercase"
                style={{ color: 'var(--kron-black)', fontFamily: 'var(--font-main)' }}>
                {t.diagnosis.causes[diagnosis.cause_key]}
              </p>
            </div>

            {/* Recommendations */}
            <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(122,79,46,0.12)' }}>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--kron-amber)' }}>
                {t.diagnosis.recommendations}
              </p>
              <div className="flex flex-col gap-2">
                {diagnosis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--kron-amber)', minWidth: 20 }}>
                      <span className="text-[10px] font-bold" style={{ color: 'var(--kron-black)' }}>{i + 1}</span>
                    </div>
                    <p className="text-sm leading-snug" style={{ color: 'var(--kron-black)' }}>{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Save recipe section (only if there's an active brew) */}
            {selectedProfile && (
              <div className="rounded-2xl p-5" style={{ background: 'white', border: '1px solid rgba(122,79,46,0.12)' }}>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--kron-amber)' }}>
                  {t.recipes.note}
                </p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={t.recipes.notePlaceholder}
                  rows={2}
                  className="w-full rounded-xl p-3 text-sm resize-none outline-none"
                  style={{
                    background: 'var(--kron-cream)',
                    border: '1px solid rgba(122,79,46,0.2)',
                    color: 'var(--kron-black)',
                    fontFamily: 'var(--font-main)',
                  }}
                />
                {!saved ? (
                  <Button variant="primary" size="md" fullWidth onClick={handleSave} className="mt-3"
                    disabled={saving}>
                    {t.diagnosis.save}
                  </Button>
                ) : (
                  <div className="mt-3 py-3 text-center rounded-xl"
                    style={{ background: 'rgba(122,79,46,0.1)', color: 'var(--kron-primary)' }}>
                    <span className="font-bold uppercase tracking-widest text-sm">✓ {t.recipes.saved}</span>
                  </div>
                )}
              </div>
            )}

            <Button variant="secondary" size="md" fullWidth
              onClick={() => { setStep('symptom'); setSaved(false); setNote('') }}
              style={{ borderColor: 'rgba(122,79,46,0.3)', color: 'var(--kron-primary)' }}>
              Nova Avaliação
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
