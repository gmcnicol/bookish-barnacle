import type { Voicing } from './voicingFinder';

let context: AudioContext | undefined;
let active: OscillatorNode[] = [];
export async function playVoicing(voicing: Voicing): Promise<void> {
  if (typeof window === 'undefined' || !window.AudioContext) throw new Error('Audio preview is not supported by this browser.');
  context ??= new AudioContext();
  await context.resume();
  for (const node of active) { try { node.stop(); } catch { /* already finished */ } }
  active = [];
  const start = context.currentTime + 0.02;
  voicing.pitches.forEach((pitch, i) => {
    const oscillator = context!.createOscillator();
    const gain = context!.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 440 * 2 ** ((pitch - 69) / 12);
    const at = start + i * 0.025;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.12 / Math.sqrt(voicing.pitches.length), at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);
    oscillator.connect(gain);
    gain.connect(context!.destination);
    oscillator.start(at);
    oscillator.stop(at + 1.7);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); active = active.filter(n => n !== oscillator); };
    active.push(oscillator);
  });
}
