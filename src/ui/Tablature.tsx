import React from 'react';

// frets length 6 (low→high). Display top→bottom as high→low
export default function Tablature({ frets }: { frets: number[] }) {
  const names = ['e', 'B', 'G', 'D', 'A', 'E'];
  const lines = [...frets].reverse().map((f, i) => {
    const mark = f < 0 ? 'x' : String(f);
    return names[i] + '|' + mark.padEnd(3, '-') + '-----|';
  });

  return (
    <pre className="text-xs md:text-sm leading-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3 overflow-auto">
{lines.join('\n')}
    </pre>
  );
}
