import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/results",
});

/* ✅ GLOBAL TOKEN ATTACH */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ✅ AUTO LOGOUT ON TOKEN EXPIRE */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      /* optional */
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/* =========================
   SAVE RESULT
========================= */
export const saveResult = async (resultData) => {
  const response = await API.post("/", resultData);

  return response.data;
};

/* =========================
   GET MY RESULTS
========================= */
export const getMyResults = async () => {
  const response = await API.get("/me");
  return response.data;
};

/* =========================
   GET MY DASHBOARD STATS
========================= */
export const getMyStats = async () => {
  const response = await API.get("/stats/me");
  return response.data;
};

/* =========================
   LEADERBOARD
========================= */
export const getLeaderboard = async () => {
  const response = await API.get("/leaderboard");
  return response.data;
};

/* =========================
   GET MY ACHIEVEMENTS
========================= */
export const getMyAchievements = async () => {
  const response = await API.get("/achievements");
  return response.data;
};