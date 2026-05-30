export const RANKS = [
  { name: "Bronze",   min: 0,    max: 1099, color: "#cd7f32", icon: "🥉" },
  { name: "Silver",   min: 1100, max: 1299, color: "#94a3b8", icon: "🥈" },
  { name: "Gold",     min: 1300, max: 1499, color: "#facc15", icon: "🥇" },
  { name: "Platinum", min: 1500, max: 1799, color: "#38bdf8", icon: "💠" },
  { name: "Diamond",  min: 1800, max: 2099, color: "#818cf8", icon: "💎" },
  { name: "Master",   min: 2100, max: Infinity, color: "#f43f5e", icon: "👑" },
];

export function getRank(rating) {
  return RANKS.find(r => rating >= r.min && rating <= r.max) || RANKS[0];
}

export function calcElo(winnerRating, loserRating, K = 32) {
  const expected = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const delta = Math.round(K * (1 - expected));
  return { winnerDelta: delta, loserDelta: -Math.round(K * expected) };
}
