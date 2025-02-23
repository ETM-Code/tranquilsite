import React, { useState, useEffect } from "react";
import { ENDPOINTS } from "../constants/endpoints"; // Adjust path if needed
import Preferences from "./Preferences";
import EmailPermissionModal from "./EmailPermissionModal";
import "./Dashboard.css";
import Chatbot from "./Chatbot";

const Dashboard = ({ user, priorities, onLogout }) => {
  const [prioritiesState, setPrioritiesState] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [taskCompletion, setTaskCompletion] = useState({});
  const [tasks, setTasks] = useState([]);
  const [unreadEmailCount, setUnreadEmailCount] = useState(0);

  // Fetch localStorage priorities, then show modal if found
  useEffect(() => {
    const savedPriorities = JSON.parse(localStorage.getItem("userPriorities"));
    if (savedPriorities) {
      setPrioritiesState(savedPriorities);
      setShowModal(true); // Show the email permission modal if priorities exist
    }
  }, []);

  // Example: Fetch tasks + unread email count from backend
  useEffect(() => {
    // 1) Fetch tasks
    fetch(ENDPOINTS.GET_TASKS)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch tasks: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched tasks:", data);
        // data could be an array of task objects, e.g.:
        // [{ id: 1, subject: "Project Update", snippet: "..."}]
        setTasks(data);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
        alert("Temporary error, the endpoint is not yet implemented");
      });

    // 2) Fetch unread email count
    fetch(ENDPOINTS.GET_UNREAD_EMAIL_COUNT)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch unread email count: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Fetched unread email count:", data);
        // Suppose data.count is the unread email count
        setUnreadEmailCount(data.count || 0);
      })
      .catch((error) => {
        console.error("Error fetching unread email count:", error);
      });
  }, []);

  // Handle user permission for email access
  const handlePermission = (isAllowed) => {
    if (isAllowed) {
      // POST to the ALLOW_EMAIL_ACCESS endpoint
      fetch(ENDPOINTS.ALLOW_EMAIL_ACCESS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id || "testuser1",
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
          console.log("Backend Response (email access):", data);
        })
        .catch((error) => console.error("Error:", error));

      setShowModal(false);
    }
  };

  // If user denies permission, close modal + log them out
  const handleCancelPermission = () => {
    setShowModal(false);
    onLogout();
  };

  // Toggle each task's completion (local only, or do a PATCH/POST to backend if needed)
  // ! The logic for this may need to be changed
  const handleTaskCheck = (taskId) => {
    const newValue = !taskCompletion[taskId];
    setTaskCompletion((prev) => ({ ...prev, [taskId]: newValue }));
  
    // Example PATCH request to mark the task as completed
    fetch(`${ENDPOINTS.GET_TASKS}/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: newValue }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to update task: ${res.status}`);
        return res.json();
      })
      .then((updatedTask) => {
        console.log("Updated task:", updatedTask);
      })
      .catch((error) => console.error(error));
  };


  return (
    <div className="dashboard-page">
      {/* Left column: Dashboard Card */}
      <div className="dashboard-card">
        <h2>Profile Overview</h2>

        {prioritiesState ? (
          <div>
            <p>
              <strong>Priorities:</strong>{" "}
              {prioritiesState.categories.join(", ")}
            </p>
          </div>
        ) : (
          <p>No priorities set yet.</p>
        )}

        <div className="email-summary">
          <p>
            <strong>Unread Emails:</strong> {unreadEmailCount}
          </p>
          <div className="important-emails">
            <h4>Tasks</h4>
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={!!taskCompletion[task.id]}
                      onChange={() => handleTaskCheck(task.id)}
                      className="task-checkbox"
                    />
                    <strong className="task-title">{task.subject}</strong>:{" "}
                    {task.snippet}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button onClick={onLogout} className="logout-button">
          Log Out
        </button>
      </div>

      {/* Right column: Preferences Card */}
      <div className="preferences-card">
        <Preferences onSave={setPrioritiesState} priorities={prioritiesState} />
      </div>

      {/* Email Permission Modal */}
      {showModal && (
        <EmailPermissionModal
          onPermission={handlePermission}
          onCancel={handleCancelPermission}
        />
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Dashboard;
