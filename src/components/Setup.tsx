import { useState } from 'react';
import type { GameConfig, InstrumentType, InstrumentInfo } from '../types';
import { ensureAudioContext } from '../audio/engine';

const INSTRUMENTS: InstrumentInfo[] = [
  { id: 'piano', label: '钢琴', emoji: '🎹' },
  { id: 'guitar', label: '吉他', emoji: '🎸' },
  { id: 'violin', label: '小提琴', emoji: '🎻' },
  { id: 'flute', label: '长笛', emoji: '🪈' },
  { id: 'organ', label: '风琴', emoji: '🎹' },
];

interface Props {
  onStart: (config: GameConfig) => void;
  onBack: () => void;
}

export default function Setup({ onStart, onBack }: Props) {
  const [uniquePitchCount, setUniquePitchCount] = useState(2);
  const [sequenceLength, setSequenceLength] = useState(3);
  const [instrument, setInstrument] = useState<InstrumentType>('piano');

  const minSeq = uniquePitchCount;
  const maxSeq = 15;

  const handleStart = () => {
    ensureAudioContext();
    onStart({
      uniquePitchCount,
      sequenceLength: Math.max(sequenceLength, minSeq),
      instrument,
    });
  };

  return (
    <div className="setup-page">
      <button className="back-btn setup-back" onClick={onBack}>
        ← 返回
      </button>
      <header className="setup-header">
        <h1>自由练习</h1>
        <p className="subtitle">自定义参数，无限挑战</p>
      </header>

      <div className="setup-card">
        <div className="param-group">
          <div className="param-label">
            <span>音高数量</span>
            <span className="param-value">{uniquePitchCount}</span>
          </div>
          <p className="param-hint">练习中出现的不同音高个数</p>
          <input
            type="range"
            min={2}
            max={8}
            value={uniquePitchCount}
            onChange={(e) => {
              const v = Number(e.target.value);
              setUniquePitchCount(v);
              if (sequenceLength < v) setSequenceLength(v);
            }}
            className="slider"
          />
          <div className="range-labels">
            <span>2</span><span>8</span>
          </div>
        </div>

        <div className="param-group">
          <div className="param-label">
            <span>测试长度</span>
            <span className="param-value">{sequenceLength}</span>
          </div>
          <p className="param-hint">每轮测试中需要排序的音符数量</p>
          <input
            type="range"
            min={minSeq}
            max={maxSeq}
            value={sequenceLength}
            onChange={(e) => setSequenceLength(Number(e.target.value))}
            className="slider"
          />
          <div className="range-labels">
            <span>{minSeq}</span><span>{maxSeq}</span>
          </div>
        </div>
      </div>

      <div className="setup-card">
        <h3 className="card-title">选择乐器</h3>
        <div className="instrument-grid">
          {INSTRUMENTS.map((inst) => (
            <button
              key={inst.id}
              className={`instrument-btn ${instrument === inst.id ? 'active' : ''}`}
              onClick={() => {
                setInstrument(inst.id);
                ensureAudioContext();
              }}
            >
              <span className="instrument-emoji">{inst.emoji}</span>
              <span className="instrument-label">{inst.label}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="start-btn" onClick={handleStart}>
        开始练习
      </button>
    </div>
  );
}
