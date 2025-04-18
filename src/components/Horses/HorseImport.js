// HorseImport.js
import axios from "axios";

// Function to upload the CSV file to the server
export const importCSV = async (file) => {
  const formData = new FormData();
  formData.append("file", file); // Add the CSV file to FormData

  try {
    // Send the file to the backend using axios
    const response = await axios.post("http://localhost:7002/api/horses/add-csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Set the correct content type
      },
    });

    return response.data; // Return the response from the backend
  } catch (error) {
    // Log error details and throw a user-friendly message
    console.error("Error uploading CSV file:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to upload CSV file.");
  }
};
