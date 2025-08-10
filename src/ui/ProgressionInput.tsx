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
      className="bg-background border border-muted text-foreground p-2 rounded-2xl"
    />
  )
}

export default ProgressionInput

