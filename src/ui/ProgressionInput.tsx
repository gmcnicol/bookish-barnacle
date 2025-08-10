import React from 'react'
import { useStore } from '../state/store'

export function ProgressionInput() {
  const progression = useStore((s) => s.progression)
  const setProgression = useStore((s) => s.setProgression)
  return (
    <input
      aria-label="progression"
      value={progression}
      onChange={(e) => setProgression(e.target.value)}
    />
  )
}

export default ProgressionInput

