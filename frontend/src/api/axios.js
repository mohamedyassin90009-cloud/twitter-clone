import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api", // ✅ this uses Vite proxy
  withCredentials: true,
});

export default axiosInstance;
