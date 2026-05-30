import { useState, useEffect, useCallback, useRef } from "react";
import TestimonialCard from "./TestimonialCard";
import SubmitReview    from "./SubmitReview";
import { fetchTestimonials } from "../../api/testimonialApi";
import { SEED_TESTIMONIALS } from "./testimonialsData";
import "./Testimonials.css";

const VISIBLE  = 3;
const INTERVAL = 4500;

function Testimonials() {
  const [allItems,  setAllItems]  = useState(SEED_TESTIMONIALS);
  const [index,     setIndex]     = useState(0);
  const [paused,    setPaused]    = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [dragging,  setDragging]  = useState(false);
  const [dragStart, setDragStart] = useState(0);

  // fetch live reviews and merge with seeds
  const loadReviews = useCallback(() => {
    setLoading(true);
    fetchTestimonials()
      .then((docs) => {
        if (docs.length > 0) {
          // live reviews first, seeds fill remaining slots
          const liveIds = new Set(docs.map(d => d._id));
          const seeds   = SEED_TESTIMONIALS.filter(s => !liveIds.has(s._id));
          setAllItems([...docs, ...seeds]);
        }
      })
      .catch(() => { /* keep seeds on error */ })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const total = allItems.length;
  const next  = useCallback(() => setIndex(i => (i + 1) % total), [total]);
  const prev  = useCallback(() => setIndex(i => (i - 1 + total) % total), [total]);

  // auto-slide
  useEffect(() => {
    if (paused || total === 0) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [paused, next, total]);

  // keyboard
  useEffect(() => {
    const h = (e) => { if (e.key==="ArrowRight") next(); if (e.key==="ArrowLeft") prev(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  // swipe
  const onPointerDown = e => { setDragging(true);  setDragStart(e.clientX ?? e.touches?.[0]?.clientX ?? 0); };
  const onPointerUp   = e => {
    if (!dragging) return;
    setDragging(false);
    const end  = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0;
    const diff = dragStart - end;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
  };

  const visible = Array.from({ length: VISIBLE }).map(
    (_, i) => allItems[(index + i) % total]
  );

  // average rating across live + seeds
  const avgRating = allItems.length
    ? (allItems.reduce((s, t) => s + (t.rating || 5), 0) / allItems.length).toFixed(1)
    : "5.0";

  return (
    <section
      className="testimonials-section"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Header ── */}
      <div className="testimonials-header">
        <span className="testimonials-eyebrow">Loved by typists worldwide</span>
        <h2 className="testimonials-title">What Our Users Say</h2>
        <p className="testimonials-sub">
          Real reviews from real users — {allItems.length}+ and counting.
        </p>
      </div>

      {/* ── Stats bar ── */}
      <div className="testimonials-stats">
        <div className="ts-stat">
          <span className="ts-num">12,400+</span>
          <span className="ts-label">Active typists</span>
        </div>
        <div className="ts-divider" />
        <div className="ts-stat">
          <span className="ts-num">84,000+</span>
          <span className="ts-label">Races completed</span>
        </div>
        <div className="ts-divider" />
        <div className="ts-stat">
          <span className="ts-num">{avgRating} ★</span>
          <span className="ts-label">Average rating</span>
        </div>
      </div>

      {/* ── Carousel ── */}
      {loading ? (
        <div className="tc-skeleton-row">
          {[0,1,2].map(i => <div key={i} className="tc-skeleton-card"><div className="tc-sk-line long"/><div className="tc-sk-line"/><div className="tc-sk-line short"/></div>)}
        </div>
      ) : (
        <>
          <div
            className="testimonials-track"
            onMouseDown={onPointerDown} onMouseUp={onPointerUp}
            onTouchStart={onPointerDown} onTouchEnd={onPointerUp}
          >
            {visible.map((item, i) => (
              <TestimonialCard key={item._id || item.id} item={item} active={i === 1} />
            ))}
          </div>

          {/* ── Dots + arrows ── */}
          <div className="testimonials-nav">
            <button className="tc-nav-btn" onClick={prev} aria-label="Previous">‹</button>
            <div className="tc-dots">
              {allItems.map((_, i) => (
                <button
                  key={i}
                  className={`tc-dot${i === index ? " tc-dot-active" : ""}`}
                  onClick={() => setIndex(i)}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button className="tc-nav-btn" onClick={next} aria-label="Next">›</button>
          </div>
        </>
      )}

      {/* ── Submit / Edit form ── */}
      <SubmitReview onSubmitted={loadReviews} />
    </section>
  );
}

export default Testimonials;
