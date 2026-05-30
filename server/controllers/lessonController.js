import LessonProgress from "../models/LessonProgress.js";
import User from "../models/User.js";

/* ── Stars based on accuracy ── */
function calcStars(accuracy) {
  if (accuracy >= 98) return 3;
  if (accuracy >= 90) return 2;
  if (accuracy >= 75) return 1;
  return 0;
}

/* ── XP reward ── */
function calcXp(stars, accuracy) {
  const base = 50;
  const bonus = stars === 3 ? 100 : stars === 2 ? 40 : 0;
  return base + bonus;
}

/* GET /api/lessons/progress  — all progress for the logged-in user */
export const getProgress = async (req, res) => {
  try {
    const progress = await LessonProgress.find({ user: req.user._id }).lean();
    res.json(progress);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* POST /api/lessons/complete  — save a lesson attempt */
export const completeLesson = async (req, res) => {
  try {
    const { lessonId, wpm, accuracy } = req.body;
    if (!lessonId || wpm == null || accuracy == null)
      return res.status(400).json({ message: "lessonId, wpm, accuracy are required" });

    const stars     = calcStars(accuracy);
    const passed    = accuracy >= 75;  // minimum to count as completed
    const xpEarned  = passed ? calcXp(stars, accuracy) : 0;

    // Upsert — only improve, never downgrade stars/wpm/accuracy
    const existing = await LessonProgress.findOne({ user: req.user._id, lessonId });

    let doc;
    if (existing) {
      const improved = {
        attempts: existing.attempts + 1,
        completed: existing.completed || passed,
        completedAt: existing.completedAt || (passed ? new Date() : null),
      };
      if (wpm      > existing.bestWpm)      improved.bestWpm      = wpm;
      if (accuracy > existing.bestAccuracy) improved.bestAccuracy = accuracy;
      if (stars    > existing.stars)        improved.stars        = stars;
      doc = await LessonProgress.findByIdAndUpdate(existing._id, improved, { returnDocument: "after" });
    } else {
      doc = await LessonProgress.create({
        user: req.user._id, lessonId,
        completed: passed, bestWpm: wpm, bestAccuracy: accuracy,
        stars, attempts: 1, completedAt: passed ? new Date() : null,
      });
    }

    // Award XP to user
    if (xpEarned > 0) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { xp: xpEarned } });
    }

    res.status(200).json({ progress: doc, xpEarned, stars, passed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
