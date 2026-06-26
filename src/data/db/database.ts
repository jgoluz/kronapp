import Dexie, { type Table } from 'dexie'

export interface SavedRecipe {
  id?: number
  method_id: string
  profile_id: string
  profile_name: string
  method_name: string
  ratio: number
  water_ml: number
  coffee_g: number
  temp: number | null
  grind: string
  note: string
  created_at: number
  is_custom_ratio: boolean
  adjustments?: RecipeAdjustment[]
}

export interface RecipeAdjustment {
  at: number
  ratio: number
  note: string
}

class KronDatabase extends Dexie {
  recipes!: Table<SavedRecipe, number>

  constructor() {
    super('KronDB')
    this.version(1).stores({
      recipes: '++id, method_id, created_at',
    })
  }
}

export const db = new KronDatabase()

export async function initDB(): Promise<void> {
  await db.open()
}
