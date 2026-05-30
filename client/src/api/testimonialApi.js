import api from "./api";

export const fetchTestimonials  = ()        => api.get("/testimonials").then(r => r.data);
export const fetchMyTestimonial = ()        => api.get("/testimonials/mine").then(r => r.data);
export const submitTestimonial  = (payload) => api.post("/testimonials", payload).then(r => r.data);
export const deleteTestimonial  = ()        => api.delete("/testimonials/mine").then(r => r.data);
