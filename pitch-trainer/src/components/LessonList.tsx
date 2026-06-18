import { useState, useEffect } from 'react';
import type { LessonDef } from '../lessons/data';
import { LESSONS } from '../lessons/data';

interface Props {
  onSelect: (lesson: LessonDef) => void;
  onBack: () => void;
}

const PROGRESS_KEY = 'pitch-trainer-lessons';

function loadCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch { return new Set(); }
}

export default function LessonList({ onSelect, onBack }: Props) {
  const [completed, setCompleted] = useState<Set<string>>(() => loadCompleted());

  useEffect(() => {
    setCompleted(loadCompleted());
  }, []);

  return (
    <div className="lesson-page">
      <div className="level-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <div className="level-progress-summary">
          已完成 {LESSONS.filter((l) => completed.has(l.id)).length} / {LESSONS.length} 课
        </div>
      </div>

      <header className="setup-header">
        <h1>音准课程</h1>
        <p className="subtitle">学习理论知识，建立音高认知</p>
      </header>

      <div className="lesson-grid">
        {LESSONS.map((lesson, i) => {
          const done = completed.has(lesson.id);
          return (
            <button
              key={lesson.id}
              className={`lesson-card ${done ? 'completed' : ''}`}
              onClick={() => onSelect(lesson)}
            >
              <span className="lesson-number">第 {i + 1} 课</span>
              <div className="lesson-card-body">
                <span className="lesson-title">{lesson.title}</span>
                <span className="lesson-subtitle">{lesson.subtitle}</span>
              </div>
              {done && <span className="level-check">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
