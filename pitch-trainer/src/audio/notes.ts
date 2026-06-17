import type { Note, NoteName } from '../types';

const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const NOTE_COLORS: Record<NoteName, string> = {
  'C': '#e74c3c',
  'C#': '#e67e22',
  'D': '#f39c12',
  'D#': '#2ecc71',
  'E': '#27ae60',
  'F': '#1abc9c',
  'F#': '#3498db',
  'G': '#2980b9',
  'G#': '#9b59b6',
  'A': '#e91e63',
  'A#': '#ff6b6b',
  'B': '#ff8c42',
};

const SOLFEGE: Record<NoteName, string> = {
  'C': 'do', 'C#': 'do#', 'D': 're', 'D#': 're#',
  'E': 'mi', 'F': 'fa', 'F#': 'fa#', 'G': 'sol',
  'G#': 'sol#', 'A': 'la', 'A#': 'la#', 'B': 'si',
};

const A4 = 440;
const SEMITONE = 2 ** (1 / 12);

function noteToSemitoneOffset(name: NoteName): number {
  const offsets: Record<NoteName, number> = {
    'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4,
    'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2,
  };
  return offsets[name];
}

export function getFrequency(name: NoteName, octave: number): number {
  const semitonesFromA4 = (octave - 4) * 12 + noteToSemitoneOffset(name);
  return A4 * SEMITONE ** semitonesFromA4;
}

export function getNoteLabel(note: Note): string {
  return `${note.name}${note.octave}`;
}

export function getSolfegeLabel(note: Note): string {
  return `${note.solfege}${note.octave}`;
}

export function getNoteColor(name: NoteName): string {
  return NOTE_COLORS[name];
}

export function generateAvailableNotes(): Note[] {
  const notes: Note[] = [];
  for (let octave = 3; octave <= 5; octave++) {
    for (const name of NOTE_NAMES) {
      const frequency = getFrequency(name, octave);
      if (frequency >= 130 && frequency <= 660) {
        notes.push({ name, octave, frequency, solfege: SOLFEGE[name] });
      }
    }
  }
  return notes;
}

export function pickUniqueNotes(
  count: number,
  minSemitoneGap: number = 7,
  octaveMode: boolean = false
): Note[] {
  const available = generateAvailableNotes();

  if (octaveMode) {
    // Pick count different octaves of the same random note name
    const names: NoteName[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const baseName = names[Math.floor(Math.random() * names.length)];
    const notesByOctave = available.filter(
      (n) => n.name === baseName
    );
    const shuffled = [...notesByOctave].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).sort((a, b) => a.frequency - b.frequency);
  }

  const selected: Note[] = [];
  const used = new Set<string>();

  while (selected.length < count) {
    const idx = Math.floor(Math.random() * available.length);
    const note = available[idx];
    const key = getNoteLabel(note);

    if (used.has(key)) continue;

    const tooClose = selected.some((s) => {
      const semitones = 12 * Math.log2(note.frequency / s.frequency);
      return Math.abs(semitones) < minSemitoneGap;
    });

    if (tooClose && selected.length > 0) continue;

    selected.push(note);
    used.add(key);
  }

  return selected.sort((a, b) => a.frequency - b.frequency);
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateSequence(uniqueNotes: Note[], length: number): Note[] {
  const sequence: Note[] = [];
  for (let i = 0; i < length; i++) {
    let note = pickRandom(uniqueNotes);
    if (
      sequence.length >= 2 &&
      sequence[sequence.length - 1] === note &&
      sequence[sequence.length - 2] === note
    ) {
      const others = uniqueNotes.filter((n) => n !== note);
      note = pickRandom(others);
    }
    sequence.push(note);
  }
  return sequence;
}
