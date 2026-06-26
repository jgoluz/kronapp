export type MethodCategory = 'filtered' | 'immersion' | 'pressure' | 'checklist'
export type MethodId =
  | 'v60' | 'melitta' | 'chemex' | 'kalita' | 'colador'
  | 'prensa' | 'clever' | 'cold_brew' | 'espresso' | 'moka' | 'aeropress'

export interface Method {
  id: MethodId
  name: string
  emoji: string
  category: MethodCategory
  description: string
  isChecklist?: boolean
}

export const METHODS: Method[] = [
  { id: 'v60',      name: 'V60',            emoji: '▽', category: 'filtered',  description: 'Coador cônico de precisão' },
  { id: 'melitta',  name: 'Melitta',        emoji: '⬡', category: 'filtered',  description: 'Coador com fundo plano' },
  { id: 'chemex',   name: 'Chemex',         emoji: '⬗', category: 'filtered',  description: 'Coador de design clássico' },
  { id: 'kalita',   name: 'Kalita Wave',    emoji: '〰', category: 'filtered',  description: 'Coador com fundo ondulado' },
  { id: 'colador',  name: 'Colador de Pano',emoji: '🧵', category: 'filtered',  description: 'Coador de pano tradicional' },
  { id: 'prensa',   name: 'Prensa Francesa',emoji: '⬛', category: 'immersion', description: 'Imersão total com êmbolo' },
  { id: 'clever',   name: 'Clever Dripper', emoji: '◈', category: 'immersion', description: 'Imersão com coagem controlada' },
  { id: 'cold_brew',name: 'Cold Brew',      emoji: '❄', category: 'checklist', description: 'Extração a frio 18h+', isChecklist: true },
  { id: 'espresso', name: 'Espresso',       emoji: '⚡', category: 'pressure',  description: 'Pressão de 9 bar' },
  { id: 'moka',     name: 'Moka',           emoji: '◉', category: 'checklist', description: 'Pressão de vapor no fogão', isChecklist: true },
  { id: 'aeropress',name: 'AeroPress',      emoji: '○', category: 'immersion', description: 'Imersão com pressão manual' },
]
