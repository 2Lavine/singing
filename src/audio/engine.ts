import type { InstrumentType, Note } from '../types';

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  return ctx;
}

export function ensureAudioContext(): AudioContext {
  return getCtx();
}

interface OscConfig {
  type: OscillatorType;
  frequency: number;
  detune?: number;
  gain: number;
}

function createOscillators(
  ctx: AudioContext,
  configs: OscConfig[],
  startTime: number,
  endTime: number,
  destination: AudioNode
): OscillatorNode[] {
  return configs.map((cfg) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = cfg.type;
    osc.frequency.setValueAtTime(cfg.frequency, startTime);
    if (cfg.detune) {
      osc.detune.setValueAtTime(cfg.detune, startTime);
    }
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(cfg.gain, startTime + 0.005);
    gain.gain.setValueAtTime(cfg.gain, endTime - 0.01);
    gain.gain.linearRampToValueAtTime(0, endTime);
    osc.connect(gain);
    gain.connect(destination);
    osc.start(startTime);
    osc.stop(endTime);
    return osc;
  });
}

function pianoNote(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, startTime);
  masterGain.gain.linearRampToValueAtTime(0.5, startTime + 0.003);
  masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  masterGain.connect(ctx.destination);

  const configs: OscConfig[] = [
    { type: 'sine', frequency: freq, gain: 1.0 },
    { type: 'sine', frequency: freq * 2, gain: 0.4 },
    { type: 'sine', frequency: freq * 3, gain: 0.2 },
    { type: 'sine', frequency: freq * 4, gain: 0.08 },
    { type: 'sine', frequency: freq * 5, gain: 0.04 },
  ];

  createOscillators(ctx, configs, startTime, startTime + duration, masterGain);
}

function guitarNote(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, startTime);
  masterGain.gain.linearRampToValueAtTime(0.4, startTime + 0.001);
  masterGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.7);
  masterGain.connect(ctx.destination);

  const configs: OscConfig[] = [
    { type: 'triangle', frequency: freq, gain: 1.0 },
    { type: 'sine', frequency: freq * 2, gain: 0.3 },
    { type: 'sine', frequency: freq * 3, gain: 0.1 },
  ];

  createOscillators(ctx, configs, startTime, startTime + duration, masterGain);
}

function violinNote(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, startTime);
  masterGain.gain.linearRampToValueAtTime(0.35, startTime + 0.12);
  masterGain.gain.setValueAtTime(0.35, startTime + duration - 0.05);
  masterGain.gain.linearRampToValueAtTime(0, startTime + duration);
  masterGain.connect(ctx.destination);

  const configs: OscConfig[] = [
    { type: 'sawtooth', frequency: freq, gain: 1.0 },
    { type: 'sine', frequency: freq * 2, gain: 0.25 },
    { type: 'sine', frequency: freq * 3, gain: 0.12 },
  ];

  const oscs = createOscillators(ctx, configs, startTime, startTime + duration, masterGain);

  // Vibrato via frequency modulation
  const vibratoDepth = 3;
  const vibratoRate = 5.5;
  oscs.forEach((osc) => {
    osc.frequency.setValueAtTime(osc.frequency.value, startTime);
    for (let t = startTime + 0.15; t < startTime + duration; t += 0.01) {
      const mod = Math.sin(2 * Math.PI * vibratoRate * (t - startTime)) * vibratoDepth;
      osc.frequency.setValueAtTime(freq * (1 + mod / 1200), t);
    }
  });
}

function fluteNote(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, startTime);
  masterGain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
  masterGain.gain.setValueAtTime(0.3, startTime + duration - 0.03);
  masterGain.gain.linearRampToValueAtTime(0, startTime + duration);
  masterGain.connect(ctx.destination);

  const configs: OscConfig[] = [
    { type: 'sine', frequency: freq, gain: 1.0 },
    { type: 'sine', frequency: freq * 2, gain: 0.15 },
    { type: 'sine', frequency: freq * 3, gain: 0.05 },
  ];

  const oscs = createOscillators(ctx, configs, startTime, startTime + duration, masterGain);

  // Light vibrato
  oscs.forEach((osc) => {
    for (let t = startTime + 0.1; t < startTime + duration; t += 0.01) {
      const mod = Math.sin(2 * Math.PI * 4 * (t - startTime)) * 1.5;
      osc.frequency.setValueAtTime(freq * (1 + mod / 1200), t);
    }
  });
}

function organNote(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, startTime);
  masterGain.gain.linearRampToValueAtTime(0.4, startTime + 0.01);
  masterGain.gain.setValueAtTime(0.4, startTime + duration - 0.02);
  masterGain.gain.linearRampToValueAtTime(0, startTime + duration);
  masterGain.connect(ctx.destination);

  const configs: OscConfig[] = [
    { type: 'sine', frequency: freq, gain: 1.0 },
    { type: 'sine', frequency: freq * 2, gain: 0.6 },
    { type: 'sine', frequency: freq * 3, gain: 0.3 },
    { type: 'sine', frequency: freq * 4, gain: 0.1 },
    { type: 'sine', frequency: freq * 1.5, gain: 0.2 },
  ];

  createOscillators(ctx, configs, startTime, startTime + duration, masterGain);
}

const INSTRUMENT_PLAYERS: Record<InstrumentType, (ctx: AudioContext, freq: number, startTime: number, duration: number) => void> = {
  piano: pianoNote,
  guitar: guitarNote,
  violin: violinNote,
  flute: fluteNote,
  organ: organNote,
};

export function playNote(note: Note, instrument: InstrumentType, duration: number = 1.0): number {
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  INSTRUMENT_PLAYERS[instrument](audioCtx, note.frequency, now, duration);
  return now;
}

export async function playSequence(
  notes: Note[],
  instrument: InstrumentType,
  gapMs: number = 600,
  noteDuration: number = 0.8,
  onNoteStart?: (index: number) => void
): Promise<void> {
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  const stepMs = (noteDuration + gapMs / 1000) * 1000;

  return new Promise((resolve) => {
    notes.forEach((note, i) => {
      const startTime = now + i * (noteDuration + gapMs / 1000);
      INSTRUMENT_PLAYERS[instrument](audioCtx, note.frequency, startTime, noteDuration);
      if (onNoteStart) {
        setTimeout(() => onNoteStart(i), i * stepMs);
      }
    });
    setTimeout(resolve, notes.length * stepMs);
  });
}

export function playErrorSound(): void {
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.setValueAtTime(150, now + 0.08);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
}

export function playSuccessSound(): void {
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  [523, 659, 784].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.1);
    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.3);
  });
}
