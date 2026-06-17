export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export interface Note {
  name: NoteName;
  octave: number;
  frequency: number;
  solfege: string;
}

export type InstrumentType = 'piano' | 'guitar' | 'violin' | 'flute' | 'organ';

export interface GameConfig {
  uniquePitchCount: number;
  sequenceLength: number;
  instrument: InstrumentType;
  minSemitoneGap?: number;
  octaveMode?: boolean; // Stage 3: pick same note across different octaves
}

export interface InstrumentInfo {
  id: InstrumentType;
  label: string;
  emoji: string;
}

// ====== Level System ======

export type LevelStatus = 'locked' | 'unlocked' | 'completed';

export interface LevelDef {
  id: string; // "1-1", "2-3", etc.
  stage: number;
  level: number;
  name: string;
  config: GameConfig;
}

export interface LevelProgress {
  status: LevelStatus;
  bestStreak: number;
  stars: number; // 0-3: 1=pass, 2=pass with ≤2 total mistakes, 3=perfect (0 mistakes)
}

export const STREAK_TO_PASS = 2;
export const LEVEL_STORAGE_KEY = 'pitch-trainer-levels';

export type GameMode =
  | { type: 'free'; config: GameConfig }
  | { type: 'level'; levelId: string; levelDef: LevelDef };
