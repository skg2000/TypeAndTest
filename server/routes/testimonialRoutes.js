import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getTestimonials,
  createTestimonial,
  deleteMyTestimonial,
  getMyTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();

router.get("/",      getTestimonials);            // public
router.get("/mine",  authMiddleware, getMyTestimonial);
router.post("/",     authMiddleware, createTestimonial);
router.delete("/mine", authMiddleware, deleteMyTestimonial);

export default router;
