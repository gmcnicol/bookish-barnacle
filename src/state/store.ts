import create from 'zustand'
import { Voicing } from '../engine/VoicingFinder'

interface AppState {
  key: string
  mode: string
  tuning: string[]
  progression: string
  voicings: Voicing[]
  selectedVoicingIdx: number
  setProgression: (p: string) => void
  setVoicings: (v: Voicing[]) => void
  nextVoicing: () => void
  prevVoicing: () => void
}

export const useStore = create<AppState>((set, get) => ({
  key: 'C',
  mode: 'major',
  tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  progression: '',
  voicings: [],
  selectedVoicingIdx: 0,
  setProgression: (p) => set({ progression: p }),
  setVoicings: (v) => set({ voicings: v, selectedVoicingIdx: 0 }),
  nextVoicing: () =>
    set(({ selectedVoicingIdx, voicings }) => ({
      selectedVoicingIdx: voicings.length
        ? (selectedVoicingIdx + 1) % voicings.length
        : 0,
    })),
  prevVoicing: () =>
    set(({ selectedVoicingIdx, voicings }) => ({
      selectedVoicingIdx: voicings.length
        ? (selectedVoicingIdx - 1 + voicings.length) % voicings.length
        : 0,
    })),
}))

