import { useState, useEffect } from 'react';
import type { LevelDef, LevelProgress } from '../types';
import { getAllLevels, getLevelsByStage, getStageName, getStageDescription, getStageCount } from '../audio/levels';
import { LEVEL_STORAGE_KEY, STREAK_TO_PASS } from '../types';

interface Props {
  onStart: (levelDef: LevelDef) => void;
  onBack: () => void;
}

function loadProgress(): Record<string, LevelProgress> {
  try {
    const raw = localStorage.getItem(LEVEL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveProgress(progress: Record<string, LevelProgress>) {
  localStorage.setItem(LEVEL_STORAGE_KEY, JSON.stringify(progress));
}

function initProgress(): Record<string, LevelProgress> {
  const saved = loadProgress();
  const all = getAllLevels();
  const progress: Record<string, LevelProgress> = {};

  for (const level of all) {
    if (saved[level.id]) {
      progress[level.id] = { ...saved[level.id], stars: saved[level.id].stars ?? 0 };
    } else {
      progress[level.id] = {
        status: level.id === '1-1' ? 'unlocked' : 'locked',
        bestStreak: 0,
        stars: 0,
      };
    }
  }

  if (progress['1-1']?.status === 'locked') {
    progress['1-1'] = { status: 'unlocked', bestStreak: 0, stars: 0 };
  }

  return progress;
}

function Stars({ count }: { count: number }) {
  return (
    <span className="level-node-stars">
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= count ? 'star-on' : 'star-off'}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function LevelSelect({ onStart, onBack }: Props) {
  const [progress, setProgress] = useState<Record<string, LevelProgress>>(initProgress);
  const [selectedStage, setSelectedStage] = useState(1);

  useEffect(() => {
    setProgress(initProgress());
  }, []);

  const handleLevelClick = (level: LevelDef) => {
    const p = progress[level.id];
    if (!p || p.status === 'locked') return;
    onStart(level);
  };

  const stageCount = getStageCount();
  const allLevels = getAllLevels();
  const stageLevels = getLevelsByStage(selectedStage);

  const completedCount = allLevels.filter((l) => progress[l.id]?.status === 'completed').length;
  const totalCount = allLevels.length;

  function levelDesc(level: LevelDef): string {
    const c = level.config;
    if (c.octaveMode) return `同音八度 · ${c.sequenceLength} 位 · ${c.instrument}`;
    if (c.minSemitoneGap) return `${c.uniquePitchCount} 音 · ${c.sequenceLength} 位 · 音距≥${c.minSemitoneGap} · ${c.instrument}`;
    return `${c.uniquePitchCount} 音 · ${c.sequenceLength} 位 · ${c.instrument}`;
  }

  return (
    <div className="level-page">
      <div className="level-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <div className="level-progress-summary">
          已完成 {completedCount} / {totalCount} 关
        </div>
      </div>

      <div className="stage-tabs">
        {Array.from({ length: stageCount }, (_, i) => i + 1).map((stage) => {
          const levels = getLevelsByStage(stage);
          const allDone = levels.every((l) => progress[l.id]?.status === 'completed');
          return (
            <button
              key={stage}
              className={`stage-tab ${stage === selectedStage ? 'active' : ''} ${allDone ? 'done' : ''}`}
              onClick={() => setSelectedStage(stage)}
            >
              {getStageName(stage)}
            </button>
          );
        })}
      </div>

      <div className="stage-desc">
        {getStageDescription(selectedStage)}
      </div>

      <div className="level-timeline">
        {stageLevels.map((level) => {
          const p = progress[level.id];
          const isLocked = !p || p.status === 'locked';
          const isCompleted = p?.status === 'completed';
          const isUnlocked = !isLocked && !isCompleted;
          const stars = p?.stars || 0;
          const streak = p?.bestStreak || 0;

          let nodeClass = 'level-node';
          if (isLocked) nodeClass += ' locked';
          if (isCompleted) nodeClass += ' completed';
          if (isUnlocked) nodeClass += ' unlocked';

          return (
            <div
              key={level.id}
              className={nodeClass}
              onClick={() => handleLevelClick(level)}
            >
              <div className="level-dot">
                {isCompleted ? '✓' : isLocked ? '' : level.level}
              </div>
              <div className="level-node-body">
                <span className="level-node-config">
                  {level.id} · {levelDesc(level)}
                </span>
                {isCompleted && <Stars count={stars} />}
                {isUnlocked && streak > 0 && (
                  <span className="level-node-streak">{streak}/{STREAK_TO_PASS}</span>
                )}
              </div>
              {isLocked && <span className="level-node-lock">🔒</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { loadProgress, saveProgress, initProgress, STREAK_TO_PASS };
