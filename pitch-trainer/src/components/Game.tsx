import { useState, useEffect, useCallback, useRef } from 'react';
import type { Note, GameConfig, GameMode, LevelDef } from '../types';
import { STREAK_TO_PASS, LEVEL_STORAGE_KEY } from '../types';
import { getNoteLabel, getSolfegeLabel, getNoteColor, pickUniqueNotes, generateSequence } from '../audio/notes';
import { playNote, playSequence, playErrorSound, playSuccessSound, ensureAudioContext } from '../audio/engine';
import { getNextLevelId, getLevelById } from '../audio/levels';

interface Props {
  mode: GameMode;
  onBack: () => void;
  onStartLevel?: (levelDef: LevelDef) => void;
}

function createRound(config: GameConfig) {
  const uniqueNotes = pickUniqueNotes(config.uniquePitchCount, config.minSemitoneGap, config.octaveMode);
  const sequence = generateSequence(uniqueNotes, config.sequenceLength);
  return { uniqueNotes, sequence };
}

type FeedbackType = 'correct' | 'wrong' | null;

function loadLevelProgress(): Record<string, { status: string; bestStreak: number; stars: number }> {
  try {
    const raw = localStorage.getItem(LEVEL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveLevelProgress(progress: Record<string, { status: string; bestStreak: number; stars: number }>) {
  localStorage.setItem(LEVEL_STORAGE_KEY, JSON.stringify(progress));
}

export default function Game({ mode, onBack, onStartLevel }: Props) {
  const config = mode.type === 'level' ? mode.levelDef.config : mode.config;
  const isLevel = mode.type === 'level';

  const [round, setRound] = useState(1);
  const [streak, setStreak] = useState(0);
  const [mistakesInRound, setMistakesInRound] = useState(0);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [nextLevelDef, setNextLevelDef] = useState<LevelDef | null>(null);
  const bestStreakRef = useRef(0);

  // Must compute initial round ONCE
  const initRound = useRef<ReturnType<typeof createRound> | null>(null);
  if (initRound.current === null) {
    initRound.current = createRound(config);
  }
  const initial = initRound.current;

  const [uniqueNotes, setUniqueNotes] = useState<Note[]>(initial.uniqueNotes);
  const [sequence, setSequence] = useState<Note[]>(initial.sequence);
  const [userAnswers, setUserAnswers] = useState<(Note | null)[]>(() =>
    Array(config.sequenceLength).fill(null)
  );
  const [currentSlot, setCurrentSlot] = useState(0);
  const [feedbackSlot, setFeedbackSlot] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roundComplete, setRoundComplete] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [showHints, setShowHints] = useState(() => {
    try { return localStorage.getItem('pitch-trainer-hints') === 'true'; } catch { return false; }
  });

  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sequenceRef = useRef(sequence);
  sequenceRef.current = sequence;

  // Load best streak for this level
  useEffect(() => {
    if (isLevel) {
      const progress = loadLevelProgress();
      const p = progress[mode.levelId];
      if (p) {
        bestStreakRef.current = p.bestStreak || 0;
      }
    }
  }, [isLevel, mode.type === 'level' ? mode.levelId : '']);

  const playSeq = useCallback(async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setPlayingIndex(0);
    try {
      await playSequence(sequenceRef.current, config.instrument, 600, 0.8, (i) => {
        setPlayingIndex(i);
      });
    } finally {
      setIsPlaying(false);
      setPlayingIndex(null);
    }
  }, [config.instrument, isPlaying]);

  // Initial auto-play
  const didInitialPlay = useRef(false);
  useEffect(() => {
    if (!didInitialPlay.current) {
      didInitialPlay.current = true;
      playSeq();
    }
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const playSingleNote = useCallback(
    (note: Note) => {
      ensureAudioContext();
      playNote(note, config.instrument, 1.2);
    },
    [config.instrument]
  );

  const handleLevelComplete = useCallback((totalErrors: number) => {
    if (!isLevel) return;

    // Calculate stars: 3=perfect (0 total mistakes), 2=≤2 mistakes, 1=pass
    const stars = totalErrors === 0 ? 3 : totalErrors <= 2 ? 2 : 1;
    setStarsEarned(stars);

    const progress = loadLevelProgress();
    const prev = progress[mode.levelId]?.bestStreak || 0;
    const prevStars = progress[mode.levelId]?.stars || 0;
    progress[mode.levelId] = {
      status: 'completed',
      bestStreak: Math.max(prev, STREAK_TO_PASS),
      stars: Math.max(prevStars, stars),
    };

    // Unlock next level
    const nextId = getNextLevelId(mode.levelId);
    if (nextId) {
      const nextLevel = getLevelById(nextId);
      if (nextLevel) {
        progress[nextId] = {
          status: progress[nextId]?.status === 'completed' ? 'completed' : 'unlocked',
          bestStreak: progress[nextId]?.bestStreak || 0,
          stars: progress[nextId]?.stars || 0,
        };
        setNextLevelDef(nextLevel);
      }
    }
    saveLevelProgress(progress);
  }, [isLevel, mode.type === 'level' ? mode.levelId : '']);

  const handleNoteClick = useCallback(
    (note: Note) => {
      if (isPlaying || roundComplete || levelComplete || feedbackSlot !== null) return;

      if (note.midi === sequence[currentSlot].midi) {
        setFeedbackSlot(currentSlot);
        setFeedbackType('correct');
        playNote(note, config.instrument, 0.5);

        feedbackTimer.current = setTimeout(() => {
          setUserAnswers((prev) => {
            const next = [...prev];
            next[currentSlot] = note;
            return next;
          });
          setFeedbackSlot(null);
          setFeedbackType(null);

          if (currentSlot + 1 >= sequence.length) {
            // Round complete
            setRoundComplete(true);
            playSuccessSound();

            if (isLevel && mistakesInRound === 0) {
              // Perfect round — increment streak
              setStreak((s) => {
                const newStreak = s + 1;
                if (newStreak >= STREAK_TO_PASS) {
                  setLevelComplete(true);
                  handleLevelComplete(totalMistakes);
                }
                return newStreak;
              });
            } else if (isLevel && mistakesInRound > 0) {
              // Had mistakes — reset streak
              setStreak(0);
            }
          } else {
            setCurrentSlot((s) => s + 1);
          }
        }, 400);
      } else {
        setFeedbackSlot(currentSlot);
        setFeedbackType('wrong');
        setMistakesInRound((m) => m + 1);
        setTotalMistakes((t) => t + 1);
        playErrorSound();

        feedbackTimer.current = setTimeout(() => {
          setFeedbackSlot(null);
          setFeedbackType(null);
        }, 600);
      }
    },
    [isPlaying, roundComplete, levelComplete, feedbackSlot, currentSlot, sequence, isLevel, mistakesInRound, totalMistakes, handleLevelComplete]
  );

  const handleSlotClick = (slotIndex: number) => {
    if (isPlaying || feedbackSlot !== null) return;
    if (userAnswers[slotIndex] !== null && slotIndex <= currentSlot && !roundComplete) {
      setUserAnswers((prev) => {
        const next = [...prev];
        next[slotIndex] = null;
        return next;
      });
      setCurrentSlot(slotIndex);
    }
  };

  const handleNextRound = () => {
    const { uniqueNotes: newNotes, sequence: newSeq } = createRound(config);
    sequenceRef.current = newSeq;
    setUniqueNotes(newNotes);
    setSequence(newSeq);
    setUserAnswers(Array(config.sequenceLength).fill(null));
    setCurrentSlot(0);
    setMistakesInRound(0);
    setRoundComplete(false);
    setRound((r) => r + 1);
    setTimeout(() => {
      setIsPlaying(true);
      setPlayingIndex(0);
      playSequence(newSeq, config.instrument, 600, 0.8, (i) => setPlayingIndex(i)).finally(() => {
        setIsPlaying(false);
        setPlayingIndex(null);
      });
    }, 400);
  };

  const handleNextLevel = () => {
    if (nextLevelDef && onStartLevel) {
      onStartLevel(nextLevelDef);
    } else {
      onBack();
    }
  };

  const toggleHints = () => {
    setShowHints((prev) => {
      const next = !prev;
      localStorage.setItem('pitch-trainer-hints', String(next));
      return next;
    });
  };

  const statusText = isPlaying
    ? playingIndex !== null
      ? `正在播放第 ${playingIndex + 1} / ${sequence.length} 个音...`
      : '准备播放...'
    : levelComplete
      ? '关卡通过！'
      : roundComplete
        ? '本轮完成！'
        : `选择第 ${currentSlot + 1} 个位置的音符`;

  const roundOk = roundComplete && !levelComplete;
  const finished = levelComplete;

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <div className="game-stats">
          {isLevel ? (
            <>
              <span className="stat level-badge">{mode.levelDef.id}</span>
              <span className="stat">
                连对 <strong>{streak}</strong>/{STREAK_TO_PASS}
              </span>
            </>
          ) : (
            <>
              <span className="stat">得分 <strong>{streak}</strong></span>
              <span className="stat">第 <strong>{round}</strong> 轮</span>
            </>
          )}
        </div>
      </div>

      {/* Streak bar for level mode */}
      {isLevel && !levelComplete && (
        <div className="streak-bar-container">
          <div className="streak-bar-label">
            连续无错 <span>{streak}/{STREAK_TO_PASS}</span>
          </div>
          <div className="streak-bar">
            <div
              className="streak-bar-fill"
              style={{ width: `${(streak / STREAK_TO_PASS) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="game-controls">
        <button className="play-btn primary" onClick={playSeq} disabled={isPlaying}>
          {isPlaying ? '♫ 播放中...' : '▶ 播放序列'}
        </button>
        <button
          className={`play-btn hint-toggle ${showHints ? 'active' : ''}`}
          onClick={toggleHints}
          title={showHints ? '关闭视觉提示' : '开启视觉提示'}
        >
          {showHints ? '👁 提示开' : '👁 提示关'}
        </button>
      </div>

      {/* Playback indicator — only when hints enabled */}
      {showHints && isPlaying && playingIndex !== null && (
        <div className="playback-indicator">
          <div className="playback-bar">
            {sequence.map((_, i) => (
              <div
                key={i}
                className={`playback-dot ${i === playingIndex ? 'active' : ''} ${i < playingIndex ? 'done' : ''}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="slots-area">
        <div className="slots-row">
          {userAnswers.map((answer, i) => {
            const isCurrent = i === currentSlot && !roundComplete && !levelComplete;
            const isFilled = answer !== null;
            const isFeedbackWrong = feedbackSlot === i && feedbackType === 'wrong';
            const isFeedbackCorrect = feedbackSlot === i && feedbackType === 'correct';

            let slotClass = 'slot';
            if (isCurrent && !isFilled && !isPlaying) slotClass += ' slot-current';
            if (isFilled) slotClass += ' slot-filled';
            if (isFeedbackWrong) slotClass += ' slot-wrong';
            if (isFeedbackCorrect) slotClass += ' slot-correct';

            return (
              <button
                key={i}
                className={slotClass}
                onClick={() => handleSlotClick(i)}
                disabled={isPlaying}
                style={
                  isFilled && answer
                    ? {
                        borderColor: getNoteColor(answer.name),
                        backgroundColor: getNoteColor(answer.name) + '22',
                      }
                    : undefined
                }
              >
                <span className="slot-number">{i + 1}</span>
                {isFilled && answer && (
                  <>
                    <span className="slot-note" style={{ color: getNoteColor(answer.name) }}>
                      {getNoteLabel(answer)}
                    </span>
                    <span className="slot-note-sub">{getSolfegeLabel(answer)}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="status-bar">
        <p className="status-text">{statusText}</p>
      </div>

      <div className="note-options">
        <p className="options-label">
          可选音符（点击填入，🔈 试听）
        </p>
        <div className="note-buttons">
          {uniqueNotes.map((note) => {
            const isPlayingNow = showHints && playingIndex !== null && sequence[playingIndex].midi === note.midi;

            return (
              <button
                key={note.midi}
                className={`note-btn ${isPlayingNow ? 'note-playing' : ''}`}
                style={{
                  borderColor: getNoteColor(note.name),
                  backgroundColor: isPlayingNow
                    ? getNoteColor(note.name) + '40'
                    : getNoteColor(note.name) + '18',
                }}
                onClick={() => handleNoteClick(note)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  playSingleNote(note);
                }}
                disabled={isPlaying || roundComplete || levelComplete}
              >
                <span className="note-midi-badge">{note.midi}</span>
                <span className="note-label" style={{ color: getNoteColor(note.name) }}>
                  {getNoteLabel(note)}
                </span>
                <span className="note-label-sub">{getSolfegeLabel(note)}</span>
                <span
                  className="note-play-hint"
                  onClick={(e) => {
                    e.stopPropagation();
                    playSingleNote(note);
                  }}
                >
                  🔈
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {roundOk && (
        <div className="round-complete-overlay">
          <div className="round-complete-card">
            <h2>
              {isLevel && mistakesInRound > 0
                ? '回答正确（有错误，连对中断）'
                : '回答正确！'}
            </h2>
            {isLevel && (
              <p className="streak-info">
                {mistakesInRound === 0
                  ? `连对 ${streak}/${STREAK_TO_PASS}`
                  : `有 ${mistakesInRound} 次错误，连对重置`}
              </p>
            )}
            <button className="next-round-btn" onClick={handleNextRound}>
              下一轮
            </button>
          </div>
        </div>
      )}

      {finished && (
        <>
          <div className="celebration">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="particle" />
            ))}
          </div>
          <div className="round-complete-overlay">
            <div className="round-complete-card level-clear">
              <h2>关卡通过！</h2>
              <div className="level-clear-stars">
                {[1, 2, 3].map((i) => (
                  <span key={i} className={i <= starsEarned ? 'star-earned' : 'star-empty'}>
                    ★
                  </span>
                ))}
              </div>
              <p className="streak-info">
                {starsEarned === 3
                  ? '完美通关！零失误！'
                  : starsEarned === 2
                    ? `通关！总错误 ${totalMistakes} 次`
                    : `通关！继续练习可以获取更多星星`}
              </p>
              <div className="level-clear-buttons">
                {nextLevelDef && (
                  <button className="next-round-btn" onClick={handleNextLevel}>
                    下一关 →
                  </button>
                )}
                <button className="next-round-btn secondary" onClick={onBack}>
                  返回关卡选择
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
