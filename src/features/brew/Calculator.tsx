import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrewStore } from '../../store/brewStore'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'
import { PageHeader } from '../../shared/components/PageHeader'
import { Button } from '../../shared/components/Button'
import { Badge } from '../../shared/components/Badge'
import { METHODS } from '../../data/seed/methods'


const SOURCE_LABELS: Record<string, string> = {
  hoffmann: 'James Hoffmann',
  bsca: 'BSCA',
  wbc: 'WBC',
  sca: 'SCA',
}

export function Calculator() {
  const navigate = useNavigate()
  const {
    selectedProfile, selectedMethodId, calcMode,
    waterMl, coffeeG, customRatio,
    setCalcMode, setWater, setCoffee, setCustomRatio,
  } = useBrewStore()
  const lang = useSettingsStore(s => s.language)
  const t = getTranslations(lang)
  const [showRatioEdit, setShowRatioEdit] = useState(false)
  const [ratioInput, setRatioInput] = useState('')

  if (!selectedProfile || !selectedMethodId) {
    navigate('/brew')
    return null
  }

  const method = METHODS.find(m => m.id === selectedMethodId)
  const isCustomRatio = customRatio !== null
  const ratio = customRatio ?? selectedProfile.ratio
  const isChecklist = selectedProfile.timer_type === 'checklist'

  const handleRatioApply = () => {
    const v = parseFloat(ratioInput)
    if (!isNaN(v) && v > 0) setCustomRatio(v)
    setShowRatioEdit(false)
  }

  const handleResetRatio = () => {
    setCustomRatio(null)
    setShowRatioEdit(false)
  }

  const handleStart = () => {
    navigate('/timer')
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-black)' }}>
      <PageHeader
        title={method ? (t.methods[method.id as keyof typeof t.methods] ?? method.name) : ''}
        subtitle={t.profiles[selectedProfile.profile_name as keyof typeof t.profiles] ?? selectedProfile.profile_name}
        dark
        onBack={() => navigate(-1)}
      />

      <div className="page-scroll safe-bottom px-4 pt-4">
        {/* Source badge */}
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="source">{SOURCE_LABELS[selectedProfile.source]}</Badge>
          {isCustomRatio && <Badge variant="custom">{t.brew.custom}</Badge>}
        </div>

        {/* Calc mode toggle */}
        {!isChecklist && (
          <div
            className="flex rounded-xl overflow-hidden mb-5"
            style={{ border: '1px solid rgba(160,104,64,0.25)' }}
          >
            {(['byWater', 'byCoffee'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setCalcMode(mode)}
                className="flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors"
                style={{
                  fontFamily: 'var(--font-main)',
                  background: calcMode === mode ? 'var(--kron-primary)' : 'transparent',
                  color: calcMode === mode ? 'var(--kron-white)' : 'var(--kron-amber)',
                }}
              >
                {mode === 'byWater' ? t.brew.byWater : t.brew.byCoffee}
              </button>
            ))}
          </div>
        )}

        {/* Main number input */}
        {!isChecklist && (
          <div className="flex flex-col gap-4 mb-6">
            {calcMode === 'byWater' ? (
              <InputSlider
                label={t.brew.water}
                unit="ml"
                value={waterMl}
                min={100}
                max={1500}
                step={10}
                onChange={setWater}
                dark
              />
            ) : (
              <InputSlider
                label={t.brew.coffee}
                unit="g"
                value={coffeeG}
                min={5}
                max={100}
                step={0.5}
                onChange={v => setCoffee(Math.round(v * 10) / 10)}
                dark
              />
            )}

            {/* Result */}
            <div
              className="rounded-2xl p-4"
              style={{ background: 'rgba(74,48,32,0.3)', border: '1px solid rgba(160,104,64,0.2)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--kron-amber)' }}>
                    {calcMode === 'byWater' ? t.brew.coffee : t.brew.water}
                  </span>
                  <span className="text-4xl font-bold" style={{ color: 'var(--kron-white)', fontFamily: 'var(--font-main)' }}>
                    {calcMode === 'byWater'
                      ? `${coffeeG}g`
                      : `${waterMl}ml`
                    }
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--kron-amber)' }}>
                    {t.brew.ratio}
                  </span>
                  <button
                    onClick={() => { setRatioInput(String(ratio)); setShowRatioEdit(true) }}
                    className="flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <span className="text-xl font-bold" style={{ color: isCustomRatio ? 'var(--kron-amber)' : 'var(--kron-cream)' }}>
                      1:{ratio}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--kron-amber)" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Params summary */}
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(242,232,217,0.04)', border: '1px solid rgba(160,104,64,0.15)' }}>
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--kron-amber)' }}>{t.brew.params}</p>
          <div className="grid grid-cols-2 gap-3">
            <ParamRow label={t.brew.temperature} value={selectedProfile.temp ? `${selectedProfile.temp}°C` : 'Frio'} />
            <ParamRow label={t.brew.grind} value={t.grind[selectedProfile.grind as keyof typeof t.grind]} />
            {selectedProfile.bloom_percent > 0 && (
              <ParamRow label={t.brew.bloom} value={`${Math.round(selectedProfile.bloom_percent * 100)}%`} />
            )}
            {selectedProfile.attacks > 0 && (
              <ParamRow label={t.brew.attacks} value={String(selectedProfile.attacks)} />
            )}
          </div>
          {selectedProfile.notes && (
            <p className="text-xs mt-3" style={{ color: 'var(--kron-amber)', opacity: 0.65 }}>{selectedProfile.notes}</p>
          )}
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
          {t.brew.start}
        </Button>
        <div className="h-4" />
      </div>

      {/* Ratio edit overlay */}
      {showRatioEdit && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(13,11,8,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowRatioEdit(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-t-3xl p-6 pb-10"
            style={{ background: 'var(--kron-surface)', border: '1px solid rgba(160,104,64,0.2)', borderBottom: 'none' }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--kron-cream)' }}>
              {t.brew.adjust}
            </h3>
            <input
              type="number"
              value={ratioInput}
              onChange={e => setRatioInput(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-2xl font-bold text-center mb-4 outline-none"
              style={{
                background: 'rgba(242,232,217,0.07)',
                border: '1.5px solid var(--kron-amber)',
                color: 'var(--kron-white)',
                fontFamily: 'var(--font-main)',
              }}
              placeholder={String(selectedProfile.ratio)}
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="secondary" size="md" fullWidth onClick={handleResetRatio}>
                Reset
              </Button>
              <Button variant="primary" size="md" fullWidth onClick={handleRatioApply}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InputSlider({
  label, unit, value, min, max, step, onChange, dark,
}: {
  label: string; unit: string; value: number; min: number; max: number; step: number
  onChange: (v: number) => void; dark?: boolean
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm uppercase tracking-widest" style={{ color: 'var(--kron-amber)' }}>{label}</span>
        <div className="flex items-baseline gap-1">
          <input
            type="number"
            value={value}
            onChange={e => onChange(parseFloat(e.target.value) || min)}
            className="w-24 text-right text-3xl font-bold bg-transparent outline-none"
            style={{ color: 'var(--kron-white)', fontFamily: 'var(--font-main)' }}
          />
          <span className="text-base" style={{ color: 'var(--kron-amber)' }}>{unit}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none outline-none cursor-pointer"
        style={{ accentColor: 'var(--kron-amber)', background: 'rgba(160,104,64,0.2)' }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs" style={{ color: 'var(--kron-amber)', opacity: 0.4 }}>{min}{unit}</span>
        <span className="text-xs" style={{ color: 'var(--kron-amber)', opacity: 0.4 }}>{max}{unit}</span>
      </div>
    </div>
  )
}

function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--kron-amber)', opacity: 0.7 }}>{label}</span>
      <span className="text-sm font-semibold" style={{ color: 'var(--kron-cream)' }}>{value}</span>
    </div>
  )
}
