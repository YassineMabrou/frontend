import axios from "axios";

// Base API URL
const API_URL = `${process.env.BACKEND_API}`;

// Create Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
});

// Axios interceptor to include Authorization header if token is present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Utility function to handle API errors
const handleError = (error) => {
  console.error("API Error:", error); // Log error for debugging
  throw error.response?.data || { message: error.message || "An unknown error occurred" };
};

// Register a new user
export const register = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data; // Return response data
  } catch (error) {
    handleError(error);
  }
};

// Login a user
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    const { token } = response.data;
    // Store the token in localStorage
    if (token) {
      localStorage.setItem("token", token);
    }
    return response.data; // Return the response data
  } catch (error) {
    handleError(error);
  }
};

// Fetch admin-specific data
export const fetchAdminData = async () => {
  try {
    const response = await axiosInstance.get("/users/admin");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Fetch user-specific data
export const fetchUserData = async () => {
  try {
    const response = await axiosInstance.get("/users/user");
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem("token"); // Clear token from localStorage
};

// Dynamic data fetcher for different roles
export const fetchRoleData = async (role) => {
  try {
    const response = await axiosInstance.get(`/users/${role}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

const authService = {
  register,
  login,
  fetchAdminData,
  fetchUserData,
  fetchRoleData, // Added role-based data fetcher
  logout,
};

export default authService;
