import type { Note, NoteName } from '../types';
import { getMidi, getFrequency } from './notes';

const SOLFEGE: Record<NoteName, string> = {
  'C': 'do', 'C#': 'do#', 'D': 're', 'D#': 're#',
  'E': 'mi', 'F': 'fa', 'F#': 'fa#', 'G': 'sol',
  'G#': 'sol#', 'A': 'la', 'A#': 'la#', 'B': 'si',
};

export interface SongNote {
  midi: number;
  duration: number; // beat fraction: 1=quarter, 0.5=eighth, 2=half
}

export interface SongDef {
  id: string;
  name: string;
  category: SongCategory;
  bpm: number;
  notes: SongNote[];
}

function n(name: NoteName, octave: number, duration: number = 1): SongNote {
  return { midi: getMidi(name, octave), duration };
}

function r(duration: number = 1): SongNote {
  return { midi: -1, duration }; // rest
}

export type SongCategory = 'beginner' | 'folk' | 'pop' | 'occasion';

export const CATEGORIES: { id: SongCategory; label: string; }[] = [
  { id: 'beginner', label: '入门练习' },
  { id: 'folk', label: '经典民歌' },
  { id: 'pop', label: '流行热门' },
  { id: 'occasion', label: '特定场合' },
];

export const SONGS: SongDef[] = [
  {
    id: 'twinkle',
    category: 'beginner',
    name: '小星星',
    bpm: 100,
    notes: [
      n('C', 4), n('C', 4), n('G', 4), n('G', 4),
      n('A', 4), n('A', 4), n('G', 4, 2),
      n('F', 4), n('F', 4), n('E', 4), n('E', 4),
      n('D', 4), n('D', 4), n('C', 4, 2),
      n('G', 4), n('G', 4), n('F', 4), n('F', 4),
      n('E', 4), n('E', 4), n('D', 4, 2),
      n('G', 4), n('G', 4), n('F', 4), n('F', 4),
      n('E', 4), n('E', 4), n('D', 4, 2),
      n('C', 4), n('C', 4), n('G', 4), n('G', 4),
      n('A', 4), n('A', 4), n('G', 4, 2),
      n('F', 4), n('F', 4), n('E', 4), n('E', 4),
      n('D', 4), n('D', 4), n('C', 4, 2),
    ],
  },
  {
    id: 'twotigers',
    category: 'beginner',
    name: '两只老虎',
    bpm: 120,
    notes: [
      n('C', 4), n('D', 4), n('E', 4), n('C', 4),
      n('C', 4), n('D', 4), n('E', 4), n('C', 4),
      n('E', 4), n('F', 4), n('G', 4, 2),
      n('E', 4), n('F', 4), n('G', 4, 2),
      n('G', 4, 0.5), n('A', 4, 0.5), n('G', 4, 0.5), n('F', 4, 0.5),
      n('E', 4), n('C', 4),
      n('G', 4, 0.5), n('A', 4, 0.5), n('G', 4, 0.5), n('F', 4, 0.5),
      n('E', 4), n('C', 4),
      n('C', 4), n('G', 3), n('C', 4, 2),
      n('C', 4), n('G', 3), n('C', 4, 2),
    ],
  },
  {
    id: 'happybirthday',
    category: 'occasion',
    name: '生日快乐',
    bpm: 110,
    notes: [
      n('G', 4, 0.5), n('G', 4, 0.5),
      n('A', 4), n('G', 4), n('C', 5), n('B', 4, 2),
      n('G', 4, 0.5), n('G', 4, 0.5),
      n('A', 4), n('G', 4), n('D', 5), n('C', 5, 2),
      n('G', 4, 0.5), n('G', 4, 0.5),
      n('G', 5), n('E', 5), n('C', 5), n('B', 4), n('A', 4),
      n('F', 5), n('F', 5), n('E', 5), n('C', 5), n('D', 5), n('C', 5, 2),
    ],
  },
  {
    id: 'canghai',
    category: 'folk',
    name: '沧海一声笑',
    bpm: 90,
    notes: [
      n('G', 4, 0.5), n('A', 4, 0.5), n('C', 5, 1.5),
      n('D', 5, 0.5), n('E', 5, 0.5), n('G', 5, 1.5),
      n('E', 5, 0.5), n('D', 5, 0.5), n('C', 5, 1.5),
      n('A', 4, 0.5), n('C', 5, 0.5), n('A', 4, 1.5),
      n('G', 4, 0.5), n('A', 4, 0.5), n('C', 5, 1.5),
      n('D', 5, 0.5), n('E', 5, 0.5), n('G', 5, 1.5),
      n('E', 5, 0.5), n('D', 5, 0.5), n('C', 5, 1.5),
      n('A', 4, 0.5), n('C', 5, 0.5), n('A', 4, 1.5),
      n('C', 5, 0.5), n('D', 5, 0.5), n('E', 5, 1.5),
      n('D', 5, 0.5), n('C', 5, 0.5), n('A', 4, 1.5),
      n('C', 5, 0.5), n('A', 4, 0.5), n('G', 4, 1.5),
      n('G', 4, 2),
    ],
  },
  {
    id: 'jasmine',
    category: 'folk',
    name: '茉莉花',
    bpm: 80,
    notes: [
      n('E', 4, 0.5), n('E', 4, 0.5), n('G', 4), n('A', 4),
      n('C', 5, 2),
      n('A', 4), n('G', 4), n('E', 4, 2),
      n('G', 4), n('A', 4), n('G', 4, 0.5), n('E', 4, 0.5),
      n('D', 4), n('E', 4), n('D', 4, 0.5), n('C', 4, 0.5),
      n('D', 4, 2),
      n('E', 4, 0.5), n('E', 4, 0.5), n('G', 4), n('A', 4),
      n('C', 5, 2),
      n('A', 4), n('G', 4), n('E', 4, 2),
      n('D', 4, 0.5), n('C', 5, 0.5), n('A', 4), n('G', 4),
      n('E', 4), n('D', 4), n('C', 4, 2),
    ],
  },
  {
    id: 'ode',
    category: 'beginner',
    name: '欢乐颂',
    bpm: 120,
    notes: [
      n('E', 4), n('E', 4), n('F', 4), n('G', 4),
      n('G', 4), n('F', 4), n('E', 4), n('D', 4),
      n('C', 4), n('C', 4), n('D', 4), n('E', 4),
      n('E', 4, 1.5), n('D', 4, 0.5), n('D', 4, 2),
      n('E', 4), n('E', 4), n('F', 4), n('G', 4),
      n('G', 4), n('F', 4), n('E', 4), n('D', 4),
      n('C', 4), n('C', 4), n('D', 4), n('E', 4),
      n('D', 4, 1.5), n('C', 4, 0.5), n('C', 4, 2),
    ],
  },

  {
    id: 'moon',
    category: 'folk',
    name: '月亮代表我的心',
    bpm: 72,
    notes: [
      n('C', 5, 0.5), n('D', 5, 0.5), n('E', 5, 0.5), n('G', 5, 0.5),
      n('E', 5), n('D', 5), n('C', 5, 1.5),
      n('A', 4, 0.5), n('A', 4, 0.5), n('G', 4, 1),
      n('A', 4, 0.5), n('G', 4, 0.5), n('C', 4), n('D', 4),
      n('E', 4), n('D', 4, 0.5), n('C', 4, 0.5),
      n('G', 4, 1.5), n('A', 4, 0.5),
      n('A', 4), n('B', 4, 0.5), n('C', 5, 0.5),
      n('D', 5), n('C', 5, 0.5), n('B', 4, 0.5),
      n('A', 4, 1.5), n('G', 4, 0.5),
      n('C', 5, 0.5), n('D', 5, 0.5), n('E', 5, 0.5), n('G', 5, 0.5),
      n('E', 5), n('D', 5), n('C', 5, 1.5),
      n('A', 4, 0.5), n('A', 4, 0.5), n('G', 4, 1),
      n('A', 4, 0.5), n('G', 4, 0.5), n('C', 4), n('D', 4),
      n('E', 4, 1), r(0.5), n('G', 4, 0.5),
      n('C', 4, 2),
    ],
  },
  {
    id: 'qingtian',
    category: 'pop',
    name: '晴天',
    bpm: 112,
    notes: [
      n('G', 4, 0.5), n('A', 4, 0.5),
      n('C', 5), n('C', 5), n('C', 5, 0.5), n('B', 4, 0.5),
      n('A', 4), n('G', 4), n('E', 4),
      n('G', 4, 0.5), n('A', 4, 0.5),
      n('C', 5), n('D', 5), n('C', 5, 0.5), n('B', 4, 0.5),
      n('A', 4), n('G', 4), n('C', 4, 0.5), n('D', 4, 0.5),
      n('E', 4, 2),
      n('G', 4, 0.5), n('A', 4, 0.5),
      n('C', 5), n('C', 5), n('C', 5, 0.5), n('B', 4, 0.5),
      n('A', 4), n('G', 4), n('E', 4),
      n('G', 4, 0.5), n('A', 4, 0.5),
      n('C', 5), n('D', 5), n('C', 5, 0.5), n('B', 4, 0.5),
      n('A', 4), n('G', 4), n('C', 4, 0.5), n('D', 4, 0.5),
      n('E', 4, 2),
    ],
  },
  {
    id: 'xiaoxingyun',
    category: 'pop',
    name: '小幸运',
    bpm: 86,
    notes: [
      n('E', 4), n('E', 4), n('E', 4), n('D', 4),
      n('C', 4, 1.5), n('E', 4, 0.5),
      n('G', 4), n('G', 4), n('G', 4), n('F', 4),
      n('E', 4, 1.5), n('G', 4, 0.5),
      n('A', 4), n('A', 4), n('A', 4), n('G', 4),
      n('F', 4), n('E', 4), n('D', 4, 0.5), n('E', 4, 0.5),
      n('F', 4, 2),
      n('E', 4), n('E', 4), n('E', 4), n('D', 4),
      n('C', 4, 1.5), n('E', 4, 0.5),
      n('G', 4), n('G', 4), n('G', 4), n('F', 4),
      n('E', 4, 1.5), n('G', 4, 0.5),
      n('A', 4), n('A', 4), n('G', 4), n('F', 4),
      n('E', 4), n('D', 4), n('C', 4, 2),
    ],
  },
  {
    id: 'tonghua',
    category: 'pop',
    name: '童话',
    bpm: 76,
    notes: [
      n('E', 4), n('E', 4), n('E', 4), n('A', 4),
      n('G', 4, 1.5), n('E', 4, 0.5),
      n('F', 4), n('E', 4), n('D', 4), n('C', 4),
      n('D', 4, 2),
      n('E', 4), n('E', 4), n('E', 4), n('A', 4),
      n('B', 4, 1.5), n('A', 4, 0.5),
      n('C', 5), n('C', 5), n('B', 4), n('G', 4),
      n('A', 4, 2),
      n('F', 4, 0.5), n('G', 4, 0.5), n('A', 4), n('B', 4),
      n('C', 5), n('B', 4, 0.5), n('A', 4, 0.5),
      n('G', 4), n('E', 4), n('F', 4),
      n('E', 4, 2),
    ],
  },
  {
    id: 'thoseyears',
    category: 'pop',
    name: '那些年',
    bpm: 92,
    notes: [
      n('E', 4, 0.5), n('E', 4, 0.5), n('E', 4),
      n('G', 4), n('A', 4), n('B', 4, 0.5), n('A', 4, 0.5),
      n('G', 4, 2),
      n('E', 4, 0.5), n('E', 4, 0.5), n('E', 4),
      n('F', 4), n('G', 4), n('A', 4, 0.5), n('G', 4, 0.5),
      n('E', 4, 2),
      n('D', 4, 0.5), n('D', 4, 0.5), n('D', 4),
      n('F', 4), n('G', 4), n('A', 4, 0.5), n('G', 4, 0.5),
      n('E', 4, 2),
      n('D', 4, 0.5), n('D', 4, 0.5), n('D', 4),
      n('C', 4), n('D', 4), n('E', 4, 0.5), n('D', 4, 0.5),
      n('C', 4, 2),
    ],
  },
  {
    id: 'shinian',
    category: 'pop',
    name: '十年',
    bpm: 92,
    notes: [
      n('G', 4), n('A', 4), n('C', 5), n('B', 4, 0.5), n('A', 4, 0.5),
      n('G', 4), n('E', 4), n('D', 4, 2),
      n('G', 4), n('A', 4), n('C', 5), n('B', 4, 0.5), n('A', 4, 0.5),
      n('G', 4), n('E', 4), n('C', 4, 2),
      n('F', 4, 0.5), n('G', 4, 0.5), n('A', 4), n('B', 4, 0.5), n('A', 4, 0.5),
      n('G', 4), n('F', 4), n('E', 4), n('D', 4), n('E', 4),
      n('F', 4, 1.5), r(0.5),
      n('E', 4), n('F', 4), n('G', 4), n('G', 4, 0.5), n('A', 4, 0.5),
      n('B', 4), n('A', 4), n('G', 4, 2),
    ],
  },
  {
    id: 'xiaobaicai',
    category: 'beginner',
    name: '小白菜',
    bpm: 66,
    notes: [
      n('D', 5, 1.5), n('C', 5, 0.5),
      n('A', 4, 1.5), n('G', 4, 0.5),
      n('E', 4, 2),
      n('D', 4, 1.5), n('E', 4, 0.5),
      n('G', 4, 1.5), n('A', 4, 0.5),
      n('G', 4, 2),
    ],
  },
  {
    id: 'liangliang',
    category: 'pop',
    name: '凉凉',
    bpm: 76,
    notes: [
      n('E', 5, 0.5), n('E', 5, 0.5),
      n('G', 5), n('D', 5), n('C', 5, 0.5), n('B', 4, 0.5),
      n('A', 4), n('C', 5), n('B', 4, 2),
      n('A', 4, 0.5), n('G', 4, 0.5),
      n('E', 4), n('C', 4), n('D', 4, 0.5), n('E', 4, 0.5),
      n('G', 4), n('A', 4), n('G', 4, 2),
      n('E', 5, 0.5), n('E', 5, 0.5),
      n('G', 5), n('D', 5), n('C', 5, 0.5), n('B', 4, 0.5),
      n('A', 4), n('C', 5), n('B', 4, 2),
      n('A', 4, 0.5), n('G', 4, 0.5),
      n('E', 4), n('C', 4), n('D', 4, 0.5), n('E', 4, 0.5),
      n('F', 4), n('E', 4), n('D', 4, 2),
    ],
  },
  {
    id: 'beiying',
    category: 'pop',
    name: '背影',
    bpm: 72,
    notes: [
      n('D', 4), n('E', 4), n('F', 4), n('F', 4),
      n('G', 4), n('E', 4), n('D', 4, 2),
      n('D', 4), n('E', 4), n('F', 4), n('G', 4),
      n('A', 4), n('G', 4, 2),
      n('C', 5), n('B', 4), n('A', 4), n('G', 4),
      n('F', 4), n('E', 4), n('D', 4, 2),
      n('G', 4), n('A', 4), n('B', 4), n('C', 5),
      n('D', 5), n('C', 5, 2),
      n('F', 4), n('G', 4), n('A', 4), n('G', 4),
      n('F', 4), n('E', 4), n('D', 4, 2),
    ],
  },
  {
    id: 'kongcheng',
    category: 'pop',
    name: '空城',
    bpm: 90,
    notes: [
      n('C', 5, 0.5), n('D', 5, 0.5),
      n('E', 5), n('G', 5), n('E', 5), n('D', 5),
      n('C', 5, 2),
      n('A', 4, 0.5), n('B', 4, 0.5),
      n('C', 5), n('E', 5), n('C', 5), n('B', 4),
      n('A', 4, 2),
      n('F', 4, 0.5), n('G', 4, 0.5),
      n('A', 4), n('C', 5), n('A', 4), n('G', 4),
      n('F', 4, 2),
      n('C', 4, 0.5), n('D', 4, 0.5),
      n('E', 4), n('G', 4), n('E', 4), n('D', 4),
      n('C', 4, 2),
    ],
  },
];

export function midiToNote(midi: number): Note | null {
  if (midi < 0) return null;
  const NOTE_NAMES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[midi % 12];
  return {
    name,
    octave,
    midi,
    frequency: getFrequency(name, octave),
    solfege: SOLFEGE[name],
  };
}
