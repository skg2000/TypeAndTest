import Result from "../models/Result.js";
import Achievement from "../models/Achievement.js";
import User from "../models/User.js";
import { checkAchievements } from "../utils/achievementEngine.js";

async function updateUserStats(userId) {
  const results = await Result.find({ user: userId, isGuest: false });
  if (!results.length) return;

  const bestWpm = Math.max(...results.map(r => r.wpm));
  const avgWpm = Math.round(results.reduce((s, r) => s + r.wpm, 0) / results.length);
  const avgAccuracy = Math.round(results.reduce((s, r) => s + r.accuracy, 0) / results.length);

  const user = await User.findById(userId);
  const today = new Date(); today.setHours(0,0,0,0);
  const last = user.lastTestDate ? new Date(user.lastTestDate) : null;
  let streak = user.currentStreak || 0;

  if (last) {
    last.setHours(0,0,0,0);
    const diff = Math.round((today - last) / 86400000);
    if (diff === 1) streak += 1;
    else if (diff > 1) streak = 1;
    // same day: don't change streak
  } else {
    streak = 1;
  }

  await User.findByIdAndUpdate(userId, {
    bestWpm, avgWpm, avgAccuracy,
    totalTests: results.length,
    currentStreak: streak,
    longestStreak: Math.max(user.longestStreak || 0, streak),
    lastTestDate: new Date(),
  });
}

/* ── SAVE RESULT ── */
export const saveResult = async (req, res) => {
  try {
    const { wpm, accuracy, characters, time, mode } = req.body;
    if (wpm === undefined || accuracy === undefined || characters === undefined || time === undefined || !mode) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await Result.create({
      user: req.user?._id || null,
      wpm, accuracy, characters, time, mode,
      isGuest: !req.user?._id,
    });

    let unlockedAchievements = [];
    if (req.user?._id) {
      unlockedAchievements = await checkAchievements(req.user._id, result);
      await updateUserStats(req.user._id);
    }

    res.status(201).json({ message: "Result saved successfully", result, unlockedAchievements });
  } catch (error) {
    console.error("Save Result Error:", error);
    res.status(500).json({ message: "Server error while saving result" });
  }
};

/* ── GET MY RESULTS ── */
export const getMyResults = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });
    const results = await Result.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching results" });
  }
};

/* ── DASHBOARD STATS ── */
export const getMyStats = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });
    const results = await Result.find({ user: req.user._id }).sort({ createdAt: -1 });
    const totalTests = results.length;
    const bestWpm = totalTests > 0 ? Math.max(...results.map(r => r.wpm)) : 0;
    const averageWpm = totalTests > 0 ? Math.round(results.reduce((s, r) => s + r.wpm, 0) / totalTests) : 0;
    const averageAccuracy = totalTests > 0 ? Math.round(results.reduce((s, r) => s + r.accuracy, 0) / totalTests) : 0;
    res.status(200).json({ totalTests, bestWpm, averageWpm, averageAccuracy, recentResults: results.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching stats" });
  }
};

/* ── GLOBAL LEADERBOARD ── */
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Result.aggregate([
      { $match: { isGuest: false } },
      { $sort: { wpm: -1, accuracy: -1 } },
      { $group: { _id: "$user", wpm: { $first: "$wpm" }, accuracy: { $first: "$accuracy" }, createdAt: { $first: "$createdAt" } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $sort: { wpm: -1 } },
      { $limit: 50 },
      { $project: { _id: 1, wpm: 1, accuracy: 1, "user.name": 1, "user.avatar": 1, "user.rating": 1, "user.country": 1 } },
    ]);
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
};

/* ── ACHIEVEMENTS ── */
export const getMyAchievements = async (req, res) => {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });
    const achievements = await Achievement.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(achievements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching achievements" });
  }
};
