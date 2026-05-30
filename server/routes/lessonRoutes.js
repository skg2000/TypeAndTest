import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getProgress, completeLesson } from "../controllers/lessonController.js";

const router = express.Router();

router.get("/progress",  authMiddleware, getProgress);
router.post("/complete", authMiddleware, completeLesson);

export default router;
