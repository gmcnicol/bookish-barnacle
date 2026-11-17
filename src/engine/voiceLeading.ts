import type { Voicing } from './voicingFinder';

export function movementCost(from: Voicing, to: Voicing): number {
  let movement = Math.abs(from.position - to.position) * 1.5;
  for (let s = 0; s < 6; s++) {
    const a = from.frets[s], b = to.frets[s];
    if (a < 0 && b < 0) continue;
    movement += a < 0 || b < 0 ? 3 : Math.abs(a - b);
  }
  const common = from.pitches.filter(p => to.pitches.includes(p)).length;
  return movement + Math.abs(from.bass - to.bass) * 0.3 - common * 0.8;
}
export function nearestVoicing(from: Voicing | undefined, candidates: Voicing[]): number {
  if (!candidates.length) return -1;
  if (!from) return 0;
  let best = 0, cost = Infinity;
  candidates.forEach((to, i) => {
    const next = movementCost(from, to) + to.score * 0.15;
    if (next < cost) { best = i; cost = next; }
  });
  return best;
}

// Dynamic programming minimises the total cost across the complete sequence,
// rather than greedily choosing each next chord. Candidate lists are already
// limited to the best playable shapes by the engine.
export function smoothestSequence(chords: { voicings: Voicing[] }[]): number[] {
  if (!chords.length || chords.some(c => !c.voicings.length)) return [];
  let costs = chords[0].voicings.map(v => v.score * 0.15);
  const parents: number[][] = [costs.map(() => -1)];
  for (let c = 1; c < chords.length; c++) {
    const links: number[] = [];
    const nextCosts = chords[c].voicings.map(to => {
      let best = Infinity, parent = 0;
      chords[c - 1].voicings.forEach((from, i) => {
        const cost = costs[i] + movementCost(from, to) + to.score * 0.15;
        if (cost < best) { best = cost; parent = i; }
      });
      links.push(parent);
      return best;
    });
    parents.push(links);
    costs = nextCosts;
  }
  let selected = costs.indexOf(Math.min(...costs));
  const result = Array<number>(chords.length);
  for (let c = chords.length - 1; c >= 0; c--) {
    result[c] = selected;
    selected = parents[c][selected];
  }
  return result;
}
