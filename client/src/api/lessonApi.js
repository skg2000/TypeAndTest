import api from "./api";

export const fetchLessonProgress = () =>
  api.get("/lessons/progress").then(r => r.data);

export const submitLessonComplete = (payload) =>
  api.post("/lessons/complete", payload).then(r => r.data);
