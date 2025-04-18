import axios from "axios";

const axiosInstance = axios.create({
  baseURL: `${process.env.BACKEND_API}/auth`, // Update this baseURL as needed
  withCredentials: true, // Optional: For sending cookies or auth headers
});

export default axiosInstance;
