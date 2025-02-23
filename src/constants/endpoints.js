// src/constants/endpoints.js

// Base URL configuration
const BASE_URL = "http://localhost:8000"; // Default to localhost, override with environment variable if needed

// Main API endpoints
export const ENDPOINTS = {
  // Core interaction endpoint
  PROCESS_INPUT: `${BASE_URL}/process`,

  // Task management endpoints
  GET_TASKS: `${BASE_URL}/tasks`,
  CREATE_TASK: `${BASE_URL}/tasks`,
  GET_TASK: (taskId) => `${BASE_URL}/tasks/${taskId}`,
  UPDATE_TASK_STATUS: (taskId) => `${BASE_URL}/tasks/${taskId}/status`,
  UPDATE_TASK_URGENCY: (taskId) => `${BASE_URL}/tasks/${taskId}/urgency`,
  UPDATE_TASK_NOTES: (taskId) => `${BASE_URL}/tasks/${taskId}/notes`,
  UPDATE_TASK_DESCRIPTION: (taskId) => `${BASE_URL}/tasks/${taskId}/description`,

  // Profile management endpoints
  GET_PROFILE: `${BASE_URL}/profile`,
  UPDATE_PROFILE: `${BASE_URL}/profile`,
  GET_RAW_PROFILE: `${BASE_URL}/profile/raw`,
  CLEAR_PROFILE: `${BASE_URL}/profile`,

  // Gmail integration endpoints
  GMAIL_AUTH: `${BASE_URL}/gmail/auth`,
  GMAIL_CALLBACK: `${BASE_URL}/gmail/callback`,
  GMAIL_STATUS: `${BASE_URL}/gmail/status`,
  GMAIL_PROCESS: `${BASE_URL}/gmail/process`,
  GMAIL_REVOKE: `${BASE_URL}/gmail/revoke`,

  // System endpoints
  HEALTH_CHECK: `${BASE_URL}/health`,

  // Make BASE_URL available for other modules
  BASE_URL
};

// HTTP request configurations
export const REQUEST_CONFIG = {
  headers: {
    'Content-Type': 'application/json'
  },
  timeoutMs: 30000 // 30 second timeout
};

// WebSocket configuration (if needed later)
export const WS_CONFIG = {
  url: `ws://${BASE_URL.split("//")[1]}/ws`,
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
