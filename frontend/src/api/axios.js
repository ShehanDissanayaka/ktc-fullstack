// src/api/axios.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000", // Base API URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (Optional: For logging or adding tokens)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("🚀 Axios Request:", config);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (Optional: For global error handling)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Axios Error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
