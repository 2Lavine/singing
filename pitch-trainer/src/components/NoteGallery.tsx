import { getAllNotes, getNoteColor } from '../audio/notes';
import { playNote, ensureAudioContext } from '../audio/engine';
import { SONGS, CATEGORIES, midiToNote } from '../audio/songs';
import type { InstrumentType } from '../types';
import type { SongCategory } from '../audio/songs';
import { useState, useRef, useEffect, useCallback } from 'react';

const INSTRUMENTS: { id: InstrumentType; label: string }[] = [
  { id: 'piano', label: '钢琴' },
  { id: 'guitar', label: '吉他' },
  { id: 'violin', label: '小提琴' },
  { id: 'flute', label: '长笛' },
  { id: 'organ', label: '风琴' },
];

interface Props {
  onBack: () => void;
}

type PlaybackState = 'idle' | 'playing' | 'paused';
type QuizState = 'idle' | 'listening' | 'waiting' | 'correct' | 'wrong';

export default function NoteGallery({ onBack }: Props) {
  const allNotes = getAllNotes();
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [category, setCategory] = useState<SongCategory>('beginner');
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(-1);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);

  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>('idle');
  const [quizNote, setQuizNote] = useState<number | null>(null); // midi
  const [quizScore, setQuizScore] = useState({ correct: 0, wrong: 0 });
  const [quizStreak, setQuizStreak] = useState(0);
  const quizTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const stopPlayback = () => {
    clearAllTimers();
    setPlaybackState('idle');
    setCurrentNoteIndex(-1);
    setSelectedSongId(null);
  };

  const scheduleFromIndex = (song: typeof SONGS[0], startIndex: number, startElapsedMs: number) => {
    clearAllTimers();

    const beatMs = 60000 / song.bpm;
    let elapsed = startElapsedMs;

    for (let i = startIndex; i < song.notes.length; i++) {
      const sn = song.notes[i];
      const noteStartMs = elapsed;
      const durationMs = sn.duration * beatMs;
      const noteIdx = i;

      const timer = setTimeout(() => {
        if (sn.midi > 0) {
          const note = midiToNote(sn.midi);
          if (note) {
            playNote(note, instrument, (durationMs / 1000) * 0.9);
            setCurrentNoteIndex(noteIdx);
          }
        } else {
          setCurrentNoteIndex(noteIdx);
        }
      }, noteStartMs - startElapsedMs);

      timersRef.current.push(timer);
      elapsed += durationMs;
    }

    const endTimer = setTimeout(() => {
      setPlaybackState('idle');
      setCurrentNoteIndex(-1);
    }, elapsed - startElapsedMs + 200);
    timersRef.current.push(endTimer);
  };

  const playSong = (songId: string) => {
    if (playbackState === 'playing') return;

    const song = SONGS.find((s) => s.id === songId);
    if (!song) return;

    ensureAudioContext();
    setSelectedSongId(songId);

    if (selectedSongId === songId && playbackState === 'paused') {
      scheduleFromIndex(song, currentNoteIndex, pauseTimeRef.current);
      setPlaybackState('playing');
      startTimeRef.current = Date.now() - pauseTimeRef.current;
    } else {
      setCurrentNoteIndex(0);
      startTimeRef.current = Date.now();
      scheduleFromIndex(song, 0, 0);
      setPlaybackState('playing');
    }
  };

  // ===== Quiz logic =====
  const startQuizRound = useCallback(() => {
    if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
    const idx = Math.floor(Math.random() * allNotes.length);
    const note = allNotes[idx];
    setQuizNote(note.midi);
    setQuizState('listening');

    ensureAudioContext();
    playNote(note, instrument, 1.2);

    // After note plays, wait for answer
    quizTimerRef.current = setTimeout(() => {
      setQuizState('waiting');
    }, 1500);
  }, [allNotes, instrument]);

  const handleQuizGuess = (midi: number) => {
    if (quizState !== 'waiting') return;

    if (midi === quizNote) {
      setQuizState('correct');
      setQuizScore((s) => ({ ...s, correct: s.correct + 1 }));
      setQuizStreak((s) => s + 1);
      // Auto-advance after delay
      quizTimerRef.current = setTimeout(() => {
        startQuizRound();
      }, 1200);
    } else {
      setQuizState('wrong');
      setQuizScore((s) => ({ ...s, wrong: s.wrong + 1 }));
      setQuizStreak(0);
      // Show correct answer briefly, then next round
      quizTimerRef.current = setTimeout(() => {
        startQuizRound();
      }, 2000);
    }
  };

  const toggleQuiz = () => {
    if (quizMode) {
      // Turn off
      if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
      setQuizMode(false);
      setQuizState('idle');
      setQuizNote(null);
    } else {
      // Turn on
      setQuizMode(true);
      setQuizScore({ correct: 0, wrong: 0 });
      setQuizStreak(0);
      // Start first round after a beat
      setTimeout(() => startQuizRound(), 500);
    }
  };

  useEffect(() => {
    return () => {
      clearAllTimers();
      if (quizTimerRef.current) clearTimeout(quizTimerRef.current);
    };
  }, []);

  const filteredSongs = SONGS.filter((s) => s.category === category);

  const handlePlay = (midi: number, frequency: number) => {
    if (playbackState === 'playing' || quizMode) return;
    ensureAudioContext();
    playNote(
      { name: 'C', octave: 4, midi, frequency, solfege: 'do' },
      instrument,
      1.5
    );
  };

  const total = quizScore.correct + quizScore.wrong;
  const accuracy = total > 0 ? Math.round((quizScore.correct / total) * 100) : 0;

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h2>音高对照表</h2>
      </div>

      <div className="gallery-toolbar">
        <div className="toolbar-group">
          <label className="toolbar-label">乐器</label>
          <div className="instrument-tabs">
            {INSTRUMENTS.map((inst) => (
              <button
                key={inst.id}
                className={`inst-tab ${instrument === inst.id ? 'active' : ''}`}
                onClick={() => setInstrument(inst.id)}
              >
                {inst.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quiz toggle */}
        <div className="toolbar-group">
          <label className="toolbar-label">模式</label>
          <button
            className={`quiz-toggle ${quizMode ? 'active' : ''}`}
            onClick={toggleQuiz}
          >
            {quizMode ? '🎯 猜音中' : '🎯 猜音模式'}
          </button>
          {quizMode && (
            <span className="quiz-score">
              ✓{quizScore.correct} ✗{quizScore.wrong}
              {total > 0 && <span className="quiz-pct"> ({accuracy}%)</span>}
              {quizStreak >= 3 && <span className="quiz-streak"> 🔥{quizStreak}</span>}
            </span>
          )}
        </div>

        {!quizMode && (
          <>
            <div className="toolbar-group">
              <label className="toolbar-label">分类</label>
              <div className="category-tabs">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`cat-tab ${category === cat.id ? 'active' : ''}`}
                    onClick={() => setCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="toolbar-group">
              <label className="toolbar-label">示范曲</label>
              <div className="song-grid">
                {filteredSongs.map((song) => {
                  const isThisSong = selectedSongId === song.id;
                  const isPlaying = isThisSong && playbackState === 'playing';
                  const isPaused = isThisSong && playbackState === 'paused';
                  return (
                    <div key={song.id} className="song-item">
                      <button
                        className={`song-btn ${isPlaying ? 'playing' : ''} ${isPaused ? 'paused' : ''}`}
                        onClick={() => playSong(song.id)}
                      >
                        {isPlaying ? '⏸ 播放中' : isPaused ? '▶ 继续' : '▶ ' + song.name}
                      </button>
                      {(isPlaying || isPaused) && (
                        <button className="song-stop-btn" onClick={stopPlayback}>✕</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {quizMode && quizState === 'listening' && (
        <div className="quiz-prompt">🎵 正在播放一个音，仔细听...</div>
      )}
      {quizMode && quizState === 'waiting' && (
        <div className="quiz-prompt">👆 点击你认为正确的那个音</div>
      )}
      {quizMode && quizState === 'correct' && (
        <div className="quiz-prompt correct">✅ 正确！{quizStreak >= 3 ? ` 连对 ${quizStreak} 次！` : ''}</div>
      )}
      {quizMode && quizState === 'wrong' && (
        <div className="quiz-prompt wrong">❌ 不对，正确答案已标出</div>
      )}

      <div className="gallery-grid">
        {allNotes.map((note) => {
          
          const isQuizCorrect = quizMode && quizState === 'correct' && note.midi === quizNote;
          const isQuizWrong = quizMode && quizState === 'wrong' && note.midi === quizNote;
          const isQuizListening = quizMode && quizState === 'listening' && note.midi === quizNote;

          let bgColor = getNoteColor(note.name) + '14';
          let borderColor = getNoteColor(note.name);
          let extraClass = '';

          if (isQuizListening) {
            bgColor = getNoteColor(note.name) + '40';
            extraClass = 'cell-active';
          } else if (isQuizCorrect) {
            bgColor = '#27ae6040';
            borderColor = '#27ae60';
            extraClass = 'cell-correct';
          } else if (isQuizWrong) {
            bgColor = '#e74c3c40';
            borderColor = '#e74c3c';
            extraClass = 'cell-wrong';
          }

          return (
            <button
              key={note.midi}
              className={`gallery-cell ${extraClass}`}
              style={{
                borderColor,
                backgroundColor: bgColor,
              }}
              onClick={() => quizMode ? handleQuizGuess(note.midi) : handlePlay(note.midi, note.frequency)}
            >
              <span className="gallery-midi">{note.midi}</span>
              <span className="gallery-name" style={{ color: getNoteColor(note.name) }}>
                {note.name}{note.octave}
              </span>
              <span className="gallery-solfege">{note.solfege}{note.octave}</span>
              <span className="gallery-freq">{note.frequency.toFixed(0)}Hz</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
