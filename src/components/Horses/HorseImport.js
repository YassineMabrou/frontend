import axios from "axios";

// Function to upload the CSV file to the server
export const importCSV = async (file) => {
  const formData = new FormData();
  formData.append("file", file); // Add the CSV file to FormData

  try {
    // Use environment variable for the backend API
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API}/horses/add-csv`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error uploading CSV file:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to upload CSV file.");
  }
};
