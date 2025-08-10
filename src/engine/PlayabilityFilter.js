export function filterPlayable(voicings) {
  return voicings.filter((v) => {
    const playedFrets = v.frets.filter((f) => f >= 0);
    if (playedFrets.length === 0) return false;
    const span = Math.max(...playedFrets) - Math.min(...playedFrets);
    const skips = v.frets.filter((f) => f === -1).length;
    const uniqueTones = new Set(v.notes.filter((n) => n)).size;
    return span <= 4 && skips <= 1 && uniqueTones >= 3;
  });
}
