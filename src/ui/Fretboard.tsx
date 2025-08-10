import React from 'react'
import { Voicing } from '../engine/VoicingFinder'

interface FretboardProps {
  voicing: Voicing
}

const fretCount = 5
const width = 120
const height = 60
const fretSpacing = (width - 20) / fretCount
const stringSpacing = height / 6

export function Fretboard({ voicing }: FretboardProps) {
  return (
    <svg
      width={width}
      height={height}
      data-testid="fretboard"
      data-frets={voicing.frets.join(',')}
      className="text-muted"
    >
      {/* strings */}
      {voicing.frets.map((_, i) => (
        <line
          key={i}
          x1={10}
          x2={width - 10}
          y1={(i + 0.5) * stringSpacing}
          y2={(i + 0.5) * stringSpacing}
          stroke="currentColor"
        />
      ))}
      {/* frets */}
      {[...Array(fretCount + 1)].map((_, f) => (
        <line
          key={f}
          x1={10 + f * fretSpacing}
          x2={10 + f * fretSpacing}
          y1={0}
          y2={height}
          stroke="currentColor"
        />
      ))}
      {/* markers */}
      {voicing.frets.map((f, i) =>
        f >= 0 ? (
          <circle
            key={i}
            cx={10 + f * fretSpacing + fretSpacing / 2}
            cy={(i + 0.5) * stringSpacing}
            r={4}
            fill="currentColor"
            className="text-foreground"
          />
        ) : (
          <text
            key={i}
            x={2}
            y={(i + 0.5) * stringSpacing + 4}
            fontSize="8"
            fill="currentColor"
            className="text-red-400"
          >
            x
          </text>
        ),
      )}
    </svg>
  )
}

export default Fretboard

