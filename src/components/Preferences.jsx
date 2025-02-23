// Preferences.jsx
import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { ENDPOINTS } from "../constants/endpoints"; // adjust path as needed
import "./Preferences.css";

const Preferences = ({ onSave, priorities, userId }) => {
  const [categories, setCategories] = useState("");

  // 1) On mount, fetch user's preferences from backend
  useEffect(() => {
    // If you have a userId, pass it as a query param or in headers
    if (!userId) return;

    fetch(`${ENDPOINTS.GET_PREFERENCES}?userId=${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch preferences: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched preferences from backend:", data);
        // data might look like { categories: ["work", "family"] }
        if (data.categories) {
          setCategories(data.categories.join(", "));
        }
      })
      .catch((error) => {
        console.error("Error fetching preferences:", error);
      });
  }, [userId]);

  // 2) If the parent already has `priorities`, sync them to local state
  useEffect(() => {
    if (priorities && priorities.categories) {
      setCategories(priorities.categories.join(", "));
    }
  }, [priorities]);

  // 3) Handle "Save" (POST to backend, then call onSave for local state)
  const handleSubmit = (e) => {
    e.preventDefault();

    const newPriorities = {
      categories: categories.split(",").map((item) => item.trim()),
      userId: userId, // include userId if needed
    };

    console.log("Calling onSave with:", newPriorities);

    // A) POST to backend
    fetch(ENDPOINTS.SET_PREFERENCES, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPriorities),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to save preferences: ${res.status}`);
        }
        return res.json();
      })
      .then((savedData) => {
        console.log("Preferences saved on backend:", savedData);
        // B) Also call the parent function to update local state
        onSave(newPriorities);
      })
      .catch((error) => {
        console.error("Error saving preferences:", error);
        alert("Temporary error, the endpoint is not yet implemented");
      });
  };

  return (
    <div className="preferences-container">
      {/* Dynamically show "Set" or "Reset" based on localStorage or fetched data */}
      <h2>
        {localStorage.getItem("userPriorities")
          ? "Reset Your Priorities"
          : "Set Your Priorities"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="priority-input-box">
          <label className="priority-input-message">
            Input Your Top 3 Priorities Please (comma-separated):
          </label>
          <input
            className="priority-input"
            type="text"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="e.g., work, family"
          />
        </div>

        <br />
        <button type="submit" className="save-button">
          Save Preferences
        </button>
      </form>
    </div>
  );
};

Preferences.propTypes = {
  onSave: PropTypes.func.isRequired,
  priorities: PropTypes.shape({
    categories: PropTypes.arrayOf(PropTypes.string)
  }),
  userId: PropTypes.string
};

export default Preferences;