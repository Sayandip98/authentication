import api from "./axios";

export const authAPI = {
  register: (data) => {
    const isFormData = data instanceof FormData;

    return api.post("/auth/register", data, {
      headers: isFormData ? { "Content-Type": "multipart/form-data" } : {}
    })
  },

  login: (credentials) =>
    api.post("/auth/login", credentials),

  logout: () =>
    api.post("/auth/logout"),

  getCurrentUser: () =>
    api.get("/auth/current-user"),

  updateProfile: (data) => api.put("/auth/update-profile", data),

  updateAvatar: (data) => api.put("/auth/avatar", data, { headers: { "Content-Type": "multipart/form-data" } }),

  removeAvatar: () => api.delete("/auth/avatar"),

  changePassword: (data) => api.put("/auth/change-password", data),

  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),

  resetPassword: (token, newPassword) =>
    api.post(`/auth/reset-password/${token}`, { newPassword }),

  getGoogleAuthUrl: () => `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/google`,
}