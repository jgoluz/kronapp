import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '../i18n'

interface SettingsState {
  language: Language
  defaultWater: number
  vibration: boolean
  sound: boolean
  setLanguage: (lang: Language) => void
  setDefaultWater: (ml: number) => void
  setVibration: (v: boolean) => void
  setSound: (v: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'pt',
      defaultWater: 300,
      vibration: true,
      sound: true,
      setLanguage: (language) => set({ language }),
      setDefaultWater: (defaultWater) => set({ defaultWater }),
      setVibration: (vibration) => set({ vibration }),
      setSound: (sound) => set({ sound }),
    }),
    { name: 'kron-settings' }
  )
)
