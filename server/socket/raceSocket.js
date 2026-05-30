import { Server } from "socket.io";
import generateText from "../utils/textGenerator.js";
import User from "../models/User.js";
import { calcElo, getRank } from "../utils/rankSystem.js";

const rooms = {};
let waitingPlayer = null;

const MAX_WPM        = 250;
const ROOM_TTL_MS    = 10 * 60 * 1000;
const ABANDON_MS     = 60_000;

/* ─────────────────────────────────────────
   SAFE SERIALISATION
   Strip everything Socket.IO can't handle:
   Sets, timers, circular refs, etc.
───────────────────────────────────────── */
function safeRoom(room) {
  return {
    id:         room.id,
    text:       room.text,
    difficulty: room.difficulty,
    started:    room.started,
    finished:   room.finished,
    startTime:  room.startTime,
    players:    room.players.map(safePlayer),
    spectators: room.spectators.map(s => ({ id: s.id, name: s.name })),
  };
}

function safePlayer(p) {
  return {
    id:            p.id,
    name:          p.name,
    progress:      p.progress,
    wpm:           p.wpm,
    finalWpm:      p.finalWpm,
    accuracy:      p.accuracy,
    finalAccuracy: p.finalAccuracy,
    inputLength:   p.inputLength,
    correctLength: p.correctLength,
    errorCount:    p.errorCount,
    finished:      p.finished,
    position:      p.position,
    endTime:       p.endTime,
  };
}

/* ─────────────────────────────────────────
   ELO
───────────────────────────────────────── */
async function updateElo(io, roomId) {
  const room = rooms[roomId];
  if (!room || room.players.length < 2) return;
  const [p1, p2] = room.players;

  try {
    const u1 = await User.findOne({ name: p1.name });
    const u2 = await User.findOne({ name: p2.name });

    const r1 = u1?.rating ?? 1200;
    const r2 = u2?.rating ?? 1200;

    let winner = p1, loser = p2;
    if (p2.progress > p1.progress) { winner = p2; loser = p1; }
    else if (
      p1.progress === p2.progress &&
      p2.endTime && p1.endTime &&
      p2.endTime < p1.endTime
    ) { winner = p2; loser = p1; }

    const winnerUser   = winner.id === p1.id ? u1 : u2;
    const loserUser    = loser.id  === p1.id ? u1 : u2;
    const winnerRating = winner.id === p1.id ? r1 : r2;
    const loserRating  = loser.id  === p1.id ? r1 : r2;

    const { winnerDelta, loserDelta } = calcElo(winnerRating, loserRating);

    if (winnerUser) {
      winnerUser.rating  = Math.max(100, winnerRating + winnerDelta);
      winnerUser.racesWon = (winnerUser.racesWon || 0) + 1;
      await winnerUser.save();
    }
    if (loserUser) {
      loserUser.rating = Math.max(100, loserRating + loserDelta);
      await loserUser.save();
    }

    const ws = io.sockets.sockets.get(winner.id);
    const ls = io.sockets.sockets.get(loser.id);
    if (ws) ws.emit("eloUpdate", {
      change: winnerDelta,
      newRating: winnerRating + winnerDelta,
      rank: getRank(winnerRating + winnerDelta),
    });
    if (ls) ls.emit("eloUpdate", {
      change: loserDelta,
      newRating: loserRating + loserDelta,
      rank: getRank(loserRating + loserDelta),
    });
  } catch (err) {
    console.error("Elo update error:", err.message);
  }
}

/* ─────────────────────────────────────────
   SOCKET SERVER
───────────────────────────────────────── */
export default function raceSocket(server) {
  const io = new Server(server, { cors: { origin: "*" } });

  const userSocketMap = {};

  io.on("connection", (socket) => {
    console.log("Connected:", socket.id);

    /* ── Online presence ── */
    socket.on("setOnline", async ({ userId }) => {
      if (!userId) return;
      userSocketMap[socket.id] = userId;
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() }).catch(() => {});
    });

    /* ── CREATE ROOM ── */
    socket.on("createRoom", ({ difficulty = "medium" } = {}, cb) => {
      const roomId = genId();
      rooms[roomId] = makeRoom(roomId, difficulty);
      if (typeof cb === "function") cb(roomId);
    });

    /* ── QUICK MATCH ── */
    socket.on("quickMatch", ({ username, difficulty = "medium" }, cb) => {
      if (waitingPlayer && waitingPlayer.socketId !== socket.id) {
        const roomId = genId();
        rooms[roomId] = makeRoom(roomId, difficulty);
        const oppSocket = io.sockets.sockets.get(waitingPlayer.socketId);
        if (!oppSocket) {
          waitingPlayer = { socketId: socket.id, username, difficulty };
          cb(null);
          return;
        }
        joinPlayer(oppSocket, roomId, waitingPlayer.username);
        joinPlayer(socket,    roomId, username);
        io.to(roomId).emit("roomData", safeRoom(rooms[roomId]));
        oppSocket.emit("matched", roomId);
        cb(roomId);
        waitingPlayer = null;
        startCountdown(roomId);
      } else {
        waitingPlayer = { socketId: socket.id, username, difficulty };
        cb(null);
      }
    });

    /* ── JOIN ROOM ── */
    socket.on("joinRoom", ({ roomId, username, spectator }) => {
      const room = rooms[roomId];
      if (!room) { socket.emit("roomError", "Room not found."); return; }
      socket.join(roomId);

      if (spectator) {
        if (!room.spectators.find(s => s.id === socket.id))
          room.spectators.push({ id: socket.id, name: username });
      } else if (room.started) {
        if (!room.spectators.find(s => s.id === socket.id))
          room.spectators.push({ id: socket.id, name: username });
        socket.emit("forcedSpectator", true);
      } else {
        joinPlayer(socket, roomId, username);
      }

      io.to(roomId).emit("roomData", safeRoom(room));
      if (room.players.length >= 2 && !room.started) startCountdown(roomId);
    });

    /* ── CHAT ── */
    socket.on("chatMessage", ({ roomId, message, username }) => {
      if (!message?.trim() || message.length > 200) return;
      io.to(roomId).emit("chatMessage", {
        id:       Date.now(),
        username,
        message:  message.trim(),
        time:     new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    });

    socket.on("ggReaction", ({ roomId, username }) => {
      io.to(roomId).emit("ggReaction", { username });
    });

    /* ── LIVE PROGRESS ── */
    socket.on("progress", ({ roomId, progress, inputLength, correctLength, errorCount }) => {
      const room = rooms[roomId];
      if (!room || !room.started) return;
      const player = room.players.find(p => p.id === socket.id);
      if (!player || player.finished) return;
      if (progress - player.progress > 15) return;   // anti-cheat spike guard

      player.progress      = Math.min(progress, 100);
      player.inputLength   = inputLength   ?? 0;
      player.correctLength = correctLength ?? inputLength ?? 0;
      player.errorCount    = errorCount    ?? 0;

      const elapsedMin = (Date.now() - room.startTime) / 60000;
      player.wpm = elapsedMin > 0
        ? Math.max(0, Math.round(player.correctLength / 5 / elapsedMin))
        : 0;

      if (player.wpm > MAX_WPM) { socket.emit("cheatDetected"); return; }

      player.accuracy = player.inputLength > 0
        ? Math.round((player.correctLength / player.inputLength) * 100)
        : 100;

      /* emit only the lightweight player array, not the full room */
      io.to(roomId).emit("progressUpdate", room.players.map(safePlayer));

      if (progress >= 100 && !player.finished) {
        player.finished      = true;
        player.endTime       = Date.now();
        player.finalWpm      = player.wpm;
        player.finalAccuracy = player.accuracy;
        player.position      = room.players.filter(p => p.finished).length;
        if (!room._abandonTimer)
          room._abandonTimer = setTimeout(() => finishRace(roomId, true), ABANDON_MS);
        finishRace(roomId);
      }
    });

    /* ── REMATCH VOTE ── */
    socket.on("rematchVote", ({ roomId }) => {
      const room = rooms[roomId];
      if (!room) return;
      room._rematchVotes.add(socket.id);
      io.to(roomId).emit("rematchVotes", {
        votes: room._rematchVotes.size,
        total: room.players.length,
      });
      if (room._rematchVotes.size >= room.players.length) {
        resetRoom(room);
        io.to(roomId).emit("roomData", safeRoom(room));
        io.to(roomId).emit("rematchStarting");
        startCountdown(roomId);
      }
    });

    /* ── INVITE FRIEND ── */
    socket.on("inviteFriend", ({ roomId, toSocketId }) => {
      const toSocket = io.sockets.sockets.get(toSocketId);
      if (toSocket) toSocket.emit("friendInvite", { roomId, from: socket.id });
    });

    /* ── DISCONNECT ── */
    socket.on("disconnect", async () => {
      if (waitingPlayer?.socketId === socket.id) waitingPlayer = null;

      const userId = userSocketMap[socket.id];
      if (userId) {
        delete userSocketMap[socket.id];
        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() }).catch(() => {});
      }

      for (const roomId in rooms) {
        const room = rooms[roomId];
        const wasPlayer = room.players.some(p => p.id === socket.id);
        room.players    = room.players.filter(p => p.id !== socket.id);
        room.spectators = room.spectators.filter(s => s.id !== socket.id);
        if (wasPlayer) io.to(roomId).emit("playerLeft", socket.id);
        io.to(roomId).emit("roomData", safeRoom(room));
        if (room.players.length === 0 && room.spectators.length === 0) {
          clearRoomTimers(room);
          delete rooms[roomId];
        }
      }
    });

    /* ═══════════════════════════════════════
       HELPERS
    ═══════════════════════════════════════ */
    function genId() {
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    function makeRoom(roomId, difficulty = "medium") {
      return {
        id:               roomId,
        text:             generateText(45, difficulty),
        difficulty,
        players:          [],
        spectators:       [],
        started:          false,
        startTime:        null,
        finished:         false,
        _countdownActive: false,
        _rematchVotes:    new Set(),   // ← never emitted directly
        _abandonTimer:    null,        // ← never emitted directly
        _ttlTimer:        null,        // ← never emitted directly
      };
    }

    function joinPlayer(sock, roomId, username) {
      const room = rooms[roomId];
      sock.join(roomId);
      if (room.players.find(p => p.id === sock.id)) return;
      room.players.push({
        id:            sock.id,
        name:          username || "Player",
        progress:      0,
        wpm:           0,
        finalWpm:      0,
        accuracy:      100,
        finalAccuracy: 100,
        inputLength:   0,
        correctLength: 0,
        errorCount:    0,
        finished:      false,
        position:      null,
        endTime:       null,
      });
    }

    function startCountdown(roomId) {
      const room = rooms[roomId];
      if (!room || room.started || room._countdownActive) return;
      room._countdownActive = true;
      let count = 3;
      io.to(roomId).emit("countdown", count);
      count--;
      const interval = setInterval(() => {
        if (count >= 0) io.to(roomId).emit("countdown", count);
        if (count === 0) {
          clearInterval(interval);
          room._countdownActive = false;
          setTimeout(() => {
            room.started   = true;
            room.startTime = Date.now();
            io.to(roomId).emit("startRace", { text: room.text });
            room._ttlTimer = setTimeout(() => {
              if (rooms[roomId]) { clearRoomTimers(rooms[roomId]); delete rooms[roomId]; }
            }, ROOM_TTL_MS);
          }, 800);
        }
        count--;
      }, 1000);
    }

    function finishRace(roomId, forced = false) {
      const room = rooms[roomId];
      if (!room || !room.players.some(p => p.finished)) return;
      const allDone = forced || room.players.every(p => p.finished);
      const results = [...room.players]
        .sort((a, b) => {
          if (b.progress !== a.progress) return b.progress - a.progress;
          if (a.endTime && b.endTime)    return a.endTime - b.endTime;
          return b.wpm - a.wpm;
        })
        .map(safePlayer);   // ← safe plain objects
      io.to(roomId).emit("raceFinished", { results, allDone });
      if (allDone) {
        room.finished = true;
        clearTimeout(room._abandonTimer);
        room._abandonTimer = null;
        updateElo(io, roomId);
      }
    }

    function resetRoom(room) {
      clearRoomTimers(room);
      room.text             = generateText(45, room.difficulty || "medium");
      room.started          = false;
      room.startTime        = null;
      room.finished         = false;
      room._countdownActive = false;
      room._rematchVotes    = new Set();
      room.players.forEach(p => {
        p.progress = 0; p.wpm = 0; p.finalWpm = 0;
        p.accuracy = 100; p.finalAccuracy = 100;
        p.finished = false; p.endTime = null;
        p.inputLength = 0; p.correctLength = 0;
        p.errorCount = 0; p.position = null;
      });
    }

    function clearRoomTimers(room) {
      clearTimeout(room._abandonTimer);
      clearTimeout(room._ttlTimer);
      room._abandonTimer = null;
      room._ttlTimer     = null;
    }
  });
}
