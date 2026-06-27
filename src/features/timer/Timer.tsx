import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBrewStore } from '../../store/brewStore'
import { useSettingsStore } from '../../store/settingsStore'
import { getTranslations } from '../../i18n'
import { COLD_BREW_CHECKLIST, MOKA_CHECKLIST } from '../../data/seed/checklist'
import type { TimerStep } from '../../data/seed/profiles'
import { Button } from '../../shared/components/Button'

export function Timer() {
  const navigate = useNavigate()
  const { selectedProfile, selectedMethodId, waterMl, coffeeG } = useBrewStore()
  const lang = useSettingsStore(s => s.language)
  const vibration = useSettingsStore(s => s.vibration)
  const t = getTranslations(lang)

  useEffect(() => {
    if (!selectedProfile) navigate('/brew')
  }, [selectedProfile, navigate])

  if (!selectedProfile) return null

  const timerType = selectedProfile.timer_type

  if (timerType === 'checklist') {
    const items = selectedMethodId === 'cold_brew' ? COLD_BREW_CHECKLIST : MOKA_CHECKLIST
    return <ChecklistTimer items={items} t={t} navigate={navigate} methodId={selectedMethodId ?? ''} />
  }

  if (timerType === 'espresso') {
    return (
      <EspressoTimer
        profile={selectedProfile}
        coffeeG={coffeeG}
        waterMl={waterMl}
        t={t}
        navigate={navigate}
        vibration={vibration}
      />
    )
  }

  return (
    <BrewTimer
      profile={selectedProfile}
      waterMl={waterMl}
      coffeeG={coffeeG}
      t={t}
      navigate={navigate}
      vibration={vibration}
    />
  )
}

// ─── Brew Timer (bloom + attacks) ────────────────────────────────────────────
function BrewTimer({ profile, waterMl, coffeeG, t, navigate, vibration }: {
  profile: any; waterMl: number; coffeeG: number
  t: any; navigate: any; vibration: boolean
}) {
  const steps: TimerStep[] = profile.steps

  // Scale only the final drain (wait) step proportionally to water volume.
  // Bloom and inter-attack waits stay fixed — they depend on grind, not volume.
  const scaledDurations = useMemo<number[]>(() => {
    return steps.map((step, i) => {
      const isLast = i === steps.length - 1
      if (isLast && step.action === 'wait' && profile.base_water_ml) {
        return Math.max(5, Math.round(step.duration * (waterMl / profile.base_water_ml)))
      }
      return step.duration
    })
  }, [steps, waterMl, profile])

  const [stepIdx, setStepIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  // Continuous stopwatch (starts on first pour, never pauses)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const brewStartedRef = useRef(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentDuration = scaledDurations[stepIdx]
  const currentStep = steps[stepIdx]
  const isPour = currentStep.action === 'pour'

  const startContinuousTimer = useCallback(() => {
    if (brewStartedRef.current) return
    brewStartedRef.current = true
    totalTimerRef.current = setInterval(() => setTotalElapsed(e => e + 1), 1000)
  }, [])

  const tick = useCallback(() => {
    setElapsed(e => {
      const next = e + 1
      if (next >= currentDuration) {
        if (vibration && navigator.vibrate) navigator.vibrate(200)
        return currentDuration
      }
      return next
    })
  }, [currentDuration, vibration])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, tick])

  useEffect(() => {
    if (!running || elapsed < currentDuration) return
    const id = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (stepIdx + 1 >= steps.length) {
        if (totalTimerRef.current) clearInterval(totalTimerRef.current)
        setRunning(false)
        setDone(true)
      } else {
        setStepIdx(i => i + 1)
        setElapsed(0)
      }
    }, 500)
    return () => clearTimeout(id)
  }, [elapsed, running, currentDuration, stepIdx, steps.length])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (totalTimerRef.current) clearInterval(totalTimerRef.current)
    }
  }, [])

  const handleStartPause = () => {
    startContinuousTimer()
    setRunning(r => !r)
  }

  const handleManualPrev = () => {
    if (stepIdx === 0) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setStepIdx(i => i - 1)
    setElapsed(0)
  }

  const handleManualNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    if (stepIdx + 1 >= steps.length) {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current)
      setDone(true)
    } else {
      setStepIdx(i => i + 1)
      setElapsed(0)
    }
  }

  const handleRestart = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (totalTimerRef.current) clearInterval(totalTimerRef.current)
    brewStartedRef.current = false
    setStepIdx(0)
    setElapsed(0)
    setRunning(false)
    setDone(false)
    setTotalElapsed(0)
  }

  if (done) {
    return <DoneScreen t={t} navigate={navigate} coffeeG={coffeeG} waterMl={waterMl} totalElapsed={totalElapsed} />
  }

  const progress = elapsed / currentDuration
  const waterForStep = currentStep.water_cumulative_percent != null
    ? Math.round(waterMl * currentStep.water_cumulative_percent)
    : null

  const stepLabel = getStepLabel(currentStep.label, t)

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-black)' }}>
      {/* Header */}
      <div className="px-5 flex items-center justify-between"
        style={{ paddingTop: `calc(env(safe-area-inset-top) + 16px)`, paddingBottom: 16 }}>
        <button onClick={handleRestart} className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(160,104,64,0.1)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--kron-amber)" strokeWidth="2" strokeLinecap="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
        </button>
        <span className="text-sm uppercase tracking-widest" style={{ color: 'var(--kron-amber)', fontFamily: 'var(--font-main)' }}>
          {t.timer.step} {stepIdx + 1} {t.timer.of} {steps.length}
        </span>
        <span style={{
          fontFamily: 'var(--font-main)',
          fontSize: 13,
          color: 'var(--kron-cream)',
          opacity: 0.4,
          minWidth: 36,
          textAlign: 'right',
        }}>
          {fmtTime(totalElapsed)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 px-5 mb-6">
        {steps.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all"
            style={{ background: i <= stepIdx ? 'var(--kron-amber)' : 'rgba(160,104,64,0.2)' }} />
        ))}
      </div>

      {/* Big timer circle */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="relative flex items-center justify-center mb-6">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(160,104,64,0.12)" strokeWidth="8" />
            <circle
              cx="110" cy="110" r="100"
              fill="none"
              stroke={isPour ? 'var(--kron-amber)' : 'rgba(160,104,64,0.35)'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 100}`}
              strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress)}`}
              transform="rotate(-90 110 110)"
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-6xl font-bold" style={{ color: 'var(--kron-white)', fontFamily: 'var(--font-main)' }}>
              {fmtTime(currentDuration - elapsed)}
            </span>
            <span className="text-sm uppercase tracking-widest mt-1"
              style={{ color: isPour ? 'var(--kron-amber)' : 'var(--kron-cream)', opacity: 0.7 }}>
              {stepLabel}
            </span>
          </div>
        </div>

        {/* Cumulative water target */}
        {waterForStep != null && isPour && (
          <div className="flex flex-col items-center mb-4">
            <span className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--kron-amber)', opacity: 0.6 }}>
              {t.timer.pourTo}
            </span>
            <span className="text-4xl font-bold" style={{ color: 'var(--kron-amber)', fontFamily: 'var(--font-main)' }}>
              {waterForStep}ml
            </span>
          </div>
        )}

        {/* Upcoming steps */}
        <div className="flex gap-2 flex-wrap justify-center mb-4">
          {steps.slice(stepIdx + 1, stepIdx + 4).map((s, i) => (
            <div key={i} className="px-3 py-1 rounded-full text-xs"
              style={{ background: 'rgba(74,48,32,0.4)', color: 'var(--kron-cream)', opacity: 0.5 }}>
              {getStepLabel(s.label, t)}{s.water_cumulative_percent != null
                ? ` → ${Math.round(waterMl * s.water_cumulative_percent)}ml`
                : ` ${fmtTime(s.duration)}`}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="px-5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
        <div className="flex justify-between items-center mb-3">
          <button
            onClick={handleManualPrev}
            disabled={stepIdx === 0}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: stepIdx === 0 ? 'transparent' : 'rgba(160,104,64,0.1)',
              border: '1px solid rgba(160,104,64,0.15)',
              color: 'var(--kron-amber)',
              opacity: stepIdx === 0 ? 0.2 : 0.6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: stepIdx === 0 ? 'default' : 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span style={{ fontSize: 10, color: 'var(--kron-amber)', opacity: 0.35, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-main)' }}>
            manual
          </span>
          <button
            onClick={handleManualNext}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(160,104,64,0.1)',
              border: '1px solid rgba(160,104,64,0.15)',
              color: 'var(--kron-amber)',
              opacity: 0.6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <Button
          variant="primary" size="lg" fullWidth
          onClick={handleStartPause}
          style={{ fontSize: 20, letterSpacing: '0.15em' }}
        >
          {!running
            ? (elapsed === 0 ? t.timer.pour : t.timer.resume)
            : t.timer.pause}
        </Button>
      </div>
    </div>
  )
}

// ─── Espresso Timer ──────────────────────────────────────────────────────────
function EspressoTimer({ profile, coffeeG, waterMl, t, navigate, vibration }: {
  profile: any; coffeeG: number; waterMl: number; t: any; navigate: any; vibration: boolean
}) {
  const steps = profile.steps
  const [stepIdx, setStepIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentStep = steps[stepIdx]

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => {
          const next = e + 1
          if (next >= currentStep.duration) {
            if (vibration && navigator.vibrate) navigator.vibrate([200, 100, 200])
            return currentStep.duration
          }
          return next
        })
        setTotalElapsed(e => e + 1)
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, currentStep, vibration])

  useEffect(() => {
    if (!running || elapsed < currentStep.duration) return
    const id = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (stepIdx + 1 >= steps.length) {
        setRunning(false)
        setDone(true)
      } else {
        setStepIdx(i => i + 1)
        setElapsed(0)
      }
    }, 400)
    return () => clearTimeout(id)
  }, [elapsed, running, currentStep.duration, stepIdx, steps.length])

  if (done) return <DoneScreen t={t} navigate={navigate} coffeeG={coffeeG} waterMl={waterMl} totalElapsed={totalElapsed} />

  const progress = elapsed / currentStep.duration

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-black)' }}>
      <div className="px-5 flex items-center justify-between"
        style={{ paddingTop: `calc(env(safe-area-inset-top) + 16px)`, paddingBottom: 16 }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(160,104,64,0.1)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--kron-amber)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-lg font-bold uppercase tracking-widest"
          style={{ color: 'var(--kron-white)', fontFamily: 'var(--font-main)' }}>
          Espresso
        </span>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="flex gap-6 mb-8">
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--kron-amber)', opacity: 0.7 }}>Dose</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--kron-white)', fontFamily: 'var(--font-main)' }}>{coffeeG}g</span>
          </div>
          <div className="w-px" style={{ background: 'rgba(160,104,64,0.2)' }} />
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--kron-amber)', opacity: 0.7 }}>Yield</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--kron-white)', fontFamily: 'var(--font-main)' }}>{waterMl}ml</span>
          </div>
          <div className="w-px" style={{ background: 'rgba(160,104,64,0.2)' }} />
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--kron-amber)', opacity: 0.7 }}>Temp</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--kron-white)', fontFamily: 'var(--font-main)' }}>{profile.temp}°</span>
          </div>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="100" fill="none" stroke="rgba(160,104,64,0.12)" strokeWidth="10" />
            <circle
              cx="110" cy="110" r="100"
              fill="none"
              stroke="var(--kron-amber)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 100}`}
              strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress)}`}
              transform="rotate(-90 110 110)"
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-bold" style={{ color: 'var(--kron-white)', fontFamily: 'var(--font-main)' }}>
              {fmtTime(totalElapsed)}
            </span>
            <span className="text-sm uppercase tracking-widest mt-1"
              style={{ color: 'var(--kron-amber)', opacity: 0.8 }}>
              {currentStep.label === 'pre_infusion' ? 'Pré-infusão' : 'Extração'}
            </span>
          </div>
        </div>

        <p className="text-center text-sm mb-6" style={{ color: 'var(--kron-cream)', opacity: 0.5 }}>
          {profile.notes}
        </p>
      </div>

      <div className="px-5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
        <Button variant="primary" size="lg" fullWidth onClick={() => {
          if (!running) { setRunning(true) }
          else if (elapsed >= currentStep.duration) {
            if (stepIdx + 1 >= steps.length) { setDone(true) }
            else { setStepIdx(i => i + 1); setElapsed(0) }
          }
          else { setRunning(false) }
        }}>
          {!running
            ? (elapsed === 0 ? 'Iniciar' : t.timer.resume)
            : elapsed >= currentStep.duration
            ? (stepIdx + 1 >= steps.length ? t.timer.finish : t.timer.next)
            : t.timer.pause}
        </Button>
      </div>
    </div>
  )
}

// ─── Checklist Timer ─────────────────────────────────────────────────────────
function ChecklistTimer({ items, t, navigate, methodId }: { items: any[]; t: any; navigate: any; methodId: string }) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allDone = checked.size === items.length
  const title = methodId === 'cold_brew' ? 'Cold Brew' : 'Moka'

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--kron-black)' }}>
      <div className="px-5 flex items-center gap-3"
        style={{ paddingTop: `calc(env(safe-area-inset-top) + 16px)`, paddingBottom: 16, borderBottom: '1px solid rgba(160,104,64,0.15)' }}>
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl"
          style={{ background: 'rgba(160,104,64,0.1)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--kron-amber)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold uppercase tracking-widest"
          style={{ color: 'var(--kron-white)', fontFamily: 'var(--font-main)' }}>
          {title}
        </h1>
      </div>

      <div className="page-scroll safe-bottom px-4 pt-4">
        <div className="flex flex-col gap-3 mb-6">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="flex items-start gap-4 p-4 rounded-2xl text-left active:scale-[0.98] transition-transform"
              style={{
                background: checked.has(item.id) ? 'rgba(122,79,46,0.2)' : 'rgba(242,232,217,0.04)',
                border: `1px solid ${checked.has(item.id) ? 'rgba(160,104,64,0.5)' : 'rgba(160,104,64,0.15)'}`,
              }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: checked.has(item.id) ? 'var(--kron-amber)' : 'transparent',
                  border: `2px solid ${checked.has(item.id) ? 'var(--kron-amber)' : 'rgba(160,104,64,0.4)'}`,
                }}>
                {checked.has(item.id) && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--kron-black)" strokeWidth="3" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-base font-semibold"
                  style={{
                    color: checked.has(item.id) ? 'var(--kron-cream)' : 'var(--kron-white)',
                    textDecoration: checked.has(item.id) ? 'line-through' : 'none',
                    opacity: checked.has(item.id) ? 0.5 : 1,
                    fontFamily: 'var(--font-main)',
                  }}>
                  {item.label}
                </p>
                {item.detail && (
                  <p className="text-xs mt-1" style={{ color: 'var(--kron-amber)', opacity: 0.6 }}>{item.detail}</p>
                )}
                {item.waitMinutes && (
                  <p className="text-xs mt-1 font-bold" style={{ color: 'var(--kron-amber)' }}>
                    ⏱ {Math.floor(item.waitMinutes / 60)}h de espera
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {allDone && (
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/diagnosis')}>
            Finalizar e Avaliar
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Done Screen ─────────────────────────────────────────────────────────────
function DoneScreen({ t, navigate, coffeeG, waterMl, totalElapsed }: {
  t: any; navigate: any; coffeeG: number; waterMl: number; totalElapsed: number
}) {
  const phrase = useMemo(() => {
    const phrases: string[] = t.timer.donePhrases
    return phrases[Math.floor(Math.random() * phrases.length)]
  }, [t])

  return (
    <div className="flex flex-col h-full items-center justify-center px-6" style={{ background: 'var(--kron-black)' }}>
      <p style={{
        fontFamily: 'var(--font-main)',
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--kron-cream)',
        opacity: 0.4,
        marginBottom: 16,
      }}>
        {t.timer.brewDone}
      </p>

      <div style={{
        fontFamily: 'var(--font-title)',
        fontSize: 80,
        lineHeight: 1,
        color: 'var(--kron-amber)',
        letterSpacing: '-1px',
        marginBottom: 4,
      }}>
        {fmtTimeLong(totalElapsed)}
      </div>

      <p style={{
        fontSize: 12,
        color: 'var(--kron-cream)',
        opacity: 0.35,
        marginBottom: 24,
      }}>
        {coffeeG}g · {waterMl}ml
      </p>

      <p style={{
        fontFamily: 'Sansita',
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 15,
        color: '#7A4F2E',
        textAlign: 'center',
        marginBottom: 48,
        padding: '0 24px',
        lineHeight: 1.5,
      }}>
        {phrase}
      </p>

      <div style={{ width: '100%' }}>
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/diagnosis')}>
          {t.timer.howWasIt}
        </Button>
        <button
          onClick={() => navigate('/brew')}
          style={{
            marginTop: 12,
            width: '100%',
            padding: '12px',
            background: 'transparent',
            border: 'none',
            color: 'var(--kron-amber)',
            opacity: 0.4,
            fontFamily: 'var(--font-main)',
            fontSize: 13,
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          {t.timer.newBrew}
        </button>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${String(rem).padStart(2, '0')}`
}

function fmtTimeLong(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${String(rem).padStart(2, '0')}s`
}

function getStepLabel(label: string, t: any): string {
  if (label === 'bloom') return t.timer.bloom
  if (label.startsWith('attack_')) return `${t.timer.attack} ${label.replace('attack_', '')}`
  if (label === 'wait') return t.timer.wait
  if (label === 'press') return 'Pressionar'
  if (label === 'pre_infusion') return 'Pré-infusão'
  if (label === 'extraction') return 'Extração'
  return label
}
