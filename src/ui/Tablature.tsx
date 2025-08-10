import React from 'react'
import { Voicing } from '../engine/VoicingFinder'

interface TablatureProps {
  voicing: Voicing
  tuning?: string[]
}

const defaultTuning = ['E', 'A', 'D', 'G', 'B', 'E']

export function Tablature({ voicing, tuning = defaultTuning }: TablatureProps) {
  const lines = tuning
    .slice()
    .reverse()
    .map((t, idx) => {
      const f = voicing.frets[5 - idx]
      const symbol = f < 0 ? 'x' : f.toString()
      return `${t.toLowerCase()}|-${symbol}-`
    })
  return (
    <pre data-testid="tablature" data-frets={voicing.frets.join(',')}>
      {lines.join('\n')}
    </pre>
  )
}

export default Tablature

