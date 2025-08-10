import React from 'react';
import { useApp } from '../state/store';

const FRETS = Array.from({length: 13}, (_,i)=> i);
const STRINGS = [0,1,2,3,4,5]; // 0=low E (bottom), 5=high e (top)

type Props = {
  frets: number[];     // length 6, -1 muted, 0 open, else fret
  rootNote?: number;   // modulo-12; highlight root
  tuning?: number[];   // for computing root highlighting
};

export default function Fretboard({ frets, rootNote, tuning }: Props) {
  const width = 1000; // SVG viewBox width (scales to container)
  const height = 220;
  const nutWidth = 10;

  const cellW = (width - nutWidth) / (FRETS.length - 1);
  const cellH = height / (STRINGS.length - 1);

  return (
    <div className="w-full">
      <svg
        className="w-full h-auto"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {FRETS.map((f, idx) => {
          const x = nutWidth + idx * cellW;
          const thick = idx === 0 ? 4 : 2;
          return <line key={`f-${f}`} x1={x} y1={0} x2={x} y2={height} stroke="#3f3f46" strokeWidth={thick} />;
        })}

        {STRINGS.map((sIdx) => {
          const y = sIdx * cellH;
          return <line key={`s-${sIdx}`} x1={0} y1={y} x2={width} y2={y} stroke="#52525b" strokeWidth={1.5} />;
        })}

        {FRETS.map((f, idx) => {
          const x = nutWidth + idx * cellW;
          return <text key={`n-${f}`} x={x + 4} y={height - 6} fontSize="12" fill="#a1a1aa">{f}</text>;
        })}

        {frets.map((fret, stringFromLow) => {
          const drawRow = (STRINGS.length - 1) - stringFromLow;
          if (fret === -1) {
            const x = nutWidth - 6;
            const y = drawRow * cellH;
            return <text key={`m-${stringFromLow}`} x={x} y={y + 4} fontSize="12" fill="#f87171">x</text>;
          }
          if (fret === 0) {
            const x = nutWidth - 8;
            const y = drawRow * cellH;
            return <text key={`o-${stringFromLow}`} x={x} y={y + 4} fontSize="12" fill="#a1a1aa">0</text>;
          }
          const cx = nutWidth + fret * cellW;
          const cy = drawRow * cellH;

          let isRoot = false;
          if (rootNote != null && tuning) {
            const note = (tuning[stringFromLow] + fret) % 12;
            isRoot = note === rootNote;
          }

          return (
            <circle
              key={`c-${stringFromLow}`}
              cx={cx}
              cy={cy}
              r={10}
              fill={isRoot ? 'rgb(52 211 153)' : 'white'}
              fillOpacity={isRoot ? 1 : 0.9}
              stroke="black"
              strokeOpacity={0.35}
            />
          );
        })}
      </svg>
    </div>
  );
}
