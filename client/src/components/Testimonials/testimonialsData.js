// Seed/fallback testimonials shown while live data loads
// or when the database has few entries yet.
// These use "id" (not "_id") so live DB docs always take precedence.
export const SEED_TESTIMONIALS = [
  {
    id: "seed-1",
    name: "Rahul Sharma",
    role: "Software Engineer",
    country: "IN",
    rating: 5,
    review: "Went from 45 WPM to 82 WPM in three weeks. The real-time race mode is insanely addictive — I can't stop competing.",
    avatar: "",
    color: "#8b5cf6",
  },
  {
    id: "seed-2",
    name: "Priya Verma",
    role: "College Student",
    country: "IN",
    rating: 5,
    review: "Improved from 38 WPM to 75 WPM in one month. The daily streak system kept me coming back every single day.",
    avatar: "",
    color: "#ec4899",
  },
  {
    id: "seed-3",
    name: "Arjun Mehta",
    role: "Competitive Programmer",
    country: "IN",
    rating: 5,
    review: "The code typing mode is a game changer. My productivity doubled after practising with real code snippets.",
    avatar: "",
    color: "#06b6d4",
  },
  {
    id: "seed-4",
    name: "Sophie Laurent",
    role: "UX Designer",
    country: "FR",
    rating: 5,
    review: "The UI feels genuinely premium — clean, responsive, beautiful. I keep recommending it to my whole team.",
    avatar: "",
    color: "#f59e0b",
  },
  {
    id: "seed-5",
    name: "James O'Brien",
    role: "Data Analyst",
    country: "GB",
    rating: 5,
    review: "The analytics dashboard is fantastic. Seeing my WPM chart go up week by week is incredibly motivating.",
    avatar: "",
    color: "#22c55e",
  },
  {
    id: "seed-6",
    name: "Yuki Tanaka",
    role: "CS Student",
    country: "JP",
    rating: 5,
    review: "Hit 100 WPM after two months — something I thought was impossible. The AI coach gave me perfect practice texts.",
    avatar: "",
    color: "#ef4444",
  },
];

export default SEED_TESTIMONIALS;
