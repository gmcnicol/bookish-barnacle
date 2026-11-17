import { parseProgression, resolveChord } from './roman';
import type { ResolvedChord } from './roman';
import { E_STANDARD } from './tuning';
import { findVoicings } from './voicingFinder';
import type { Voicing, VoicingOptions } from './voicingFinder';
import type { Mode } from './theory';

export type EngineConfig = {
  key: string; mode: Mode; tuning?: number[]; progression: string;
  options?: Partial<VoicingOptions>;
};
export type ChordOut = ResolvedChord & { voicings: Voicing[] };
export function computeVoicings(cfg: EngineConfig): ChordOut[] {
  const tokens = parseProgression(cfg.progression);
  if (tokens.length > 24) throw new Error('Use up to 24 chords per progression.');
  // Resolve every token first, so an invalid final token does not trigger
  // expensive searches or partially replace the previous progression.
  const chords = tokens.map(token => resolveChord(token, cfg.key));
  return chords.map(chord => ({
    ...chord,
    voicings: findVoicings(chord.tones, cfg.tuning ?? E_STANDARD, 256, {
      ...cfg.options, bass: chord.bass,
    }),
  }));
}
export type { Voicing } from './voicingFinder';
