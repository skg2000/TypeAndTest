import express from "express";
import {
  saveResult,
  getMyResults,
  getMyStats,
  getLeaderboard,
  getMyAchievements,
} from "../controllers/resultController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import optionalAuth from "../middleware/optionalAuth.js";

const router = express.Router();

/* Save result (guest OR logged-in user) */
router.post("/", optionalAuth, saveResult);

/* Logged-in user results */
router.get("/me", authMiddleware, getMyResults);

/* Dashboard stats */
router.get("/stats/me", authMiddleware, getMyStats);

/* Leaderboard */
router.get("/leaderboard", getLeaderboard);

router.get("/achievements", authMiddleware, getMyAchievements);

export default router;