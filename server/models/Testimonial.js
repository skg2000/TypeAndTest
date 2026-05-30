import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // denormalised snapshot so the card still looks right if user changes profile
    name:   { type: String, required: true },
    role:   { type: String, default: "TypeMaster User", maxlength: 60 },
    avatar: { type: String, default: "" },   // Cloudinary URL or ""
    country:{ type: String, default: "" },   // ISO-2 e.g. "IN"
    color:  { type: String, default: "#8b5cf6" },

    review: { type: String, required: true, minlength: 10, maxlength: 300 },
    rating: { type: Number, required: true, min: 1, max: 5 },

    approved: { type: Boolean, default: true },  // auto-approve; set false for moderation
    helpful:  { type: Number, default: 0 },       // future "helpful" votes
  },
  { timestamps: true }
);

// one review per user
TestimonialSchema.index({ user: 1 }, { unique: true });

export default mongoose.model("Testimonial", TestimonialSchema);
