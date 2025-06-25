// src/api/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "https://ktc-fullstack-production.up.railway.app",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("🚀 Axios Request:", config);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Axios Error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
