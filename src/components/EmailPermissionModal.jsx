// EmailPermissionModal.jsx
import React from "react";
import { ENDPOINTS } from "../constants/endpoints"; // adjust path as needed
import "./EmailPermissionModal.css";

const EmailPermissionModal = ({ userId, onPermissionGranted, onCancel }) => {
  // Handle the "Yes" button
  const handleYes = () => {
    // Example POST request to the backend
    fetch(ENDPOINTS.ALLOW_EMAIL_ACCESS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId || "testuser1",
        permission: true,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to allow email access: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Backend Response:", data);
        // Inform the parent that permission was granted
        // so the parent can close the modal or proceed
        onPermissionGranted && onPermissionGranted(true);
      })
      .catch((error) => {
        console.error("Error during allow-email-access:", error);
        alert("Temporary error, the endpoint is not yet implemented");
      });
  };

  // Handle the "No" button
  const handleNo = () => {
    // In your app, "go back to home" might be:
    // - a parent callback that logs out
    // - a React Router navigate("/"), etc.
    // Here we just call onCancel to let parent decide
    onCancel && onCancel();
  };

  return (
    <div className="modal">
      <h2 className="modal-message">
        Do you allow us, Hack Ireland Group 37, to access your emails?
      </h2>
      <div className="modal-buttons">
        {/* Send user permission to backend on "Yes" */}
        <button onClick={handleYes}>Yes</button>
        {/* Go back to the home page (or parent callback) on "No" */}
        <button onClick={handleNo}>No</button>
      </div>
    </div>
  );
};

export default EmailPermissionModal;