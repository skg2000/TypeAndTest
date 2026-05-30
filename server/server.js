import http from "http";

import app from "./app.js";

import typingRoutes from "./routes/typingRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";

import raceSocket from "./socket/raceSocket.js";

/* =========================
   ROUTES
========================= */
app.use("/api/typing", typingRoutes);
app.use("/api/results", resultRoutes);

/* =========================
   CREATE HTTP SERVER
========================= */
const server = http.createServer(app);

/* =========================
   SOCKET INIT
========================= */
raceSocket(server);

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});