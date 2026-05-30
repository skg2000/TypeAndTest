import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { fetchLessonProgress, submitLessonComplete } from "../../../api/lessonApi";
import LESSONS, { PHASES } from "../data/lessonsData";
import LessonCard     from "../components/LessonCard";
import LessonTypingBox from "../components/LessonTypingBox";
import LessonResult   from "../components/LessonResult";
import "../styles/lessons.css";

export default function LessonsPage() {
  const { user } = useContext(AuthContext);

  const [progressMap,  setProgressMap]  = useState({});  // { lessonId: progressDoc }
  const [activeLesson, setActiveLesson] = useState(null);
  const [result,       setResult]       = useState(null);
  const [activePhase,  setActivePhase]  = useState(1);
  const [loading,      setLoading]      = useState(true);

  // Fetch progress
  const loadProgress = useCallback(() => {
    if (!user) { setLoading(false); return; }
    fetchLessonProgress()
      .then(docs => {
        const map = {};
        docs.forEach(d => { map[d.lessonId] = d; });
        setProgressMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { loadProgress(); }, [loadProgress]);

  // Determine if a lesson is unlocked
  const isUnlocked = (lesson) => {
    if (lesson.unlockRequirement === 0) return true;
    return !!progressMap[lesson.unlockRequirement]?.completed;
  };

  // Handle lesson completion
  const handleComplete = async ({ wpm, accuracy }) => {
    let xpEarned = 0, stars = 0, passed = accuracy >= 75;

    if (user) {
      try {
        const res = await submitLessonComplete({ lessonId: activeLesson.id, wpm, accuracy });
        xpEarned = res.xpEarned;
        stars    = res.stars;
        passed   = res.passed;
        await loadProgress();
      } catch (e) {
        console.error(e);
        stars = accuracy >= 98 ? 3 : accuracy >= 90 ? 2 : accuracy >= 75 ? 1 : 0;
      }
    } else {
      stars = accuracy >= 98 ? 3 : accuracy >= 90 ? 2 : accuracy >= 75 ? 1 : 0;
    }

    setResult({ wpm, accuracy, stars, xpEarned, passed });
  };

  const handleNext = () => {
    const idx  = LESSONS.findIndex(l => l.id === activeLesson.id);
    const next = LESSONS[idx + 1];
    if (next) {
      setResult(null);
      setActiveLesson(next);
      setActivePhase(next.phase);
    } else {
      setActiveLesson(null);
      setResult(null);
    }
  };

  const handleRetry = () => {
    setResult(null);
  };

  // Filter lessons by active phase
  const phaseLessons = LESSONS.filter(l => l.phase === activePhase);

  // Overall progress
  const totalDone = Object.values(progressMap).filter(p => p.completed).length;
  const totalPct  = Math.round((totalDone / LESSONS.length) * 100);

  /* ── LESSON ACTIVE VIEW ── */
  if (activeLesson && !result) {
    return (
      <div className="lessons-page">
        <div className="lp-active-header">
          <button className="lp-back-btn" onClick={() => setActiveLesson(null)}>
            ← Back to Lessons
          </button>
          <div className="lp-active-meta">
            <span className="lp-active-phase">{PHASES.find(p => p.id === activeLesson.phase)?.name}</span>
            <h2 className="lp-active-title">{activeLesson.title}</h2>
            <p className="lp-active-subtitle">{activeLesson.subtitle}</p>
          </div>
          <div className="lp-active-targets">
            {activeLesson.targetKeys.length > 0 && (
              <div className="lp-targets">
                {activeLesson.targetKeys.map(k => (
                  <kbd key={k} className="lp-target-key">{k === " " ? "Space" : k.toUpperCase()}</kbd>
                ))}
              </div>
            )}
          </div>
        </div>

        <LessonTypingBox lesson={activeLesson} onComplete={handleComplete} />
      </div>
    );
  }

  /* ── RESULT OVERLAY ── */
  if (activeLesson && result) {
    return (
      <div className="lessons-page">
        <LessonResult
          result={result}
          lesson={activeLesson}
          onRetry={handleRetry}
          onNext={LESSONS.find(l => l.id === activeLesson.id + 1) ? handleNext : null}
        />
      </div>
    );
  }

  /* ── LESSON BROWSER ── */
  return (
    <div className="lessons-page">
      {/* Hero header */}
      <div className="lp-hero">
        <span className="lp-eyebrow">Structured Learning Path</span>
        <h1 className="lp-title">Typing Lessons</h1>
        <p className="lp-sub">30 lessons across 8 phases — from home row to expert speed.</p>

        {/* Overall progress */}
        <div className="lp-overall-progress">
          <div className="lp-op-bar">
            <div className="lp-op-fill" style={{ width: `${totalPct}%` }} />
          </div>
          <span className="lp-op-label">{totalDone} / {LESSONS.length} lessons complete — {totalPct}%</span>
        </div>

        {!user && (
          <p className="lp-guest-note">
            💡 <a href="/login">Log in</a> to save your progress and earn XP.
          </p>
        )}
      </div>

      {/* Phase tabs */}
      <div className="lp-phase-tabs">
        {PHASES.map(ph => {
          const done  = LESSONS.filter(l => l.phase === ph.id && progressMap[l.id]?.completed).length;
          const total = LESSONS.filter(l => l.phase === ph.id).length;
          return (
            <button
              key={ph.id}
              className={`lp-phase-tab${activePhase === ph.id ? " lp-tab-active" : ""}`}
              onClick={() => setActivePhase(ph.id)}
              style={{ "--ph-color": ph.color }}
            >
              <span className="lp-tab-icon">{ph.icon}</span>
              <span className="lp-tab-name">{ph.name}</span>
              <span className="lp-tab-prog">{done}/{total}</span>
            </button>
          );
        })}
      </div>

      {/* Phase info banner */}
      {(() => {
        const ph = PHASES.find(p => p.id === activePhase);
        return (
          <div className="lp-phase-banner" style={{ borderColor: ph.color, background: `${ph.color}12` }}>
            <span style={{ fontSize: 24 }}>{ph.icon}</span>
            <div>
              <strong style={{ color: ph.color }}>{ph.name}</strong>
              <span className="lp-phase-desc"> — {ph.description}</span>
            </div>
          </div>
        );
      })()}

      {/* Lesson cards */}
      {loading ? (
        <div className="lp-skeleton-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="lp-skeleton-card">
              <div className="lp-sk-line long" />
              <div className="lp-sk-line" />
              <div className="lp-sk-line short" />
            </div>
          ))}
        </div>
      ) : (
        <div className="lp-cards-grid">
          {phaseLessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              progress={progressMap[lesson.id]}
              locked={!isUnlocked(lesson)}
              phaseColor={PHASES.find(p => p.id === lesson.phase)?.color}
              onClick={() => { setActiveLesson(lesson); setResult(null); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
