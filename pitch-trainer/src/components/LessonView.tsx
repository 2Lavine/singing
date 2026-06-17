import { useState } from 'react';
import type { Note } from '../types';
import type { LessonDef, QuizItem } from '../lessons/data';
import { playSequence, playNote, ensureAudioContext } from '../audio/engine';

interface Props {
  lesson: LessonDef;
  onComplete: () => void;
  onBack: () => void;
}

function Quiz({ quiz, onAnswer }: { quiz: QuizItem; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const ok = i === quiz.answer;
    setResult(ok ? 'correct' : 'wrong');
    onAnswer(ok);
  };

  const playQuizAudio = () => {
    ensureAudioContext();
    quiz.notes.forEach((note, i) => {
      setTimeout(() => playNote(note, 'piano', 1.0), i * 700);
    });
  };

  return (
    <div className="quiz-box">
      <p className="quiz-question">{quiz.question}</p>
      <button className="play-btn primary small" onClick={playQuizAudio}>
        ▶ 播放
      </button>
      <div className="quiz-options">
        {quiz.options.map((opt, i) => {
          let cls = 'quiz-option';
          if (selected === i) {
            cls += result === 'correct' ? ' correct' : ' wrong';
          }
          if (selected !== null && i === quiz.answer && result === 'wrong') {
            cls += ' correct'; // show correct answer
          }
          return (
            <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={selected !== null}>
              {opt}
            </button>
          );
        })}
      </div>
      {result && (
        <p className={`quiz-feedback ${result}`}>
          {result === 'correct' ? '✓ 正确！' : `✗ 正确答案是：${quiz.options[quiz.answer]}`}
        </p>
      )}
    </div>
  );
}

export default function LessonView({ lesson, onComplete, onBack }: Props) {
  const [quizPassed, setQuizPassed] = useState<boolean[]>(
    () => lesson.sections.map(() => false)
  );

  const allQuizPassed = lesson.sections.every((s, i) => !s.quiz || quizPassed[i]);

  const handleQuizAnswer = (sectionIdx: number, correct: boolean) => {
    if (correct) {
      setQuizPassed((prev) => {
        const next = [...prev];
        next[sectionIdx] = true;
        return next;
      });
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <div className="lesson-view-page">
      <div className="level-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <div className="level-progress-summary">
          {allQuizPassed ? '本课完成' : '学习中'}
        </div>
      </div>

      <header className="lesson-header">
        <h1>{lesson.title}</h1>
        <p className="subtitle">{lesson.subtitle}</p>
      </header>

      <div className="lesson-content">
        {lesson.sections.map((section, si) => (
          <div key={si} className="lesson-section">
            {section.heading && <h2 className="lesson-heading">{section.heading}</h2>}
            {section.paragraphs.map((p, pi) => (
              <p key={pi} className="lesson-paragraph">{p}</p>
            ))}

            {section.audio && section.audio.length > 0 && (
              <div className="lesson-audio-group">
                {section.audio.map((audio, ai) => (
                  <AudioButton key={ai} audio={audio} />
                ))}
              </div>
            )}

            {section.quiz && (
              <Quiz quiz={section.quiz} onAnswer={(ok) => handleQuizAnswer(si, ok)} />
            )}
          </div>
        ))}
      </div>

      <div className="lesson-footer">
        {allQuizPassed && (
          <button className="start-btn" onClick={handleComplete}>
            完成课程 ✓
          </button>
        )}
      </div>
    </div>
  );
}

function AudioButton({ audio }: { audio: { label: string; notes: Note[]; desc?: string } }) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = async () => {
    ensureAudioContext();
    setPlaying(true);
    await playSequence(audio.notes, 'piano', 500, 0.8);
    setPlaying(false);
  };

  return (
    <button
      className={`audio-btn ${playing ? 'playing' : ''}`}
      onClick={handlePlay}
      disabled={playing}
    >
      <span className="audio-icon">{playing ? '♫' : '▶'}</span>
      <span className="audio-label">{audio.label}</span>
      {audio.desc && <span className="audio-desc">{audio.desc}</span>}
    </button>
  );
}
