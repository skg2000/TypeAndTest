import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
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

// Serve client build if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth",         authRoutes);
app.use("/api/results",      resultRoutes);
app.use("/api/profile",      profileRoutes);
app.use("/api/friends",      friendsRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/lessons",      lessonRoutes);

// API root message
app.get("/api", (req, res) => res.send("Typing Platform API Running"));

// SPA fallback: serve index.html for any non-API route (client-side routing)
app.get("*(/*)?", (req, res, next) => {
	if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export default app;
