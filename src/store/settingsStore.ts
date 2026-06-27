import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '../i18n'

interface SettingsState {
  language: Language
  vibration: boolean
  sound: boolean
  setLanguage: (lang: Language) => void
  setVibration: (v: boolean) => void
  setSound: (v: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'pt',
      vibration: true,
      sound: true,
      setLanguage: (language) => set({ language }),
      setVibration: (vibration) => set({ vibration }),
      setSound: (sound) => set({ sound }),
    }),
    { name: 'kron-settings' }
  )
)
