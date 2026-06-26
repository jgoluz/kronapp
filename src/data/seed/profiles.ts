import type { MethodId } from './methods'

export type ProfileId = string
export type GrindSize = 'fine' | 'mediumFine' | 'medium' | 'mediumCoarse' | 'coarse'
export type Source = 'hoffmann' | 'bsca' | 'wbc' | 'sca'
export type TimerType = 'bloom_attacks' | 'immersion' | 'checklist' | 'espresso'

export interface TimerStep {
  label: string          // 'bloom' | 'attack_1' | 'attack_2' | 'wait' | ...
  duration: number       // seconds
  water_cumulative_percent?: number  // 0-1, for bloom_attacks type
  action: 'pour' | 'wait' | 'check'
}

export interface BrewProfile {
  id: ProfileId
  method_id: MethodId
  profile_name: string   // 'clareza' | 'docura' | 'corpo' | 'acidez' | etc
  ratio: number          // coffee-to-water (water per 1g coffee)
  temp: number | null    // celsius, null = cold
  grind: GrindSize
  bloom_percent: number  // 0-1
  attacks: number
  timer_type: TimerType
  source: Source
  steps: TimerStep[]
  notes?: string
}

// Helper to build bloom+attacks steps
function bloomAttacks(
  bloomPercent: number,
  bloomDuration: number,
  waitAfterBloom: number,
  attackDurations: number[],  // pour duration each attack
  waitBetween: number,
  finalWait: number,
): TimerStep[] {
  const steps: TimerStep[] = []
  // bloom
  steps.push({ label: 'bloom', duration: bloomDuration, water_cumulative_percent: bloomPercent, action: 'pour' })
  steps.push({ label: 'wait', duration: waitAfterBloom, action: 'wait' })
  // attacks
  const remainPercent = 1 - bloomPercent
  const perAttack = remainPercent / attackDurations.length
  attackDurations.forEach((dur, i) => {
    const cumPercent = bloomPercent + perAttack * (i + 1)
    steps.push({ label: `attack_${i + 1}`, duration: dur, water_cumulative_percent: cumPercent, action: 'pour' })
    if (i < attackDurations.length - 1) {
      steps.push({ label: 'wait', duration: waitBetween, action: 'wait' })
    }
  })
  steps.push({ label: 'wait', duration: finalWait, action: 'wait' })
  return steps
}

export const BREW_PROFILES: BrewProfile[] = [
  // V60
  {
    id: 'v60_clareza',
    method_id: 'v60',
    profile_name: 'clareza',
    ratio: 16.5,
    temp: 95,
    grind: 'mediumFine',
    bloom_percent: 0.12,
    attacks: 2,
    timer_type: 'bloom_attacks',
    source: 'hoffmann',
    steps: bloomAttacks(0.12, 45, 45, [30, 30], 60, 60),
  },
  {
    id: 'v60_docura',
    method_id: 'v60',
    profile_name: 'docura',
    ratio: 15,
    temp: 92,
    grind: 'mediumFine',
    bloom_percent: 0.10,
    attacks: 3,
    timer_type: 'bloom_attacks',
    source: 'bsca',
    steps: bloomAttacks(0.10, 40, 40, [25, 25, 25], 50, 60),
  },
  {
    id: 'v60_corpo',
    method_id: 'v60',
    profile_name: 'corpo',
    ratio: 14,
    temp: 91,
    grind: 'medium',
    bloom_percent: 0.10,
    attacks: 3,
    timer_type: 'bloom_attacks',
    source: 'bsca',
    steps: bloomAttacks(0.10, 40, 40, [25, 25, 25], 55, 60),
  },
  // Melitta
  {
    id: 'melitta_docura',
    method_id: 'melitta',
    profile_name: 'docura',
    ratio: 15,
    temp: 92,
    grind: 'medium',
    bloom_percent: 0.10,
    attacks: 3,
    timer_type: 'bloom_attacks',
    source: 'bsca',
    steps: bloomAttacks(0.10, 40, 40, [25, 25, 25], 50, 60),
  },
  {
    id: 'melitta_corpo',
    method_id: 'melitta',
    profile_name: 'corpo',
    ratio: 14,
    temp: 91,
    grind: 'mediumCoarse',
    bloom_percent: 0.10,
    attacks: 3,
    timer_type: 'bloom_attacks',
    source: 'bsca',
    steps: bloomAttacks(0.10, 40, 40, [25, 25, 25], 55, 65),
  },
  // Chemex
  {
    id: 'chemex_clareza',
    method_id: 'chemex',
    profile_name: 'clareza',
    ratio: 17,
    temp: 95,
    grind: 'coarse',
    bloom_percent: 0.10,
    attacks: 3,
    timer_type: 'bloom_attacks',
    source: 'sca',
    steps: bloomAttacks(0.10, 45, 45, [30, 30, 30], 60, 90),
  },
  {
    id: 'chemex_docura',
    method_id: 'chemex',
    profile_name: 'docura',
    ratio: 15,
    temp: 92,
    grind: 'mediumCoarse',
    bloom_percent: 0.10,
    attacks: 3,
    timer_type: 'bloom_attacks',
    source: 'bsca',
    steps: bloomAttacks(0.10, 45, 45, [25, 25, 25], 60, 90),
  },
  // Kalita
  {
    id: 'kalita_clareza',
    method_id: 'kalita',
    profile_name: 'clareza',
    ratio: 16,
    temp: 93,
    grind: 'mediumFine',
    bloom_percent: 0.10,
    attacks: 3,
    timer_type: 'bloom_attacks',
    source: 'bsca',
    steps: bloomAttacks(0.10, 40, 40, [25, 25, 25], 50, 60),
  },
  {
    id: 'kalita_docura',
    method_id: 'kalita',
    profile_name: 'docura',
    ratio: 15,
    temp: 91,
    grind: 'medium',
    bloom_percent: 0.10,
    attacks: 3,
    timer_type: 'bloom_attacks',
    source: 'bsca',
    steps: bloomAttacks(0.10, 40, 40, [25, 25, 25], 55, 60),
  },
  // Colador de Pano
  {
    id: 'colador_corpo',
    method_id: 'colador',
    profile_name: 'corpo',
    ratio: 11,
    temp: 91,
    grind: 'mediumCoarse',
    bloom_percent: 0,
    attacks: 1,
    timer_type: 'bloom_attacks',
    source: 'bsca',
    steps: [
      { label: 'attack_1', duration: 60, water_cumulative_percent: 1, action: 'pour' },
      { label: 'wait', duration: 180, action: 'wait' },
    ],
    notes: 'Despejo único contínuo e lento',
  },
  // Prensa Francesa
  {
    id: 'prensa_corpo',
    method_id: 'prensa',
    profile_name: 'corpo',
    ratio: 12,
    temp: 93,
    grind: 'coarse',
    bloom_percent: 0,
    attacks: 1,
    timer_type: 'immersion',
    source: 'bsca',
    steps: [
      { label: 'attack_1', duration: 30, water_cumulative_percent: 1, action: 'pour' },
      { label: 'wait', duration: 240, action: 'wait' },
    ],
    notes: 'Imersão total por 4 minutos, pressionar lentamente',
  },
  {
    id: 'prensa_docura',
    method_id: 'prensa',
    profile_name: 'docura',
    ratio: 14,
    temp: 91,
    grind: 'coarse',
    bloom_percent: 0,
    attacks: 1,
    timer_type: 'immersion',
    source: 'bsca',
    steps: [
      { label: 'attack_1', duration: 30, water_cumulative_percent: 1, action: 'pour' },
      { label: 'wait', duration: 210, action: 'wait' },
    ],
    notes: 'Imersão total por 3:30 minutos',
  },
  // Clever Dripper
  {
    id: 'clever_corpo',
    method_id: 'clever',
    profile_name: 'corpo',
    ratio: 13,
    temp: 92,
    grind: 'medium',
    bloom_percent: 0,
    attacks: 1,
    timer_type: 'immersion',
    source: 'bsca',
    steps: [
      { label: 'attack_1', duration: 30, water_cumulative_percent: 1, action: 'pour' },
      { label: 'wait', duration: 180, action: 'wait' },
    ],
    notes: 'Abrir a válvula após 3 minutos de imersão',
  },
  // Cold Brew
  {
    id: 'cold_brew_concentrado',
    method_id: 'cold_brew',
    profile_name: 'concentrado',
    ratio: 10,
    temp: null,
    grind: 'coarse',
    bloom_percent: 0,
    attacks: 0,
    timer_type: 'checklist',
    source: 'sca',
    steps: [
      { label: 'check', duration: 0, action: 'check' },
    ],
  },
  {
    id: 'cold_brew_pronto',
    method_id: 'cold_brew',
    profile_name: 'pronto',
    ratio: 15,
    temp: null,
    grind: 'coarse',
    bloom_percent: 0,
    attacks: 0,
    timer_type: 'checklist',
    source: 'sca',
    steps: [
      { label: 'check', duration: 0, action: 'check' },
    ],
  },
  // Espresso
  {
    id: 'espresso_corpo',
    method_id: 'espresso',
    profile_name: 'corpo',
    ratio: 2,
    temp: 93,
    grind: 'fine',
    bloom_percent: 0,
    attacks: 1,
    timer_type: 'espresso',
    source: 'wbc',
    steps: [
      { label: 'pre_infusion', duration: 5, action: 'wait' },
      { label: 'extraction', duration: 25, action: 'wait' },
    ],
    notes: '25-28s de extração, 9 bar',
  },
  {
    id: 'espresso_docura',
    method_id: 'espresso',
    profile_name: 'docura',
    ratio: 2.2,
    temp: 92,
    grind: 'fine',
    bloom_percent: 0,
    attacks: 1,
    timer_type: 'espresso',
    source: 'wbc',
    steps: [
      { label: 'pre_infusion', duration: 5, action: 'wait' },
      { label: 'extraction', duration: 28, action: 'wait' },
    ],
    notes: '27-30s de extração, 9 bar',
  },
  {
    id: 'espresso_acidez',
    method_id: 'espresso',
    profile_name: 'acidez',
    ratio: 2.5,
    temp: 90,
    grind: 'mediumFine',
    bloom_percent: 0,
    attacks: 1,
    timer_type: 'espresso',
    source: 'wbc',
    steps: [
      { label: 'pre_infusion', duration: 4, action: 'wait' },
      { label: 'extraction', duration: 23, action: 'wait' },
    ],
    notes: '23-26s de extração, 9 bar',
  },
  // Moka
  {
    id: 'moka_corpo',
    method_id: 'moka',
    profile_name: 'corpo',
    ratio: 7,
    temp: 83,
    grind: 'fine',
    bloom_percent: 0,
    attacks: 0,
    timer_type: 'checklist',
    source: 'sca',
    steps: [
      { label: 'check', duration: 0, action: 'check' },
    ],
    notes: 'Usar água pré-aquecida, fogo médio-baixo',
  },
  // AeroPress
  {
    id: 'aeropress_clareza',
    method_id: 'aeropress',
    profile_name: 'clareza',
    ratio: 16,
    temp: 86,
    grind: 'medium',
    bloom_percent: 0,
    attacks: 1,
    timer_type: 'immersion',
    source: 'sca',
    steps: [
      { label: 'attack_1', duration: 20, water_cumulative_percent: 1, action: 'pour' },
      { label: 'wait', duration: 90, action: 'wait' },
      { label: 'press', duration: 30, action: 'pour' },
    ],
    notes: 'Método invertido — pressionar suavemente por 30s',
  },
  {
    id: 'aeropress_corpo',
    method_id: 'aeropress',
    profile_name: 'corpo',
    ratio: 10,
    temp: 91,
    grind: 'mediumFine',
    bloom_percent: 0,
    attacks: 1,
    timer_type: 'immersion',
    source: 'sca',
    steps: [
      { label: 'attack_1', duration: 20, water_cumulative_percent: 1, action: 'pour' },
      { label: 'wait', duration: 120, action: 'wait' },
      { label: 'press', duration: 30, action: 'pour' },
    ],
    notes: 'Método invertido — pressionar suavemente por 30s',
  },
  {
    id: 'aeropress_docura',
    method_id: 'aeropress',
    profile_name: 'docura',
    ratio: 13,
    temp: 89,
    grind: 'medium',
    bloom_percent: 0,
    attacks: 1,
    timer_type: 'immersion',
    source: 'sca',
    steps: [
      { label: 'attack_1', duration: 20, water_cumulative_percent: 1, action: 'pour' },
      { label: 'wait', duration: 100, action: 'wait' },
      { label: 'press', duration: 30, action: 'pour' },
    ],
    notes: 'Método invertido — pressionar suavemente por 30s',
  },
]
