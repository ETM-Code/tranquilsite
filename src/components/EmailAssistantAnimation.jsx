import React, { useState, useEffect } from "react";
import "./EmailAssistantAnimation.css";

const EmailAssistantAnimation = () => {
  const [count, setCount] = useState(99);

  useEffect(() => {
    const totalDuration = 2000; // ms
    const totalSteps = 99;      // from 99 down to 0
    const stepDuration = totalDuration / totalSteps; // ~20ms per decrement

    let current = 99;
    const intervalId = setInterval(() => {
      current -= 1;
      setCount(current);

      if (current <= 0) {
        clearInterval(intervalId);
      }
    }, stepDuration);

    // Cleanup if component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="animation-container">
      <h3 className="assistant-title">AI Task Assistant</h3>
      {/* TranQuill: This is the title of the assistant */}

      <div className="icon-and-notif">
        {/* Conditionally render the bubble if count > 0 */}
        {count >= 0 && (
          <span className={`notification-count ${count === 0 ? "fade-out" : ""}`}>
        {count}
          </span>
        )}

        <img
          src="https://cdn-icons-png.flaticon.com/512/561/561127.png"
          alt="Email Icon"
          className="email-icon"
        />
      </div>
    </div>
  );
};

export default EmailAssistantAnimation;
