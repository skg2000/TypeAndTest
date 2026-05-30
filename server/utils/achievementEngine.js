import Achievement from "../models/Achievement.js";
import Result from "../models/Result.js";

export const checkAchievements = async (userId, result) => {
  const unlocked = [];

  const totalTests = await Result.countDocuments({ user: userId });

  const possible = [];

  /* CONDITIONS */

  if (totalTests === 1) {
    possible.push({
      type: "FIRST_TEST",
      title: "First Test 🎯",
      description: "Completed your first typing test",
    });
  }

  if (result.wpm >= 30) {
    possible.push({
      type: "WPM_30",
      title: "30 WPM ⚡",
      description: "Reached 30 WPM",
    });
  }

  if (result.wpm >= 50) {
    possible.push({
      type: "WPM_50",
      title: "50 WPM 🚀",
      description: "Reached 50 WPM",
    });
  }

  if (result.wpm >= 80) {
    possible.push({
      type: "WPM_80",
      title: "80 WPM 🔥",
      description: "Typing master!",
    });
  }

  if (result.accuracy >= 90) {
    possible.push({
      type: "ACCURACY_90",
      title: "Sharp Accuracy 🎯",
      description: "90%+ accuracy",
    });
  }

  if (totalTests >= 10) {
    possible.push({
      type: "TEST_10",
      title: "Consistent 🔁",
      description: "Completed 10 tests",
    });
  }

  /* SAVE + RETURN ONLY NEW ONES */

  for (let ach of possible) {
    try {
      const created = await Achievement.create({
        user: userId,
        ...ach,
      });

      unlocked.push(created); // ✅ only new ones
    } catch (err) {
      // duplicate → ignore
    }
  }

  return unlocked;
};