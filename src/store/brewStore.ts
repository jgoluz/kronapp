import { create } from 'zustand'
import type { MethodId } from '../data/seed/methods'
import type { BrewProfile } from '../data/seed/profiles'

export type CalcMode = 'byWater' | 'byCoffee'

interface BrewState {
  selectedMethodId: MethodId | null
  selectedProfile: BrewProfile | null
  calcMode: CalcMode
  waterMl: number
  coffeeG: number
  customRatio: number | null   // null = use profile default

  setMethod: (id: MethodId) => void
  setProfile: (p: BrewProfile) => void
  setCalcMode: (mode: CalcMode) => void
  setWater: (ml: number) => void
  setCoffee: (g: number) => void
  setCustomRatio: (r: number | null) => void
  reset: () => void
}

const DEFAULT_WATER = 300

export const useBrewStore = create<BrewState>()((set, get) => ({
  selectedMethodId: null,
  selectedProfile: null,
  calcMode: 'byWater',
  waterMl: DEFAULT_WATER,
  coffeeG: 0,
  customRatio: null,

  setMethod: (id) => set({ selectedMethodId: id, selectedProfile: null, customRatio: null }),

  setProfile: (p) => {
    const ratio = get().customRatio ?? p.ratio
    const water = get().waterMl
    set({
      selectedProfile: p,
      customRatio: null,
      coffeeG: Math.round((water / ratio) * 10) / 10,
    })
  },

  setCalcMode: (calcMode) => {
    const { selectedProfile, customRatio, waterMl, coffeeG } = get()
    const ratio = customRatio ?? selectedProfile?.ratio ?? 16
    if (calcMode === 'byWater') {
      set({ calcMode, coffeeG: Math.round((waterMl / ratio) * 10) / 10 })
    } else {
      set({ calcMode, waterMl: Math.round(coffeeG * ratio) })
    }
  },

  setWater: (ml) => {
    const { selectedProfile, customRatio } = get()
    const ratio = customRatio ?? selectedProfile?.ratio ?? 16
    set({ waterMl: ml, coffeeG: Math.round((ml / ratio) * 10) / 10 })
  },

  setCoffee: (g) => {
    const { selectedProfile, customRatio } = get()
    const ratio = customRatio ?? selectedProfile?.ratio ?? 16
    set({ coffeeG: g, waterMl: Math.round(g * ratio) })
  },

  setCustomRatio: (r) => {
    const { calcMode, waterMl, coffeeG } = get()
    if (r === null) {
      set({ customRatio: null })
      return
    }
    if (calcMode === 'byWater') {
      set({ customRatio: r, coffeeG: Math.round((waterMl / r) * 10) / 10 })
    } else {
      set({ customRatio: r, waterMl: Math.round(coffeeG * r) })
    }
  },

  reset: () => set({
    selectedMethodId: null,
    selectedProfile: null,
    calcMode: 'byWater',
    waterMl: DEFAULT_WATER,
    coffeeG: 0,
    customRatio: null,
  }),
}))
