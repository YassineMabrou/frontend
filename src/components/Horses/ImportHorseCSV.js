import React, { useState, useRef } from "react";
import { importCSV } from "./HorseImport"; // Import the importCSV function

const ImportHorseCSV = () => {
  const [message, setMessage] = useState(""); // State for displaying success/error messages
  const fileInputRef = useRef(null); // Ref to access the file input element

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    if (file) {
      try {
        const result = await importCSV(file); // Call the importCSV function
        setMessage(result.message || "CSV uploaded successfully!"); // Display success message
      } catch (error) {
        setMessage(error.message || "Failed to upload CSV."); // Display error message
        console.error("Error:", error);
      }
    } else {
      setMessage("No file selected."); // Handle case where no file is selected
    }
  };

  // Trigger file input click programmatically
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Trigger the file input automatically when component is loaded
  React.useEffect(() => {
    triggerFileInput();
  }, []);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept=".csv"
        onChange={handleCSVUpload} // Handle file upload
      />
      {message && (
        <p style={{ color: message.includes("Error") ? "red" : "green", fontWeight: "bold" }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ImportHorseCSV;
