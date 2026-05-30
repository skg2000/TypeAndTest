import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes         from "./routes/authRoutes.js";
import resultRoutes       from "./routes/resultRoutes.js";
import profileRoutes      from "./routes/profileRoutes.js";
import friendsRoutes      from "./routes/friendsRoutes.js";
import testimonialRoutes  from "./routes/testimonialRoutes.js";
import lessonRoutes       from "./routes/lessonRoutes.js";

const app = express();
connectDB();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.use("/api/auth",         authRoutes);
app.use("/api/results",      resultRoutes);
app.use("/api/profile",      profileRoutes);
app.use("/api/friends",      friendsRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/lessons",      lessonRoutes);

app.get("/", (req, res) => res.send("Typing Platform API Running"));

export default app;
