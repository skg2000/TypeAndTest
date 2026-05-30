import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { submitTestimonial, fetchMyTestimonial, deleteTestimonial } from "../../api/testimonialApi";
import { Stars } from "./TestimonialCard";
import "./Testimonials.css";

export default function SubmitReview({ onSubmitted }) {
  const { user } = useContext(AuthContext);
  const [open,        setOpen]        = useState(false);
  const [mine,        setMine]        = useState(null);   // existing review
  const [loadingMine, setLoadingMine] = useState(false);

  const [rating,  setRating]  = useState(5);
  const [review,  setReview]  = useState("");
  const [role,    setRole]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Load existing review when user opens the form
  useEffect(() => {
    if (!user || !open) return;
    setLoadingMine(true);
    fetchMyTestimonial()
      .then((doc) => {
        if (doc) {
          setMine(doc);
          setReview(doc.review);
          setRating(doc.rating);
          setRole(doc.role || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoadingMine(false));
  }, [user, open]);

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (review.trim().length < 10) { setError("Please write at least 10 characters."); return; }
    setSaving(true);
    try {
      const res = await submitTestimonial({ review: review.trim(), rating, role: role.trim() });
      setSuccess("Your review is live! Thank you 🎉");
      setMine(res.testimonial);
      onSubmitted?.();          // refresh parent carousel
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete your review?")) return;
    setDeleting(true);
    try {
      await deleteTestimonial();
      setMine(null); setReview(""); setRating(5); setRole("");
      setSuccess("Review deleted.");
      onSubmitted?.();
    } catch { setError("Could not delete."); }
    finally { setDeleting(false); }
  };

  // Not logged in — prompt to login
  if (!user) {
    return (
      <div className="sr-login-prompt">
        <span>💬</span>
        <p>
          <a href="/login" className="sr-link">Log in</a> or{" "}
          <a href="/register" className="sr-link">create an account</a> to share your experience.
        </p>
      </div>
    );
  }

  return (
    <div className="sr-wrap">
      {!open ? (
        <button className="sr-open-btn" onClick={() => setOpen(true)}>
          {mine ? "✏️ Edit Your Review" : "⭐ Share Your Experience"}
        </button>
      ) : (
        <div className="sr-form-card">
          <button className="sr-close" onClick={() => { setOpen(false); setError(""); setSuccess(""); }}>✕</button>

          <h3 className="sr-title">{mine ? "Update Your Review" : "Write a Review"}</h3>
          <p className="sr-hint">Reviewing as <strong>{user.name}</strong></p>

          {loadingMine ? (
            <p className="sr-loading">Loading your existing review…</p>
          ) : (
            <>
              {/* Star picker */}
              <div className="sr-field">
                <label className="sr-label">Rating</label>
                <Stars count={rating} interactive onRate={setRating} />
              </div>

              {/* Role */}
              <div className="sr-field">
                <label className="sr-label">Your role / occupation <span className="sr-optional">(optional)</span></label>
                <input
                  className="sr-input"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Student…"
                  maxLength={60}
                />
              </div>

              {/* Review text */}
              <div className="sr-field">
                <label className="sr-label">
                  Your review
                  <span className="sr-char-count">{review.length}/300</span>
                </label>
                <textarea
                  className="sr-textarea"
                  value={review}
                  onChange={e => setReview(e.target.value)}
                  placeholder="Tell us how TypeMaster improved your typing…"
                  maxLength={300}
                  rows={4}
                />
              </div>

              {error   && <p className="sr-error">{error}</p>}
              {success && <p className="sr-success">{success}</p>}

              <div className="sr-actions">
                <button
                  className="sr-submit-btn"
                  onClick={handleSubmit}
                  disabled={saving || review.trim().length < 10}
                >
                  {saving ? "Submitting…" : mine ? "Update Review" : "Publish Review"}
                </button>
                {mine && (
                  <button
                    className="sr-delete-btn"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting…" : "Delete"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
