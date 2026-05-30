import User from "../models/User.js";
import Result from "../models/Result.js";
import Achievement from "../models/Achievement.js";

/* ── GET PUBLIC PROFILE ── */
export const getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ name: username }).select("-password -email -friendRequests");
    if (!user) return res.status(404).json({ message: "User not found" });

    const results = await Result.find({ user: user._id, isGuest: false })
      .sort({ createdAt: -1 }).limit(20);

    const achievements = await Achievement.find({ user: user._id })
      .sort({ createdAt: -1 });

    res.json({ user, results, achievements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── UPDATE PROFILE ── */
export const updateProfile = async (req, res) => {
  try {
    const { bio, country, avatar } = req.body;
    const updates = {};
    if (bio !== undefined) updates.bio = bio.slice(0, 200);
    if (country !== undefined) updates.country = country;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { returnDocument: 'after' }).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── RECALCULATE & SAVE USER STATS ── */
export const recalcStats = async (userId) => {
  const results = await Result.find({ user: userId, isGuest: false });
  if (!results.length) return;

  const bestWpm = Math.max(...results.map(r => r.wpm));
  const avgWpm = Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length);
  const avgAccuracy = Math.round(results.reduce((s, r) => s + r.accuracy, 0) / results.length);

  // Streak logic
  const user = await User.findById(userId);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const last = user.lastTestDate ? new Date(user.lastTestDate) : null;
  let streak = user.currentStreak;
  if (last) {
    const diffDays = Math.floor((today - last) / 86400000);
    if (diffDays === 1) streak += 1;
    else if (diffDays > 1) streak = 1;
  } else {
    streak = 1;
  }

  await User.findByIdAndUpdate(userId, {
    bestWpm, avgWpm, avgAccuracy,
    totalTests: results.length,
    currentStreak: streak,
    longestStreak: Math.max(user.longestStreak, streak),
    lastTestDate: new Date(),
  });
};

/* ── MATCH HISTORY ── */
export const getMatchHistory = async (req, res) => {
  try {
    const results = await Result.find({ user: req.user._id, isGuest: false })
      .sort({ createdAt: -1 }).limit(50);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
