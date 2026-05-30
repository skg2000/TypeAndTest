import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: String,

  // Profile
  bio: { type: String, default: "" },
  country: { type: String, default: "" },
  avatar: { type: String, default: "" }, // Cloudinary URL

  // Stats (denormalized for fast reads)
  bestWpm: { type: Number, default: 0 },
  avgWpm: { type: Number, default: 0 },
  avgAccuracy: { type: Number, default: 100 },
  totalRaces: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 },
  racesWon: { type: Number, default: 0 },

  // Progression
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  rating: { type: Number, default: 1200 },

  // Streak
  lastTestDate: { type: Date, default: null },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },

  // Friends
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Online
  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
