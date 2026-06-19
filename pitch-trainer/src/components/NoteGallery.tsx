import { getAllNotes, getNoteColor } from '../audio/notes';
import { playNote, ensureAudioContext } from '../audio/engine';
import type { InstrumentType } from '../types';
import { useState } from 'react';

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

  const handlePlay = (midi: number, frequency: number) => {
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

      <div className="gallery-grid">
        {allNotes.map((note) => (
          <button
            key={note.midi}
            className="gallery-cell"
            style={{
              borderColor: getNoteColor(note.name),
              backgroundColor: getNoteColor(note.name) + '14',
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
        ))}
      </div>
    </div>
  );
}
