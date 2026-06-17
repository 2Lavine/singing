import type { GameConfig, GameMode, LevelDef } from './types';
import type { LessonDef } from './lessons/data';
import Home from './components/Home';
import Setup from './components/Setup';
import LevelSelect from './components/LevelSelect';
import LessonList from './components/LessonList';
import LessonView from './components/LessonView';
import Game from './components/Game';
import { useState, useCallback } from 'react';

const LESSON_PROGRESS_KEY = 'pitch-trainer-lessons';

export default function App() {
  const [page, setPage] = useState<'home' | 'free-setup' | 'levels' | 'game' | 'lessons' | 'lesson-view'>('home');
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [activeLesson, setActiveLesson] = useState<LessonDef | null>(null);
  // Key to force Game remount when navigating between levels
  const [gameKey, setGameKey] = useState(0);

  const startFree = useCallback((config: GameConfig) => {
    setGameMode({ type: 'free', config });
    setGameKey((k) => k + 1);
    setPage('game');
  }, []);

  const startLevel = useCallback((levelDef: LevelDef) => {
    setGameMode({ type: 'level', levelId: levelDef.id, levelDef });
    setGameKey((k) => k + 1);
    setPage('game');
  }, []);

  const startLesson = useCallback((lesson: LessonDef) => {
    setActiveLesson(lesson);
    setPage('lesson-view');
  }, []);

  const completeLesson = useCallback(() => {
    if (!activeLesson) return;
    try {
      const raw = localStorage.getItem(LESSON_PROGRESS_KEY);
      const completed: string[] = raw ? JSON.parse(raw) : [];
      if (!completed.includes(activeLesson.id)) {
        completed.push(activeLesson.id);
        localStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(completed));
      }
    } catch { /* ignore */ }
    setPage('lessons');
  }, [activeLesson]);

  const backToHome = useCallback(() => setPage('home'), []);
  const backToLevels = useCallback(() => setPage('levels'), []);

  if (page === 'game' && gameMode) {
    return (
      <Game
        key={gameKey}
        mode={gameMode}
        onBack={gameMode.type === 'free' ? () => setPage('free-setup') : backToLevels}
        onStartLevel={startLevel}
      />
    );
  }

  if (page === 'free-setup') {
    return <Setup onStart={startFree} onBack={backToHome} />;
  }

  if (page === 'levels') {
    return <LevelSelect onStart={startLevel} onBack={backToHome} />;
  }

  if (page === 'lessons') {
    return <LessonList onSelect={startLesson} onBack={backToHome} />;
  }

  if (page === 'lesson-view' && activeLesson) {
    return <LessonView lesson={activeLesson} onComplete={completeLesson} onBack={() => setPage('lessons')} />;
  }

  return (
    <Home
      onFree={() => setPage('free-setup')}
      onLevels={() => setPage('levels')}
      onLessons={() => setPage('lessons')}
    />
  );
}
