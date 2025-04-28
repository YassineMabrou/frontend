import axios from "axios";

// Base API URL from .env
const API_URL = process.env.REACT_APP_BACKEND_API;

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Attach token if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global error handler
const handleError = (error) => {
  console.error("API Error:", error);
  throw error.response?.data || { message: error.message || "An unknown error occurred" };
};

// =========================
// AUTH METHODS
// =========================

// Register a user
export const register = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Register an admin
export const registerAdmin = async (adminData) => {
  try {
    const response = await axiosInstance.post("/auth/admin/register", adminData);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Login a user
export const userLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    const { token, user } = response.data;
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id);
    }
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Login an admin
export const adminLogin = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/admin/login", credentials);
    const { token, user } = response.data;
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user.id);
    }
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Fetch Admin Data
export const fetchAdminData = async () => {
  try {
    const response = await axiosInstance.get("/admin/data");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Fetch User Data
export const fetchUserData = async () => {
  try {
    const response = await axiosInstance.get("/users/data");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
};

// =========================
// EXPORT SERVICE
// =========================

const authService = {
  register,
  registerAdmin,
  userLogin,
  adminLogin,
  fetchAdminData,
  fetchUserData,
  logout,
};

export default authService;
