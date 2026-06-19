import { getAllNotes, getNoteColor } from '../audio/notes';
import { playNote, ensureAudioContext } from '../audio/engine';
import { SONGS, CATEGORIES, midiToNote } from '../audio/songs';
import type { InstrumentType, SongCategory } from '../types';
import { useState, useRef, useEffect } from 'react';

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

  const currentSong = SONGS.find((s) => s.id === selectedSongId) || null;
  const activeMidi = currentSong && currentNoteIndex >= 0
    ? currentSong.notes[currentNoteIndex]?.midi || null
    : null;

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

  const scheduleFromIndex = (startIndex: number, startElapsedMs: number) => {
    if (!currentSong) return;
    clearAllTimers();

    const beatMs = 60000 / currentSong.bpm;
    let elapsed = startElapsedMs;

    for (let i = startIndex; i < currentSong.notes.length; i++) {
      const sn = currentSong.notes[i];
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

    // End timer
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
      // Resume from pause
      const beatMs = 60000 / song.bpm;
      scheduleFromIndex(currentNoteIndex, pauseTimeRef.current);
      setPlaybackState('playing');
      startTimeRef.current = Date.now() - pauseTimeRef.current;
    } else {
      // Start fresh
      setCurrentNoteIndex(0);
      startTimeRef.current = Date.now();
      scheduleFromIndex(0, 0);
      setPlaybackState('playing');
    }
  };

  const pauseSong = () => {
    if (playbackState !== 'playing' || !currentSong) return;
    pauseTimeRef.current = Date.now() - startTimeRef.current;
    clearAllTimers();
    setPlaybackState('paused');
  };

  useEffect(() => {
    return () => clearAllTimers();
  }, []);

  const filteredSongs = SONGS.filter((s) => s.category === category);

  const handlePlay = (midi: number, frequency: number) => {
    if (playbackState === 'playing') return;
    ensureAudioContext();
    playNote(
      { name: 'C', octave: 4, midi, frequency, solfege: 'do' },
      instrument,
      1.5
    );
  };

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
      </div>

      <div className="gallery-grid">
        {allNotes.map((note) => {
          const isActive = activeMidi === note.midi;
          return (
            <button
              key={note.midi}
              className={`gallery-cell ${isActive ? 'cell-active' : ''}`}
              style={{
                borderColor: getNoteColor(note.name),
                backgroundColor: isActive
                  ? getNoteColor(note.name) + '40'
                  : getNoteColor(note.name) + '14',
              }}
              onClick={() => handlePlay(note.midi, note.frequency)}
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
