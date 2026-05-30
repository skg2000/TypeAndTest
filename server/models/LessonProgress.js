import mongoose from "mongoose";

const LessonProgressSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lessonId:     { type: Number, required: true },
  completed:    { type: Boolean, default: false },
  bestWpm:      { type: Number, default: 0 },
  bestAccuracy: { type: Number, default: 0 },
  stars:        { type: Number, default: 0 },   // 1–3 based on accuracy
  attempts:     { type: Number, default: 0 },
  completedAt:  { type: Date, default: null },
}, { timestamps: true });

LessonProgressSchema.index({ user: 1, lessonId: 1 }, { unique: true });

export default mongoose.model("LessonProgress", LessonProgressSchema);
