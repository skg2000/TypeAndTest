import { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import RankedBadge from "../../components/RankedBadge/RankedBadge";
import "./FriendsPage.css";

function OnlineDot({ isOnline }) {
  return <span className={`online-indicator ${isOnline ? "is-online" : ""}`} title={isOnline ? "Online" : "Offline"} />;
}

export default function FriendsPage() {
  const { user } = useContext(AuthContext);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [friends, setFriends]           = useState([]);
  const [requests, setRequests]         = useState([]);
  const [filterText, setFilterText]     = useState("");
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState("friends");

  // Add-friend state
  const [addInput, setAddInput]         = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sentSet, setSentSet]           = useState(new Set()); // track outgoing requests this session
  const searchTimer                     = useRef(null);

  useEffect(() => { fetchFriends(); }, []);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/friends");
      setFriends(data.friends || []);
      setRequests(data.requests || []);
    } catch {
      addToast("Failed to load friends", "error");
    } finally {
      setLoading(false);
    }
  };

  // Live search as user types
  const handleAddInputChange = (e) => {
    const val = e.target.value;
    setAddInput(val);
    clearTimeout(searchTimer.current);
    if (val.trim().length < 2) { setSearchResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await api.get(`/friends/search?q=${encodeURIComponent(val.trim())}`);
        setSearchResults(data.users || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  };

  const sendRequest = async (targetUsername) => {
    const name = targetUsername || addInput.trim();
    if (!name) return;
    try {
      await api.post("/friends/request", { targetUsername: name });
      addToast(`Friend request sent to ${name} ✉️`, "success");
      setSentSet(prev => new Set([...prev, name.toLowerCase()]));
      if (!targetUsername) { setAddInput(""); setSearchResults([]); }
      else {
        // Update search results to reflect sent state
        setSearchResults(prev => prev.map(u =>
          u.name.toLowerCase() === name.toLowerCase() ? { ...u, _requestSent: true } : u
        ));
      }
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to send request", "error");
    }
  };

  const acceptRequest = async (fromUserId, name) => {
    try {
      await api.post("/friends/accept", { fromUserId });
      addToast(`${name} added as a friend! 🎉`, "success");
      fetchFriends();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to accept request", "error");
    }
  };

  const declineRequest = async (fromUserId) => {
    try {
      await api.post("/friends/decline", { fromUserId });
      addToast("Request declined", "info");
      fetchFriends();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to decline request", "error");
    }
  };

  const removeFriend = async (friendId, name) => {
    if (!confirm(`Remove ${name} from friends?`)) return;
    try {
      await api.post("/friends/remove", { friendId });
      addToast(`${name} removed`, "info");
      fetchFriends();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to remove friend", "error");
    }
  };

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="friends-page">
      <div className="friends-header">
        <h1>👥 Friends</h1>
        <p className="friends-sub">Race against friends, track their progress</p>
      </div>

      {/* ── Add friend panel ── */}
      <div className="add-friend-panel">
        <div className="add-friend-box">
          <input
            placeholder="Search by username to add a friend…"
            value={addInput}
            onChange={handleAddInputChange}
            onKeyDown={e => e.key === "Enter" && sendRequest()}
            autoComplete="off"
          />
          <button
            className="btn-add"
            onClick={() => sendRequest()}
            disabled={!addInput.trim()}
          >
            ➕ Add Friend
          </button>
        </div>

        {/* Live search dropdown */}
        {(searchLoading || searchResults.length > 0) && (
          <div className="search-dropdown">
            {searchLoading && <div className="search-spinner-row">Searching…</div>}
            {!searchLoading && searchResults.map(u => {
              const alreadySent = u._requestSent || sentSet.has(u.name.toLowerCase());
              return (
                <div key={u._id} className="search-result-row">
                  <div className="sr-avatar">
                    {u.avatar ? <img src={u.avatar} alt={u.name} /> : <span>{u.name[0].toUpperCase()}</span>}
                  </div>
                  <div className="sr-info">
                    <span className="sr-name">{u.name}</span>
                    <span className="sr-wpm">⚡ {u.bestWpm || 0} WPM</span>
                  </div>
                  {u.isFriend ? (
                    <span className="sr-tag sr-tag-friend">Already friends</span>
                  ) : alreadySent ? (
                    <span className="sr-tag sr-tag-sent">Request sent ✓</span>
                  ) : (
                    <button className="sr-add-btn" onClick={() => sendRequest(u.name)}>Add</button>
                  )}
                </div>
              );
            })}
            {!searchLoading && searchResults.length === 0 && addInput.trim().length >= 2 && (
              <div className="search-spinner-row">No users found</div>
            )}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="friends-tabs">
        <button className={tab === "friends" ? "active" : ""} onClick={() => setTab("friends")}>
          Friends ({friends.length})
        </button>
        <button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>
          Requests {requests.length > 0 && <span className="req-badge">{requests.length}</span>}
        </button>
      </div>

      {/* ── Friends tab: filter bar ── */}
      {tab === "friends" && friends.length > 0 && (
        <div className="friends-filter-bar">
          <input
            placeholder="Filter friends…"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="friends-loading">
          {[1,2,3].map(i => <div key={i} className="friend-skel" />)}
        </div>
      ) : tab === "friends" ? (
        filteredFriends.length === 0 ? (
          <div className="friends-empty">
            <div className="empty-icon">👥</div>
            <p>{filterText ? "No friends match your filter." : "No friends yet — search by username above to add someone!"}</p>
          </div>
        ) : (
          <div className="friends-list">
            {filteredFriends.map(f => (
              <div key={f._id} className="friend-card">
                <div className="friend-avatar">
                  {f.avatar
                    ? <img src={f.avatar} alt={f.name} />
                    : <span>{f.name[0].toUpperCase()}</span>
                  }
                  <OnlineDot isOnline={f.isOnline} />
                </div>
                <div className="friend-info">
                  <div className="friend-name">{f.name}</div>
                  <RankedBadge rating={f.rating || 1200} size="sm" />
                  <div className="friend-wpm">⚡ Best: {f.bestWpm || 0} WPM</div>
                </div>
                <div className="friend-actions">
                  <button className="btn-profile" onClick={() => navigate(`/profile/${f.name}`)}>
                    👤 Profile
                  </button>
                  <button className="btn-race" onClick={() => navigate(`/race`)}>
                    🏎️ Race
                  </button>
                  <button className="btn-remove" onClick={() => removeFriend(f._id, f.name)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        requests.length === 0 ? (
          <div className="friends-empty">
            <div className="empty-icon">📭</div>
            <p>No pending friend requests.</p>
          </div>
        ) : (
          <div className="friends-list">
            {requests.map(r => (
              <div key={r._id} className="friend-card request-card">
                <div className="friend-avatar">
                  {r.avatar ? <img src={r.avatar} alt={r.name} /> : <span>{r.name[0].toUpperCase()}</span>}
                </div>
                <div className="friend-info">
                  <div className="friend-name">{r.name}</div>
                  <div className="req-label">Wants to be friends</div>
                </div>
                <div className="friend-actions">
                  <button className="btn-accept" onClick={() => acceptRequest(r._id, r.name)}>✅ Accept</button>
                  <button className="btn-decline" onClick={() => declineRequest(r._id)}>✕ Decline</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
