import { useState, useEffect } from 'react';
import { LEVEL_STORAGE_KEY } from '../types';
import { getAllLevels } from '../audio/levels';

const LESSON_PROGRESS_KEY = 'pitch-trainer-lessons';
const TOTAL_LESSONS = 8;

interface Props {
  onFree: () => void;
  onLevels: () => void;
  onLessons: () => void;
}

function loadProgress() {
  try {
    const levels = JSON.parse(localStorage.getItem(LEVEL_STORAGE_KEY) || '{}');
    const allLevels = getAllLevels();
    const completedLevels = allLevels.filter((l) => levels[l.id]?.status === 'completed').length;
    const totalStars = allLevels.reduce((sum, l) => sum + (levels[l.id]?.stars || 0), 0);
    const maxStars = allLevels.length * 3;
    return { completedLevels, totalLevels: allLevels.length, totalStars, maxStars };
  } catch { return { completedLevels: 0, totalLevels: 25, totalStars: 0, maxStars: 75 }; }
}

function loadLessonProgress() {
  try {
    const raw = localStorage.getItem(LESSON_PROGRESS_KEY);
    const completed: string[] = raw ? JSON.parse(raw) : [];
    return completed.length;
  } catch { return 0; }
}

export default function Home({ onFree, onLevels, onLessons }: Props) {
  const [progress, setProgress] = useState(loadProgress);
  const [lessonsDone, setLessonsDone] = useState(loadLessonProgress);

  useEffect(() => {
    setProgress(loadProgress());
    setLessonsDone(loadLessonProgress());
  }, []);

  const totalItems = progress.totalLevels + TOTAL_LESSONS;
  const completedItems = progress.completedLevels + lessonsDone;
  const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const circumference = 2 * Math.PI * 22;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>音准练习</h1>
        <p className="subtitle">训练你的耳朵，提升音准感知力</p>
      </header>

      {/* Progress overview */}
      <div className="progress-overview">
        <div className="progress-ring">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle className="progress-ring-bg" cx="28" cy="28" r="22" />
            <circle
              className="progress-ring-fill"
              cx="28" cy="28" r="22"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span className="progress-ring-text">{pct}%</span>
        </div>
        <div className="progress-details">
          <div className="progress-item">
            <span>音准课程</span>
            <strong>{lessonsDone} / {TOTAL_LESSONS} 课</strong>
          </div>
          <div className="progress-item">
            <span>关卡模式</span>
            <strong>{progress.completedLevels} / {progress.totalLevels} 关</strong>
          </div>
          <div className="progress-item">
            <span>获得星星</span>
            <strong>{progress.totalStars} / {progress.maxStars}</strong>
          </div>
        </div>
      </div>

      <div className="mode-cards">
        <button className="mode-card mode-lessons" onClick={onLessons}>
          <div className="mode-icon">课</div>
          <div className="mode-card-body">
            <span className="mode-title">音准课程</span>
            <span className="mode-desc">学习音高理论，建立声音认知</span>
          </div>
          <span className="mode-badge">{lessonsDone}/{TOTAL_LESSONS}</span>
        </button>

        <button className="mode-card mode-levels" onClick={onLevels}>
          <div className="mode-icon">关</div>
          <div className="mode-card-body">
            <span className="mode-title">关卡模式</span>
            <span className="mode-desc">从简单到困难，25 关循序渐进</span>
          </div>
          <span className="mode-badge">{progress.completedLevels}/{progress.totalLevels}</span>
        </button>

        <button className="mode-card mode-free" onClick={onFree}>
          <div className="mode-icon">练</div>
          <div className="mode-card-body">
            <span className="mode-title">自由练习</span>
            <span className="mode-desc">自定义音高数量、长度和乐器</span>
          </div>
        </button>
      </div>
    </div>
  );
}
