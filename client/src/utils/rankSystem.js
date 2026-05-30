export const RANKS = [
  { name: "Bronze",   min: 0,    max: 1099, color: "#cd7f32", icon: "🥉", bg: "rgba(205,127,50,0.15)" },
  { name: "Silver",   min: 1100, max: 1299, color: "#94a3b8", icon: "🥈", bg: "rgba(148,163,184,0.15)" },
  { name: "Gold",     min: 1300, max: 1499, color: "#facc15", icon: "🥇", bg: "rgba(250,204,21,0.15)" },
  { name: "Platinum", min: 1500, max: 1799, color: "#38bdf8", icon: "💠", bg: "rgba(56,189,248,0.15)" },
  { name: "Diamond",  min: 1800, max: 2099, color: "#818cf8", icon: "💎", bg: "rgba(129,140,248,0.15)" },
  { name: "Master",   min: 2100, max: Infinity, color: "#f43f5e", icon: "👑", bg: "rgba(244,63,94,0.15)" },
];

export function getRank(rating = 1200) {
  return RANKS.find(r => rating >= r.min && rating <= r.max) || RANKS[0];
}

export function getProgressToNextRank(rating = 1200) {
  const rank = getRank(rating);
  if (rank.max === Infinity) return 100;
  const range = rank.max - rank.min;
  const progress = rating - rank.min;
  return Math.round((progress / range) * 100);
}
