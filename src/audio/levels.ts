import type { LevelDef } from '../types';

const LEVELS: LevelDef[] = [
  // ═══════════════════════════════════════════
  // Stage 1: 高低感知 — 学会区分高低
  // 2 个音，跨度从极大逐渐缩小
  // ═══════════════════════════════════════════
  {
    id: '1-1', stage: 1, level: 1, name: '高低感知',
    config: { uniquePitchCount: 2, sequenceLength: 2, instrument: 'piano', minSemitoneGap: 12 },
  },
  {
    id: '1-2', stage: 1, level: 2, name: '高低感知',
    config: { uniquePitchCount: 2, sequenceLength: 3, instrument: 'piano', minSemitoneGap: 10 },
  },
  {
    id: '1-3', stage: 1, level: 3, name: '高低感知',
    config: { uniquePitchCount: 2, sequenceLength: 3, instrument: 'piano', minSemitoneGap: 7 },
  },
  {
    id: '1-4', stage: 1, level: 4, name: '高低感知',
    config: { uniquePitchCount: 2, sequenceLength: 4, instrument: 'piano', minSemitoneGap: 5 },
  },
  {
    id: '1-5', stage: 1, level: 5, name: '高低感知',
    config: { uniquePitchCount: 2, sequenceLength: 5, instrument: 'piano', minSemitoneGap: 5 },
  },

  // ═══════════════════════════════════════════
  // Stage 2: 唱名识别 — 学会辨认 do re mi
  // 3 个音起步，中等跨度，逐渐引入新音色
  // ═══════════════════════════════════════════
  {
    id: '2-1', stage: 2, level: 1, name: '唱名识别',
    config: { uniquePitchCount: 3, sequenceLength: 3, instrument: 'piano', minSemitoneGap: 5 },
  },
  {
    id: '2-2', stage: 2, level: 2, name: '唱名识别',
    config: { uniquePitchCount: 3, sequenceLength: 4, instrument: 'piano', minSemitoneGap: 4 },
  },
  {
    id: '2-3', stage: 2, level: 3, name: '唱名识别',
    config: { uniquePitchCount: 3, sequenceLength: 4, instrument: 'guitar', minSemitoneGap: 3 },
  },
  {
    id: '2-4', stage: 2, level: 4, name: '唱名识别',
    config: { uniquePitchCount: 3, sequenceLength: 5, instrument: 'guitar', minSemitoneGap: 3 },
  },
  {
    id: '2-5', stage: 2, level: 5, name: '唱名识别',
    config: { uniquePitchCount: 4, sequenceLength: 5, instrument: 'piano', minSemitoneGap: 3 },
  },

  // ═══════════════════════════════════════════
  // Stage 3: 八度跨越 — 同音不同八度
  // 同一唱名在不同八度下的辨识
  // ═══════════════════════════════════════════
  {
    id: '3-1', stage: 3, level: 1, name: '八度跨越',
    config: { uniquePitchCount: 2, sequenceLength: 2, instrument: 'piano', octaveMode: true },
  },
  {
    id: '3-2', stage: 3, level: 2, name: '八度跨越',
    config: { uniquePitchCount: 2, sequenceLength: 3, instrument: 'piano', octaveMode: true },
  },
  {
    id: '3-3', stage: 3, level: 3, name: '八度跨越',
    config: { uniquePitchCount: 2, sequenceLength: 4, instrument: 'violin', octaveMode: true },
  },
  {
    id: '3-4', stage: 3, level: 4, name: '八度跨越',
    config: { uniquePitchCount: 3, sequenceLength: 3, instrument: 'violin', octaveMode: true },
  },
  {
    id: '3-5', stage: 3, level: 5, name: '八度跨越',
    config: { uniquePitchCount: 3, sequenceLength: 5, instrument: 'violin', octaveMode: true },
  },

  // ═══════════════════════════════════════════
  // Stage 4: 半音辨别 — 精细音感训练
  // 辨别音高非常接近的音，核心难度
  // ═══════════════════════════════════════════
  {
    id: '4-1', stage: 4, level: 1, name: '半音辨别',
    config: { uniquePitchCount: 2, sequenceLength: 2, instrument: 'piano', minSemitoneGap: 3 },
  },
  {
    id: '4-2', stage: 4, level: 2, name: '半音辨别',
    config: { uniquePitchCount: 2, sequenceLength: 3, instrument: 'piano', minSemitoneGap: 2 },
  },
  {
    id: '4-3', stage: 4, level: 3, name: '半音辨别',
    config: { uniquePitchCount: 2, sequenceLength: 4, instrument: 'piano', minSemitoneGap: 2 },
  },
  {
    id: '4-4', stage: 4, level: 4, name: '半音辨别',
    config: { uniquePitchCount: 3, sequenceLength: 3, instrument: 'violin', minSemitoneGap: 1 },
  },
  {
    id: '4-5', stage: 4, level: 5, name: '半音辨别',
    config: { uniquePitchCount: 3, sequenceLength: 5, instrument: 'violin', minSemitoneGap: 1 },
  },

  // ═══════════════════════════════════════════
  // Stage 5: 综合试炼 — 接近真实音乐
  // 前面所有能力的综合运用
  // ═══════════════════════════════════════════
  {
    id: '5-1', stage: 5, level: 1, name: '综合试炼',
    config: { uniquePitchCount: 4, sequenceLength: 4, instrument: 'piano', minSemitoneGap: 3 },
  },
  {
    id: '5-2', stage: 5, level: 2, name: '综合试炼',
    config: { uniquePitchCount: 4, sequenceLength: 5, instrument: 'flute', minSemitoneGap: 2 },
  },
  {
    id: '5-3', stage: 5, level: 3, name: '综合试炼',
    config: { uniquePitchCount: 5, sequenceLength: 6, instrument: 'flute', minSemitoneGap: 2 },
  },
  {
    id: '5-4', stage: 5, level: 4, name: '综合试炼',
    config: { uniquePitchCount: 5, sequenceLength: 7, instrument: 'organ', minSemitoneGap: 2 },
  },
  {
    id: '5-5', stage: 5, level: 5, name: '综合试炼',
    config: { uniquePitchCount: 6, sequenceLength: 8, instrument: 'organ', minSemitoneGap: 1 },
  },
];

const STAGE_NAMES: Record<number, string> = {
  1: '一 · 高低感知',
  2: '二 · 唱名识别',
  3: '三 · 八度跨越',
  4: '四 · 半音辨别',
  5: '五 · 综合试炼',
};

const STAGE_DESCRIPTIONS: Record<number, string> = {
  1: '判断音的高低 — 从极宽音距开始，逐步缩小',
  2: '说出音的名字 — do re mi fa sol la si',
  3: '同一唱名，不同八度 — do₃ vs do₄',
  4: '分辨非常接近的音 — 耳朵的精细训练',
  5: '全部能力的综合运用 — 接近真实音乐',
};

export function getAllLevels(): LevelDef[] {
  return LEVELS;
}

export function getLevelById(id: string): LevelDef | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function getLevelsByStage(stage: number): LevelDef[] {
  return LEVELS.filter((l) => l.stage === stage);
}

export function getStageName(stage: number): string {
  return STAGE_NAMES[stage] || `第 ${stage} 阶段`;
}

export function getStageDescription(stage: number): string {
  return STAGE_DESCRIPTIONS[stage] || '';
}

export function getStageCount(): number {
  return 5;
}

export function getNextLevelId(currentId: string): string | null {
  const idx = LEVELS.findIndex((l) => l.id === currentId);
  if (idx === -1 || idx >= LEVELS.length - 1) return null;
  return LEVELS[idx + 1].id;
}
