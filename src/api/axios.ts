import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9000";

const getStoredToken = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("lms-auth") || "{}");
    return auth?.state?.token ?? localStorage.getItem("lms_token");
  } catch {
    return localStorage.getItem("lms_token");
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("lms_token");
      localStorage.removeItem("lms_user");
      localStorage.removeItem("lms-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
