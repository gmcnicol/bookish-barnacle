import { parseProgression, degreeFromRoman, qualityForDegree, Mode } from './roman';
import { noteIndex, majorScale, naturalMinorScale, chordTriad } from './theory';
import { E_STANDARD } from './tuning';
import { findVoicings, Voicing } from './voicingFinder';

export type EngineConfig = { key: string; mode: Mode; tuning?: number[]; progression: string };
export type ChordOut = { token: string; chordRoot: number; quality: string; tones: number[]; voicings: Voicing[] };

export function computeVoicings(cfg: EngineConfig): ChordOut[] {
  const root = noteIndex(cfg.key);
  const scale = cfg.mode === 'major' ? majorScale(root) : naturalMinorScale(root);
  const tokens = parseProgression(cfg.progression);
  const tuning = cfg.tuning ?? E_STANDARD;

  const out: ChordOut[] = [];
  for (const token of tokens) {
    const deg = degreeFromRoman(token);
    const chordRoot = scale[deg - 1];
    const quality = qualityForDegree(cfg.mode, deg);
    const tones = chordTriad(chordRoot, quality as any);
    const voicings = findVoicings(tones, tuning, 8);
    out.push({ token, chordRoot, quality, tones, voicings });
  }
  return out;
}

export type { Voicing } from './voicingFinder';
