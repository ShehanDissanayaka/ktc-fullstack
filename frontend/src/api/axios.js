import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("🚀 Axios Request to:", config.url);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ Axios Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
