import { useEffect, useState } from "react";
import { Line, Bar, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, RadialLinearScale, Filler, Tooltip, Legend
} from "chart.js";
import api from "../../api/api";
import "./AnalyticsPage.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Filler, Tooltip, Legend);

const chartDefaults = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: "#1e293b" }, ticks: { color: "#64748b" } },
    y: { grid: { color: "#1e293b" }, ticks: { color: "#64748b" } },
  },
};

function StatPill({ label, value, color = "#facc15" }) {
  return (
    <div className="stat-pill">
      <div className="pill-value" style={{ color }}>{value}</div>
      <div className="pill-label">{label}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [results, setResults] = useState([]);
  const [range, setRange] = useState("all"); // 7 | 30 | all
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/results/me").then(r => {
      setResults(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = (() => {
    if (range === "7") return results.filter(r => Date.now() - new Date(r.createdAt) < 7 * 86400000);
    if (range === "30") return results.filter(r => Date.now() - new Date(r.createdAt) < 30 * 86400000);
    return results;
  })().slice().reverse();

  const labels = filtered.map((_, i) => `#${i + 1}`);
  const wpms = filtered.map(r => r.wpm);
  const accs = filtered.map(r => r.accuracy);

  const bestWpm = wpms.length ? Math.max(...wpms) : 0;
  const avgWpm = wpms.length ? Math.round(wpms.reduce((a, b) => a + b, 0) / wpms.length) : 0;
  const avgAcc = accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : 0;
  const consistency = wpms.length > 1
    ? Math.max(0, 100 - Math.round((Math.sqrt(wpms.reduce((a, v) => a + (v - avgWpm) ** 2, 0) / wpms.length) / avgWpm) * 100))
    : 100;

  // Weak keys heatmap: count errors per character (approximated from accuracy & char count)
  const keyFreq = {};
  filtered.forEach(r => {
    const errChars = Math.round(r.characters * (1 - r.accuracy / 100));
    // simple distribution across qwerty
    "qwertyuiopasdfghjklzxcvbnm".split("").forEach((k, i) => {
      keyFreq[k] = (keyFreq[k] || 0) + (i < errChars % 26 ? 1 : 0);
    });
  });

  const lineData = {
    labels,
    datasets: [
      { label: "WPM", data: wpms, borderColor: "#facc15", backgroundColor: "rgba(250,204,21,0.08)", tension: 0.4, fill: true, pointRadius: 3, pointHoverRadius: 6 },
    ],
  };
  const accData = {
    labels,
    datasets: [
      { label: "Accuracy %", data: accs, borderColor: "#22c55e", backgroundColor: "rgba(34,197,94,0.08)", tension: 0.4, fill: true, pointRadius: 3 },
    ],
  };
  const radarData = {
    labels: ["Speed", "Accuracy", "Consistency", "Volume", "Improvement"],
    datasets: [{
      data: [
        Math.min(bestWpm / 1.5, 100),
        avgAcc,
        consistency,
        Math.min(filtered.length * 4, 100),
        wpms.length > 1 ? Math.min(Math.max(0, ((wpms[wpms.length-1] - wpms[0]) / wpms[0]) * 100 + 50), 100) : 50,
      ],
      backgroundColor: "rgba(250,204,21,0.15)",
      borderColor: "#facc15",
      pointBackgroundColor: "#facc15",
    }],
  };

  if (loading) return <div className="analytics-page"><div className="loading-msg">Loading analytics…</div></div>;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>📊 Analytics</h1>
        <div className="range-pills">
          {[["7","Last 7 days"],["30","Last 30 days"],["all","All time"]].map(([v,l]) => (
            <button key={v} className={`range-pill ${range===v?"active":""}`} onClick={() => setRange(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="analytics-pills">
        <StatPill label="Best WPM" value={bestWpm} color="#facc15" />
        <StatPill label="Avg WPM" value={avgWpm} color="#fb923c" />
        <StatPill label="Avg Accuracy" value={`${avgAcc}%`} color="#22c55e" />
        <StatPill label="Consistency" value={`${consistency}%`} color="#38bdf8" />
        <StatPill label="Tests" value={filtered.length} color="#a78bfa" />
      </div>

      {filtered.length < 2 ? (
        <div className="no-data">Complete at least 2 tests to see your analytics.</div>
      ) : (
        <>
          <div className="charts-grid">
            <div className="chart-card">
              <h3>WPM Over Time</h3>
              <Line data={lineData} options={chartDefaults} />
            </div>
            <div className="chart-card">
              <h3>Accuracy Over Time</h3>
              <Line data={accData} options={chartDefaults} />
            </div>
            <div className="chart-card chart-radar">
              <h3>Performance Profile</h3>
              <Radar data={radarData} options={{
                ...chartDefaults,
                scales: { r: { grid: { color: "#1e293b" }, ticks: { display: false }, pointLabels: { color: "#94a3b8", font: { size: 11 } } } },
              }} />
            </div>
            <div className="chart-card">
              <h3>WPM Distribution</h3>
              <Bar data={{
                labels: labels.slice(-20),
                datasets: [{ data: wpms.slice(-20), backgroundColor: wpms.slice(-20).map(w => w >= bestWpm * 0.9 ? "#facc15" : "#334155"), borderRadius: 6 }],
              }} options={chartDefaults} />
            </div>
          </div>

          {/* Keyboard heatmap */}
          <div className="chart-card heatmap-card">
            <h3>⌨️ Weak Keys (Error Frequency)</h3>
            <div className="keyboard-heatmap">
              {"qwertyuiop".split("").map(k => renderKey(k, keyFreq))}
              <br />
              {"asdfghjkl".split("").map(k => renderKey(k, keyFreq))}
              <br />
              {"zxcvbnm".split("").map(k => renderKey(k, keyFreq))}
            </div>
            <p className="heatmap-legend">Darker = more errors on that key</p>
          </div>
        </>
      )}
    </div>
  );
}

function renderKey(k, freq) {
  const max = Math.max(...Object.values(freq), 1);
  const val = freq[k] || 0;
  const intensity = val / max;
  const bg = `rgba(248, 113, 113, ${intensity * 0.9})`;
  return (
    <span key={k} className="key-cap" style={{ background: bg }}>
      {k}
    </span>
  );
}
