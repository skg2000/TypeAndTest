import express from "express";
import { getProfile, updateProfile, getMatchHistory } from "../controllers/profileController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:username", getProfile);
router.put("/me/update", authMiddleware, updateProfile);
router.get("/me/history", authMiddleware, getMatchHistory);

export default router;
