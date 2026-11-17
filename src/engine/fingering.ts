export type Barre = { fret: number; fromString: number; toString: number; finger: number };
export type Fingering = { fingers: number[]; barres: Barre[]; fingerCount: number };

// Conservative four-finger estimate. A barre may cross higher fretted notes,
// but never an open or muted string. Thumb-over and unusual stretches are excluded.
export function estimateFingering(frets: number[]): Fingering | null {
  type Action = { fret: number; from: number; to: number; mask: number };
  const actions: Action[] = [];
  let needed = 0;
  frets.forEach((fret, i) => {
    if (fret <= 0) return;
    needed |= 1 << i;
    actions.push({ fret, from: i, to: i, mask: 1 << i });
    for (let j = i + 1; j < frets.length; j++) {
      if (frets[j] < fret) break;
      if (frets[j] !== fret) continue;
      let mask = 0;
      for (let k = i; k <= j; k++) if (frets[k] === fret) mask |= 1 << k;
      actions.push({ fret, from: i, to: j, mask });
    }
  });
  let best: Action[] | null = null;
  let bestCost = Infinity;
  function search(covered: number, chosen: Action[]) {
    if ((covered & needed) === needed) {
      const cost = chosen.length + chosen.reduce((n, a) => n + (a.to - a.from) * 0.025, 0);
      if (cost < bestCost) { best = [...chosen]; bestCost = cost; }
      return;
    }
    if (chosen.length >= 4 || chosen.length >= bestCost) return;
    const first = frets.findIndex((f, i) => f > 0 && !(covered & (1 << i)));
    for (const action of actions) {
      if (action.mask & (1 << first)) search(covered | action.mask, [...chosen, action]);
    }
  }
  search(0, []);
  if (best === null) return null;
  const selected: Action[] = best;
  selected.sort((a, b) => a.fret - b.fret || a.from - b.from);
  const fingers = frets.map(f => f <= 0 ? f : 0);
  const barres: Barre[] = [];
  selected.forEach((action, i) => {
    for (let s = action.from; s <= action.to; s++) if (frets[s] === action.fret) fingers[s] = i + 1;
    if (action.to > action.from) barres.push({ fret: action.fret, fromString: action.from, toString: action.to, finger: i + 1 });
  });
  return { fingers, barres, fingerCount: selected.length };
}
