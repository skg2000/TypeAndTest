import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";

const AVATAR_COLORS = [
  "#8b5cf6","#ec4899","#06b6d4","#f59e0b",
  "#22c55e","#ef4444","#38bdf8","#a855f7",
];

/* ── GET /api/testimonials  (public) ── */
export const getTestimonials = async (req, res) => {
  try {
    const docs = await Testimonial.find({ approved: true })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ── POST /api/testimonials  (auth required) ── */
export const createTestimonial = async (req, res) => {
  try {
    const { review, rating, role } = req.body;

    if (!review?.trim() || review.trim().length < 10)
      return res.status(400).json({ message: "Review must be at least 10 characters." });
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5." });

    const user = await User.findById(req.user._id).lean();
    if (!user) return res.status(404).json({ message: "User not found." });

    // pick a consistent colour based on user id
    const colorIdx = parseInt(user._id.toString().slice(-2), 16) % AVATAR_COLORS.length;
    const color = AVATAR_COLORS[colorIdx];

    // initials for avatar fallback (first letter of each word in name, max 2)
    const initials = user.name
      .split(" ")
      .map((w) => w[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");

    const doc = await Testimonial.findOneAndUpdate(
      { user: req.user._id },
      {
        user:    req.user._id,
        name:    user.name,
        role:    role?.trim().slice(0, 60) || "TypeMaster User",
        avatar:  user.avatar || "",
        country: user.country || "",
        color,
        review:  review.trim().slice(0, 300),
        rating:  Math.round(rating),
        approved: true,
        $setOnInsert: { helpful: 0 },
      },
      { upsert: true, returnDocument: 'after' }
    );

    res.status(201).json({ message: "Review submitted!", testimonial: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ── DELETE /api/testimonials/mine  (auth required) ── */
export const deleteMyTestimonial = async (req, res) => {
  try {
    await Testimonial.findOneAndDelete({ user: req.user._id });
    res.json({ message: "Review deleted." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ── GET /api/testimonials/mine  (auth required) ── */
export const getMyTestimonial = async (req, res) => {
  try {
    const doc = await Testimonial.findOne({ user: req.user._id }).lean();
    res.json(doc || null);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
