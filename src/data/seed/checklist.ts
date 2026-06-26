export interface ChecklistStep {
  id: string
  label: string
  detail?: string
  waitMinutes?: number
}

export const COLD_BREW_CHECKLIST: ChecklistStep[] = [
  { id: 'cb1', label: 'Pesar o café', detail: 'Usar moagem grossa, maior que Prensa Francesa' },
  { id: 'cb2', label: 'Adicionar água fria filtrada', detail: 'Temperatura ambiente ou geladeira' },
  { id: 'cb3', label: 'Mexer bem para hidratar o café' },
  { id: 'cb4', label: 'Tampar e colocar na geladeira', detail: 'Temperatura ideal: 4-6°C' },
  { id: 'cb5', label: 'Aguardar 18-24 horas', waitMinutes: 18 * 60 },
  { id: 'cb6', label: 'Filtrar o café', detail: 'Usar filtro de papel ou pano fino' },
  { id: 'cb7', label: 'Armazenar filtrado na geladeira', detail: 'Consumir em até 2 semanas' },
]

export const MOKA_CHECKLIST: ChecklistStep[] = [
  { id: 'mk1', label: 'Pré-aquecer a água', detail: 'Usar água quente para evitar superextração na parte inferior' },
  { id: 'mk2', label: 'Encher o reservatório inferior', detail: 'Até a válvula de segurança, nunca acima' },
  { id: 'mk3', label: 'Encher o filtro com café', detail: 'Moagem médio-fina, sem tampar' },
  { id: 'mk4', label: 'Montar a Moka e colocar no fogo', detail: 'Fogo médio-baixo, tampo aberto' },
  { id: 'mk5', label: 'Aguardar o café subir', detail: 'Som de borbulhamento indica extração' },
  { id: 'mk6', label: 'Remover do fogo ao primeiro borbulhamento', detail: 'Não esperar borbulhamento intenso' },
  { id: 'mk7', label: 'Servir imediatamente', detail: 'Moka deve ser servida na hora' },
]
