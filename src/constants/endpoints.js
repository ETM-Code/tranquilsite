// src/constants/endpoints.js

// Base URL configuration
const isDevelopment = process.env.NODE_ENV === 'development';

// You can update this when running ngrok
const NGROK_URL = "https://d2b1-89-19-88-232.ngrok-free.app"; // Update this when you start ngrok
const LOCAL_URL = "http://localhost:8000";  // Make sure this matches your FastAPI port

// Choose the appropriate backend URL
const BACKEND_URL = isDevelopment 
  ? LOCAL_URL        // Local development
  : NGROK_URL;       // Using ngrok for GitHub Pages

// Main API endpoints
export const ENDPOINTS = {
  // Core interaction endpoint
  PROCESS_INPUT: `${BACKEND_URL}/process`,

  // Task management endpoints
  GET_TASKS: `${BACKEND_URL}/tasks`,
  CREATE_TASK: `${BACKEND_URL}/tasks`,
  GET_TASK: (taskId) => `${BACKEND_URL}/tasks/${taskId}`,
  UPDATE_TASK_STATUS: (taskId) => `${BACKEND_URL}/tasks/${taskId}/status`,
  UPDATE_TASK_URGENCY: (taskId) => `${BACKEND_URL}/tasks/${taskId}/urgency`,
  UPDATE_TASK_NOTES: (taskId) => `${BACKEND_URL}/tasks/${taskId}/notes`,
  UPDATE_TASK_DESCRIPTION: (taskId) => `${BACKEND_URL}/tasks/${taskId}/description`,

  // Profile management endpoints
  GET_PROFILE: `${BACKEND_URL}/profile`,
  UPDATE_PROFILE: `${BACKEND_URL}/profile`,
  GET_RAW_PROFILE: `${BACKEND_URL}/profile/raw`,
  CLEAR_PROFILE: `${BACKEND_URL}/profile`,

  // Gmail integration endpoints
  GMAIL_AUTH: `${BACKEND_URL}/gmail/auth`,
  GMAIL_CALLBACK: `${BACKEND_URL}/gmail/callback`,
  GMAIL_STATUS: `${BACKEND_URL}/gmail/status`,
  GMAIL_PROCESS: `${BACKEND_URL}/gmail/process`,
  GMAIL_REVOKE: `${BACKEND_URL}/gmail/revoke`,

  // System endpoints
  HEALTH_CHECK: `${BACKEND_URL}/health`,

  // Make BACKEND_URL available for other modules
  BACKEND_URL
};

// HTTP request configurations
export const REQUEST_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  mode: 'cors',
  timeoutMs: 30000 // 30 second timeout
};

// WebSocket configuration (if needed later)
export const WS_CONFIG = {
  url: isDevelopment 
    ? `ws://localhost:8000/ws`
    : `wss://${NGROK_URL.split("//")[1]}/ws`,
  reconnectIntervalMs: 3000
};

// Task urgency levels
export const URGENCY_LEVELS = {
  LOW: 1,
  MEDIUM_LOW: 2,
  MEDIUM: 3,
  MEDIUM_HIGH: 4,
  HIGH: 5
};

// Task status types
export const TASK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  HALF_COMPLETED: 'half-completed'
};
