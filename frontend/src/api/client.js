import axios from "axios";
import { logout } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 90000, // free-tier servers can take ~1 minute to wake up
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says the session is invalid/expired, send the user to login once.
// (A wrong password on the login screen is NOT treated as an expired session.)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || "";
    const isAuthCall = /\/auth\/(login|signup|google)/.test(url);
    if (status === 401 && !isAuthCall && localStorage.getItem("token")) {
      logout();
    }
    return Promise.reject(err);
  }
);

export default api;