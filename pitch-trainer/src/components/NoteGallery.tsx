import { getAllNotes, getNoteColor } from '../audio/notes';
import { playNote, ensureAudioContext } from '../audio/engine';
import { SONGS, midiToNote } from '../audio/songs';
import type { InstrumentType } from '../types';
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

export default function NoteGallery({ onBack }: Props) {
  const allNotes = getAllNotes();
  const [instrument, setInstrument] = useState<InstrumentType>('piano');
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlay = (midi: number, frequency: number) => {
    if (isPlaying) return;
    ensureAudioContext();
    playNote(
      { name: 'C', octave: 4, midi, frequency, solfege: 'do' },
      instrument,
      1.5
    );
  };

  const stopSong = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setPlayingIndex(null);
  };

  const playSong = (songId: string) => {
    const song = SONGS.find((s) => s.id === songId);
    if (!song || isPlaying) return;

    stopSong();
    setIsPlaying(true);
    setSelectedSong(songId);
    ensureAudioContext();

    const beatMs = 60000 / song.bpm;
    let elapsed = 0;

    song.notes.forEach((sn, i) => {
      const noteStartMs = elapsed;
      const durationMs = sn.duration * beatMs;

      timerRef.current = setTimeout(() => {
        if (sn.midi > 0) {
          const note = midiToNote(sn.midi);
          if (note) {
            playNote(note, instrument, durationMs / 1000 * 0.9);
            setPlayingIndex(i);
          }
        }
      }, noteStartMs);

      elapsed += durationMs;
    });

    // End
    timerRef.current = setTimeout(() => {
      setIsPlaying(false);
      setPlayingIndex(null);
    }, elapsed + 500);
  };

  useEffect(() => {
    return () => stopSong();
  }, []);

  const activeSong = SONGS.find((s) => s.id === selectedSong);
  const activeMidi = activeSong && playingIndex !== null ? activeSong.notes[playingIndex]?.midi : null;

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
                disabled={isPlaying}
              >
                {inst.label}
              </button>
            ))}
          </div>
        </div>
        <div className="toolbar-group">
          <label className="toolbar-label">示范曲</label>
          <div className="song-grid">
            {SONGS.map((song) => (
              <button
                key={song.id}
                className={`song-btn ${selectedSong === song.id && isPlaying ? 'playing' : ''}`}
                onClick={() => playSong(song.id)}
                disabled={isPlaying}
              >
                {isPlaying && selectedSong === song.id ? '♪ 播放中' : '▶ ' + song.name}
              </button>
            ))}
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
