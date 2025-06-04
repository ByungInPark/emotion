import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8001/api";

const axiosInstance = axios.create({
  baseURL,                        // ← /api 까지만
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("▶ 토큰 자동부착:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("▶ interceptor - full config.headers:", config.headers);
  return config;
});

export default axiosInstance;