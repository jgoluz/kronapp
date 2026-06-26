export type Symptom = 'acid' | 'bitter' | 'weak' | 'strong' | 'perfect'
export type Category = 'filtered' | 'immersion' | 'pressure'

export interface DiagnosisEntry {
  symptom: Symptom
  category: Category
  cause_key: 'underExtraction' | 'overExtraction' | 'lowDose' | 'highDose' | 'perfect'
  recommendations: string[]
}

export const DIAGNOSIS_DATA: DiagnosisEntry[] = [
  // Ácida + filtrado
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
  // Ácida + imersão
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
  // Ácida + pressão
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
  // Amarga + filtrado
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
  // Amarga + imersão
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
  // Amarga + pressão
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
  // Fraca + filtrado
  {
    symptom: 'weak',
    category: 'filtered',
    cause_key: 'lowDose',
    recommendations: [
      'Aumentar a dose de café (mais 2-3g)',
      'Moer um pouco mais fino',
      'Reduzir o ratio (menos água por grama de café)',
      'Verificar se o bloom foi feito corretamente',
    ],
  },
  // Fraca + imersão
  {
    symptom: 'weak',
    category: 'immersion',
    cause_key: 'lowDose',
    recommendations: [
      'Aumentar a dose de café',
      'Reduzir o ratio (menos água por grama)',
      'Moer um pouco mais fino para extrair mais',
      'Aumentar levemente o tempo de infusão',
    ],
  },
  // Fraca + pressão
  {
    symptom: 'weak',
    category: 'pressure',
    cause_key: 'lowDose',
    recommendations: [
      'Aumentar a dose de café (dose padrão: 18-20g)',
      'Moer mais fino para maior resistência',
      'Verificar temperatura da máquina (ideal: 90-94°C)',
      'Confirmar pressão de extração (ideal: 9 bar)',
    ],
  },
  // Forte + filtrado
  {
    symptom: 'strong',
    category: 'filtered',
    cause_key: 'highDose',
    recommendations: [
      'Reduzir a dose de café (-2-3g)',
      'Aumentar a quantidade de água (maior ratio)',
      'Moer um pouco mais grosso',
    ],
  },
  // Forte + imersão
  {
    symptom: 'strong',
    category: 'immersion',
    cause_key: 'highDose',
    recommendations: [
      'Reduzir a dose de café',
      'Aumentar a quantidade de água (maior ratio)',
      'Reduzir o tempo de infusão levemente',
    ],
  },
  // Forte + pressão
  {
    symptom: 'strong',
    category: 'pressure',
    cause_key: 'highDose',
    recommendations: [
      'Reduzir a dose de café (-2g)',
      'Aumentar o yield (mais bebida no copo)',
      'Aumentar o ratio de extração',
    ],
  },
  // Perfeita (todas as categorias)
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
