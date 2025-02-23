// VoiceWave.jsx
import React from "react";
import "./VoiceWave.css";

function VoiceWave({ className = "" }) {
  return (
    <div className={`voice-wave ${className}`}>
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
    </div>
  );
}

export default VoiceWave;
