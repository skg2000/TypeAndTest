import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/resultApi";
import { Link } from "react-router-dom";
import "./LeaderboardPage.css";

const COUNTRY_FLAGS = {
  IN:"🇮🇳",US:"🇺🇸",GB:"🇬🇧",DE:"🇩🇪",FR:"🇫🇷",JP:"🇯🇵",CN:"🇨🇳",BR:"🇧🇷",
  CA:"🇨🇦",AU:"🇦🇺",KR:"🇰🇷",RU:"🇷🇺",ES:"🇪🇸",IT:"🇮🇹",MX:"🇲🇽",PK:"🇵🇰",
  NG:"🇳🇬",SA:"🇸🇦",TR:"🇹🇷",ID:"🇮🇩",SG:"🇸🇬",MY:"🇲🇾",ZA:"🇿🇦",
};

const RANKS = [
  { min:0,    max:1099, name:"Bronze",  color:"#cd7f32", icon:"🥉" },
  { min:1100, max:1299, name:"Silver",  color:"#adb5bd", icon:"🥈" },
  { min:1300, max:1499, name:"Gold",    color:"#ffd700", icon:"🥇" },
  { min:1500, max:1799, name:"Platinum",color:"#e5e4e2", icon:"💎" },
  { min:1800, max:9999, name:"Diamond", color:"#b9f2ff", icon:"👑" },
];
const getRank = (r=1200) => RANKS.find(x=>r>=x.min&&r<=x.max)||RANKS[0];
const MEDAL   = ["🥇","🥈","🥉"];

function LeaderboardPage() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(setData).catch(console.error).finally(()=>setLoading(false));
  }, []);

  return (
    <div className="leaderboard-page">
      <div className="lb-page-header">
        <span className="eyebrow">Global Rankings</span>
        <h1>Leaderboard</h1>
        <p>Top typists ranked by their highest WPM.</p>
      </div>

      <div className="lb-table">
        <div className="lb-table-head">
          <span>#</span>
          <span>Player</span>
          <span style={{textAlign:"right"}}>WPM</span>
          <span style={{textAlign:"right"}}>Accuracy</span>
          <span style={{textAlign:"right"}}>ELO</span>
        </div>

        {loading
          ? Array.from({length:8}).map((_,i)=>(
              <div key={i} className="lb-skel-row">
                <div className="lb-sk sm"/>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div className="lb-sk circle"/>
                  <div style={{flex:1}}>
                    <div className="lb-sk md" style={{width:"60%",marginBottom:5}}/>
                    <div className="lb-sk sm" style={{width:"40%"}}/>
                  </div>
                </div>
                <div className="lb-sk md"/>
                <div className="lb-sk sm"/>
                <div className="lb-sk sm"/>
              </div>
            ))
          : data.length === 0
          ? <div className="lb-empty"><p>No results yet — be the first!</p></div>
          : data.map((entry, i) => {
              const rank = getRank(entry.user?.rating);
              const flag = COUNTRY_FLAGS[entry.user?.country] || "";
              return (
                <div key={entry._id} className={`lb-row${i<3?" lb-top3":""}`}>
                  <span className="lb-rank">
                    {i<3 ? <span className="lb-medal">{MEDAL[i]}</span>
                          : <span>{i+1}</span>}
                  </span>
                  <span className="lb-player">
                    <img
                      className="lb-avatar"
                      src={entry.user?.avatar
                        || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.user?.name}&backgroundColor=7c3aed`}
                      alt={entry.user?.name}
                    />
                    <span className="lb-player-info">
                      <Link to={`/profile/${entry.user?.name}`} className="lb-player-name">
                        {entry.user?.name}
                      </Link>
                      <span className="lb-player-meta">
                        {flag && <span>{flag}</span>}
                        <span style={{color: rank.color}}>{rank.icon} {rank.name}</span>
                      </span>
                    </span>
                  </span>
                  <span className="lb-wpm">{entry.wpm}</span>
                  <span className="lb-acc">{entry.accuracy}%</span>
                  <span className="lb-elo" style={{color: rank.color}}>{entry.user?.rating||1200}</span>
                </div>
              );
            })}
      </div>
    </div>
  );
}

export default LeaderboardPage;
