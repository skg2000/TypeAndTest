import { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import socket from "../../socket/socket";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import RaceLobby from "./components/RaceLobby";
import RaceTrack from "./components/RaceTrack";
import RaceResultsModal from "./components/RaceResultsModal";
import CountdownOverlay from "./components/CountdownOverlay";
import RaceChat from "../../components/Chat/RaceChat";

import "./RacePage.css";

function RacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [roomId, setRoomId] = useState(searchParams.get("room") || "");
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState([]);
  const [text, setText] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [results, setResults] = useState(null);
  const [raceStarted, setRaceStarted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [playerLeftMsg, setPlayerLeftMsg] = useState("");
  const [rematchVotes, setRematchVotes] = useState({ votes: 0, total: 0 });
  const [myVoted, setMyVoted] = useState(false);
  const [difficulty, setDifficulty] = useState("medium");
  const [eloChange, setEloChange] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  const { user } = useContext(AuthContext);
  const { addToast } = useToast();

  const username =
    user?.name || user?.username ||
    JSON.parse(localStorage.getItem("user") || "null")?.name ||
    localStorage.getItem("username") || "Player";

  // Online presence
  useEffect(() => {
    if (user?._id) socket.emit("setOnline", { userId: user._id });
  }, [user]);

  // Auto-join from URL param
  useEffect(() => {
    const urlRoom = searchParams.get("room");
    if (urlRoom && !joined) {
      setRoomId(urlRoom.toUpperCase());
      socket.emit("joinRoom", { roomId: urlRoom.toUpperCase(), username, spectator: false });
      setJoined(true);
      setSearchParams({});
    }
  }, []);

  useEffect(() => {
    socket.on("roomData", (room) => {
      setPlayers(room.players);
      if (room.id) setRoomId(room.id);
    });

    socket.on("countdown", (count) => {
      setCountdown(count);
      if (count > 0) {
        setResults(null);
        setRaceStarted(false);
        setRaceFinished(false);
        setEloChange(null);
      }
    });

    socket.on("startRace", ({ text }) => {
      setText(text);
      setRaceStarted(true);
      setRaceFinished(false);
      setResults(null);
      setMyVoted(false);
      setRematchVotes({ votes: 0, total: 0 });
      setTimeout(() => setCountdown(null), 900);
    });

    socket.on("progressUpdate", (updatedPlayers) => { setPlayers(updatedPlayers); });

    socket.on("raceFinished", ({ results }) => {
      setResults(results);
      setRaceFinished(true);
    });

    socket.on("eloUpdate", ({ change, rank }) => {
      setEloChange(change);
      addToast(
        `${change >= 0 ? "+" : ""}${change} Rating → ${rank?.name || ""}`,
        change >= 0 ? "elo" : "error"
      );
    });

    socket.on("matched", (id) => {
      setRoomId(id);
      setJoined(true);
      setWaitingForMatch(false);
      addToast("Opponent found! Race starting…", "race");
    });

    socket.on("forcedSpectator", () => {
      setIsSpectator(true);
      addToast("Race in progress — joined as spectator", "info");
    });

    socket.on("roomError", (msg) => {
      setRoomError(msg);
      setJoined(false);
      addToast(msg, "error");
    });

    socket.on("playerLeft", () => {
      setPlayerLeftMsg("An opponent left the race.");
      addToast("Opponent disconnected", "warning");
      setTimeout(() => setPlayerLeftMsg(""), 4000);
    });

    socket.on("rematchVotes", ({ votes, total }) => setRematchVotes({ votes, total }));

    socket.on("rematchStarting", () => {
      setRaceStarted(false);
      setRaceFinished(false);
      setResults(null);
      setText("");
      setMyVoted(false);
      setRematchVotes({ votes: 0, total: 0 });
      setEloChange(null);
      addToast("Rematch starting!", "race");
    });

    socket.on("cheatDetected", () => {
      addToast("Invalid progress detected", "warning");
    });

    return () => {
      ["roomData","countdown","startRace","progressUpdate","raceFinished",
       "eloUpdate","matched","forcedSpectator","roomError","playerLeft",
       "rematchVotes","rematchStarting","cheatDetected"].forEach(e => socket.off(e));
    };
  }, []);

  const createRoom = () => {
    setRoomError("");
    socket.emit("createRoom", { difficulty }, (id) => {
      setRoomId(id);
      socket.emit("joinRoom", { roomId: id, username, spectator: false });
      setJoined(true);
    });
  };

  const joinRoom = (id = roomId) => {
    if (!id.trim()) { setRoomError("Please enter a Room ID."); return; }
    const clean = id.trim().toUpperCase();
    socket.emit("joinRoom", { roomId: clean, username, spectator: false });
    setRoomId(clean);
    setJoined(true);
  };

  const joinAsSpectator = () => {
    if (!roomId.trim()) { setRoomError("Please enter a Room ID to spectate."); return; }
    const clean = roomId.trim().toUpperCase();
    socket.emit("joinRoom", { roomId: clean, username, spectator: true });
    setRoomId(clean);
    setJoined(true);
    setIsSpectator(true);
  };

  const quickMatch = () => {
    setWaitingForMatch(true);
    socket.emit("quickMatch", { username, difficulty }, (id) => {
      if (id) { setRoomId(id); setJoined(true); setWaitingForMatch(false); }
    });
  };

  const voteRematch = () => {
    if (myVoted) return;
    setMyVoted(true);
    socket.emit("rematchVote", { roomId });
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom", { roomId });
    setJoined(false); setRaceStarted(false); setRaceFinished(false);
    setResults(null); setCountdown(null); setText(""); setPlayers([]);
    setIsSpectator(false); setWaitingForMatch(false); setRoomId("");
    setRematchVotes({ votes: 0, total: 0 }); setMyVoted(false); setEloChange(null);
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/race?room=${roomId}`;
    navigator.clipboard.writeText(link).catch(() => {});
    addToast("Invite link copied!", "success");
  };

  return (
    <div className="race-page">
      {!joined ? (
        <RaceLobby
          roomId={roomId} setRoomId={setRoomId}
          createRoom={createRoom} joinRoom={joinRoom}
          quickMatch={quickMatch} joinAsSpectator={joinAsSpectator}
          waitingForMatch={waitingForMatch} roomError={roomError}
          difficulty={difficulty} setDifficulty={setDifficulty}
        />
      ) : (
        <>
          {playerLeftMsg && <div className="player-left-banner">{playerLeftMsg}</div>}
          {countdown !== null && <CountdownOverlay count={countdown} />}

          <RaceTrack
            text={text} roomId={roomId} players={players}
            raceStarted={raceStarted} raceFinished={raceFinished}
            isSpectator={isSpectator} currentUserId={socket.id}
            onLeave={leaveRoom} onCopyLink={copyShareLink}
          />

          {results && (
            <RaceResultsModal
              results={results} currentUserId={socket.id}
              onRematch={voteRematch} onLeave={leaveRoom}
              rematchVotes={rematchVotes} myVoted={myVoted}
              eloChange={eloChange}
            />
          )}

          <RaceChat
            roomId={roomId} username={username}
            isOpen={chatOpen} onToggle={() => setChatOpen(o => !o)}
          />
        </>
      )}
    </div>
  );
}

export default RacePage;
