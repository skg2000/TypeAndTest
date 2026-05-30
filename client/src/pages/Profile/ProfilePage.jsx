import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getRank } from "../../utils/rankSystem";
import api from "../../api/api";
import "./ProfilePage.css";

const COUNTRIES = [
  { code: "", flag: "🌐", name: "World" },
  { code: "IN", flag: "🇮🇳", name: "India" },
  { code: "US", flag: "🇺🇸", name: "USA" },
  { code: "GB", flag: "🇬🇧", name: "UK" },
  { code: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "CA", flag: "🇨🇦", name: "Canada" },
  { code: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "FR", flag: "🇫🇷", name: "France" },
  { code: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "PH", flag: "🇵🇭", name: "Philippines" },
];

function countryFlag(code) {
  const c = COUNTRIES.find(c => c.code === code);
  return c ? c.flag : "🌐";
}

function ProfilePage() {
  const { username } = useParams();
  const { user: me, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const isOwn = me?.name === username;

  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [saving, setSaving] = useState(false);
  const [friendStatus, setFriendStatus] = useState("none"); // none | sent | friends
  const [activeTab, setActiveTab] = useState("overview");
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/profile/${username}`);
      setProfile(data.user);
      setResults(data.results);
      setAchievements(data.achievements);
      setEditBio(data.user.bio || "");
      setEditCountry(data.user.country || "");
      setAvatarPreview(data.user.avatar || "");
      // Check friend status
      if (me && !isOwn) {
        const meData = await api.get(`/profile/${me.name}`);
        const isFriend = meData.data.user.friends?.includes(data.user._id);
        setFriendStatus(isFriend ? "friends" : "none");
      }
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/profile/me/update", {
        bio: editBio,
        country: editCountry,
        avatar: avatarPreview,
      });
      setProfile(prev => ({ ...prev, ...data.user }));
      if (isOwn) {
        const updated = { ...me, bio: editBio, country: editCountry, avatar: avatarPreview };
        login({ user: updated, token: localStorage.getItem("token") });
      }
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const sendFriendRequest = async () => {
    await api.post("/friends/request", { targetUsername: username });
    setFriendStatus("sent");
  };

  if (loading) return (
    <div className="profile-page">
      <div className="profile-skeleton">
        <div className="skel skel-avatar" />
        <div className="skel skel-name" />
        <div className="skel skel-bio" />
      </div>
    </div>
  );

  if (!profile) return null;

  const rank = getRank(profile.rating || 1200);
  const winRate = profile.totalRaces > 0 ? Math.round((profile.racesWon / profile.totalRaces) * 100) : 0;

  return (
    <div className="profile-page">
      {/* ── HERO BANNER ── */}
      <div className="profile-hero" style={{ "--rank-color": rank.color }}>
        <div className="profile-hero-inner">
          {/* Avatar */}
          <div className="avatar-section">
            <div className="profile-avatar-wrap">
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="profile-avatar-img" />
                : <div className="profile-avatar-placeholder">{profile.name?.[0]?.toUpperCase()}</div>
              }
              {isOwn && editing && (
                <label className="avatar-upload-btn">
                  📷
                  <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                </label>
              )}
            </div>
            <div className="rank-badge" style={{ background: rank.color }}>
              {rank.icon} {rank.name}
            </div>
          </div>

          {/* Info */}
          <div className="profile-info">
            <div className="profile-name-row">
              <h1>{profile.name}</h1>
              <span className="country-flag">{countryFlag(profile.country)}</span>
              {profile.isOnline && <span className="online-dot" title="Online" />}
            </div>

            {editing ? (
              <div className="edit-fields">
                <textarea
                  className="bio-input"
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Write a short bio…"
                  maxLength={200}
                  rows={2}
                />
                <select className="country-select" value={editCountry} onChange={e => setEditCountry(e.target.value)}>
                  {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSave} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <p className="profile-bio">{profile.bio || (isOwn ? "Add a bio…" : "No bio yet.")}</p>
                {isOwn && <button className="btn-edit" onClick={() => setEditing(true)}>✏️ Edit Profile</button>}
                {!isOwn && me && (
                  <button
                    className={`btn-friend ${friendStatus}`}
                    onClick={sendFriendRequest}
                    disabled={friendStatus !== "none"}
                  >
                    {friendStatus === "friends" ? "✅ Friends" : friendStatus === "sent" ? "⏳ Request Sent" : "➕ Add Friend"}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Rating */}
          <div className="profile-rating">
            <div className="rating-number">{profile.rating || 1200}</div>
            <div className="rating-label">Rating</div>
            <div className="streak-row">
              🔥 {profile.currentStreak || 0} day streak
            </div>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="profile-stats-grid">
        {[
          { label: "Best WPM", value: profile.bestWpm || 0, icon: "⚡" },
          { label: "Avg WPM", value: profile.avgWpm || 0, icon: "📊" },
          { label: "Accuracy", value: `${profile.avgAccuracy || 100}%`, icon: "🎯" },
          { label: "Total Tests", value: profile.totalTests || 0, icon: "📝" },
          { label: "Races", value: profile.totalRaces || 0, icon: "🏁" },
          { label: "Win Rate", value: `${winRate}%`, icon: "🏆" },
        ].map(s => (
          <div key={s.label} className="profile-stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── TABS ── */}
      <div className="profile-tabs">
        {["overview", "history", "achievements"].map(tab => (
          <button
            key={tab}
            className={`profile-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="profile-section">
          <h3>Achievements ({achievements.length})</h3>
          {achievements.length === 0
            ? <p className="empty-msg">No achievements yet. Keep typing!</p>
            : <div className="achievements-grid">
                {achievements.slice(0, 6).map(a => (
                  <div key={a._id} className="ach-card">
                    <div className="ach-icon">{a.title.match(/[\u{1F300}-\u{1FFFE}]/u)?.[0] || "🏅"}</div>
                    <div className="ach-title">{a.title}</div>
                    <div className="ach-desc">{a.description}</div>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* ── HISTORY ── */}
      {activeTab === "history" && (
        <div className="profile-section">
          <h3>Match History</h3>
          {results.length === 0
            ? <p className="empty-msg">No results yet.</p>
            : <div className="history-table">
                <div className="history-head">
                  <span>Date</span><span>WPM</span><span>Accuracy</span><span>Mode</span><span>Time</span>
                </div>
                {results.map(r => (
                  <div key={r._id} className="history-row">
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                    <span className="wpm-val">{r.wpm}</span>
                    <span>{r.accuracy}%</span>
                    <span className="mode-badge">{r.mode}</span>
                    <span>{r.time}s</span>
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* ── ACHIEVEMENTS ── */}
      {activeTab === "achievements" && (
        <div className="profile-section">
          <div className="achievements-grid">
            {achievements.map(a => (
              <div key={a._id} className="ach-card">
                <div className="ach-icon">{a.title.match(/[\u{1F300}-\u{1FFFE}]/u)?.[0] || "🏅"}</div>
                <div className="ach-title">{a.title}</div>
                <div className="ach-desc">{a.description}</div>
                <div className="ach-date">{new Date(a.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
