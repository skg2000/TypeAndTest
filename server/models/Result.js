import mongoose from "mongoose";

const resultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    wpm: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    characters: {
      type: Number,
      required: true,
    },
    time: {
      type: Number,
      required: true,
    },
    mode: {
      type: String,
      enum: ["easy", "medium", "hard", "quotes", "code"],
      default: "medium",
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Result = mongoose.model("Result", resultSchema);

export default Result;