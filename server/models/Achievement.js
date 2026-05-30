import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    title: String,
    description: String,
  },
  { timestamps: true }
);

/* Prevent duplicate achievements */
achievementSchema.index({ user: 1, type: 1 }, { unique: true });

export default mongoose.model("Achievement", achievementSchema);