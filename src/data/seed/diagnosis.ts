export type SymptomChip = 'acid' | 'bitter' | 'weak' | 'perfect'
export type Symptom = 'acid' | 'bitter' | 'weak' | 'perfect' | 'acid_weak' | 'bitter_weak' | 'acid_bitter'
export type Category = 'filtered' | 'immersion' | 'pressure'
export type CauseKey = 'underExtraction' | 'overExtraction' | 'ratioImbalance' | 'clearUnder' | 'bitterRatio' | 'irregular' | 'perfect'

export interface DiagnosisEntry {
  symptom: Symptom
  category: Category
  cause_key: CauseKey
  recommendations: string[]
}

export function mapChipsToCombined(chips: Set<SymptomChip>): Symptom {
  if (chips.has('perfect')) return 'perfect'
  const hasAcid = chips.has('acid')
  const hasBitter = chips.has('bitter')
  const hasWeak = chips.has('weak')
  if (hasAcid && hasBitter) return 'acid_bitter'
  if (hasAcid && hasWeak) return 'acid_weak'
  if (hasBitter && hasWeak) return 'bitter_weak'
  if (hasAcid) return 'acid'
  if (hasBitter) return 'bitter'
  if (hasWeak) return 'weak'
  return 'perfect'
}

export const DIAGNOSIS_DATA: DiagnosisEntry[] = [
  // ── Ácido ──────────────────────────────────────────────────────────────────
  {
    symptom: 'acid',
    category: 'filtered',
    cause_key: 'underExtraction',
    recommendations: [
      'Moer mais fino para aumentar extração',
      'Aumentar temperatura da água (92-96°C)',
      'Aumentar o tempo total de extração',
      'Garantir bloom adequado (40-45s)',
    ],
  },
  {
    symptom: 'acid',
    category: 'immersion',
    cause_key: 'underExtraction',
    recommendations: [
      'Aumentar tempo de infusão (+30-60s)',
      'Aumentar temperatura da água (+2-3°C)',
      'Agitar levemente o café durante a extração',
      'Verificar moagem — pode estar grossa demais',
    ],
  },
  {
    symptom: 'acid',
    category: 'pressure',
    cause_key: 'underExtraction',
    recommendations: [
      'Moer mais fino para aumentar resistência',
      'Verificar nível e uniformidade do tamp',
      'Aumentar temperatura da caldeira (+1-2°C)',
      'Verificar se o tempo de extração está entre 25-30s',
    ],
  },
  // ── Amargo ─────────────────────────────────────────────────────────────────
  {
    symptom: 'bitter',
    category: 'filtered',
    cause_key: 'overExtraction',
    recommendations: [
      'Moer mais grosso para reduzir extração',
      'Reduzir temperatura da água (-2-3°C)',
      'Reduzir tempo total de extração',
      'Reduzir a dose de café',
    ],
  },
  {
    symptom: 'bitter',
    category: 'immersion',
    cause_key: 'overExtraction',
    recommendations: [
      'Reduzir tempo de infusão (-30-60s)',
      'Servir imediatamente após o tempo ideal',
      'Reduzir temperatura da água (-2°C)',
      'Moer um pouco mais grosso',
    ],
  },
  {
    symptom: 'bitter',
    category: 'pressure',
    cause_key: 'overExtraction',
    recommendations: [
      'Moer mais grosso para reduzir resistência',
      'Reduzir temperatura da caldeira (-1-2°C)',
      'Verificar se o tempo de extração não passa de 30s',
      'Verificar uniformidade do tamp (não compactar demais)',
    ],
  },
  // ── Débil ──────────────────────────────────────────────────────────────────
  {
    symptom: 'weak',
    category: 'filtered',
    cause_key: 'ratioImbalance',
    recommendations: [
      'Aumentar a dose de café (mais 2-3g)',
      'Reduzir o ratio (menos água por grama de café)',
      'Moer um pouco mais fino',
      'Verificar se o bloom foi feito corretamente',
    ],
  },
  {
    symptom: 'weak',
    category: 'immersion',
    cause_key: 'ratioImbalance',
    recommendations: [
      'Aumentar a dose de café',
      'Reduzir o ratio (menos água por grama)',
      'Moer levemente mais fino para extrair mais',
      'Aumentar levemente o tempo de infusão',
    ],
  },
  {
    symptom: 'weak',
    category: 'pressure',
    cause_key: 'ratioImbalance',
    recommendations: [
      'Aumentar a dose de café (dose padrão: 18-20g)',
      'Reduzir o yield (menos bebida no copo)',
      'Moer mais fino para maior resistência',
      'Confirmar pressão de extração (ideal: 9 bar)',
    ],
  },
  // ── Ácido + Débil ──────────────────────────────────────────────────────────
  {
    symptom: 'acid_weak',
    category: 'filtered',
    cause_key: 'clearUnder',
    recommendations: [
      'Moer mais fino — principal ajuste a fazer',
      'Aumentar temperatura da água (+2-3°C)',
      'Adicionar mais café ou reduzir água',
      'Garantir bloom completo antes dos despejos',
    ],
  },
  {
    symptom: 'acid_weak',
    category: 'immersion',
    cause_key: 'clearUnder',
    recommendations: [
      'Moer mais fino para aumentar extração',
      'Aumentar temperatura da água (+2-3°C)',
      'Adicionar mais café ou reduzir água',
      'Aumentar tempo de imersão (+60s)',
    ],
  },
  {
    symptom: 'acid_weak',
    category: 'pressure',
    cause_key: 'clearUnder',
    recommendations: [
      'Moer mais fino para aumentar resistência',
      'Aumentar temperatura da caldeira (+1-2°C)',
      'Aumentar a dose de café',
      'Verificar se a extração está abaixo de 25s',
    ],
  },
  // ── Amargo + Débil ─────────────────────────────────────────────────────────
  {
    symptom: 'bitter_weak',
    category: 'filtered',
    cause_key: 'bitterRatio',
    recommendations: [
      'Reduzir a dose de café',
      'Reduzir temperatura da água (-1-2°C)',
      'Moer um pouco mais grosso',
      'Aumentar levemente a quantidade de água',
    ],
  },
  {
    symptom: 'bitter_weak',
    category: 'immersion',
    cause_key: 'bitterRatio',
    recommendations: [
      'Reduzir a dose de café',
      'Reduzir temperatura da água (-2°C)',
      'Reduzir tempo de infusão levemente',
      'Aumentar levemente o ratio (mais água)',
    ],
  },
  {
    symptom: 'bitter_weak',
    category: 'pressure',
    cause_key: 'bitterRatio',
    recommendations: [
      'Reduzir a dose de café (-2g)',
      'Reduzir temperatura da caldeira (-1-2°C)',
      'Aumentar o yield (mais bebida no copo)',
      'Verificar o tempo de extração (não passar de 30s)',
    ],
  },
  // ── Ácido + Amargo ─────────────────────────────────────────────────────────
  {
    symptom: 'acid_bitter',
    category: 'filtered',
    cause_key: 'irregular',
    recommendations: [
      'Revisar a técnica de despejo — distribuir uniformemente',
      'Moer mais fino e despejar em movimentos circulares',
      'Verificar se o filtro está bem posicionado',
      'Garantir que o bloom saturou todo o pó',
    ],
  },
  {
    symptom: 'acid_bitter',
    category: 'immersion',
    cause_key: 'irregular',
    recommendations: [
      'Agitar o café após o despejo para saturação uniforme',
      'Verificar uniformidade da moagem',
      'Ajustar temperatura para ponto médio',
      'Garantir que toda a água entrou em contato com o pó',
    ],
  },
  {
    symptom: 'acid_bitter',
    category: 'pressure',
    cause_key: 'irregular',
    recommendations: [
      'Revisar distribuição e nivelamento do pó no portafiltro',
      'Verificar uniformidade do tamp (pressão consistente)',
      'Purgar a máquina antes da extração',
      'Verificar se há canais de fluxo no pó',
    ],
  },
  // ── Perfeito ───────────────────────────────────────────────────────────────
  {
    symptom: 'perfect',
    category: 'filtered',
    cause_key: 'perfect',
    recommendations: [
      'Salvar esta receita para repetir!',
      'Anote o grão, torra e data de compra',
      'Mantenha os parâmetros e repita com consistência',
    ],
  },
  {
    symptom: 'perfect',
    category: 'immersion',
    cause_key: 'perfect',
    recommendations: [
      'Salvar esta receita para repetir!',
      'Anote o grão, torra e data de compra',
      'Mantenha os parâmetros e repita com consistência',
    ],
  },
  {
    symptom: 'perfect',
    category: 'pressure',
    cause_key: 'perfect',
    recommendations: [
      'Salvar esta receita para repetir!',
      'Anote o grão, torra e data de compra',
      'Mantenha os parâmetros e repita com consistência',
    ],
  },
]

export function getDiagnosis(symptom: Symptom, category: Category): DiagnosisEntry | undefined {
  return DIAGNOSIS_DATA.find(d => d.symptom === symptom && d.category === category)
}
