import { ENDPOINTS, REQUEST_CONFIG } from '../constants/endpoints';

// Helper function for handling API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'API request failed');
  }
  return response.json();
};

// Core interaction service
export const processInput = async (text, context = {}, onChunk = null) => {
  try {
    const response = await fetch(ENDPOINTS.PROCESS_INPUT, {
      ...REQUEST_CONFIG,
      method: 'POST',
      body: JSON.stringify({ text, context }),
      // Enable streaming
      headers: {
        ...REQUEST_CONFIG.headers,
        'Accept': 'text/event-stream',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!onChunk) {
      // If no streaming handler provided, fall back to regular JSON response
      return handleResponse(response);
    }

    // Handle streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(5));
            onChunk(data);
          } catch (e) {
            console.error('Error parsing SSE data:', e);
          }
        }
      }
    }

    // Process any remaining data in the buffer
    if (buffer) {
      try {
        const data = JSON.parse(buffer.replace(/^data: /, ''));
        onChunk(data);
      } catch (e) {
        console.error('Error parsing final SSE data:', e);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in processInput:', error);
    throw error;
  }
};

// Task management services
export const getTasks = async (urgency = null) => {
  const url = new URL(ENDPOINTS.GET_TASKS);
  if (urgency) url.searchParams.append('urgency', urgency);
  const response = await fetch(url, REQUEST_CONFIG);
  return handleResponse(response);
};

export const getTask = async (taskId) => {
  const response = await fetch(ENDPOINTS.GET_TASK(taskId), REQUEST_CONFIG);
  return handleResponse(response);
};

export const createTask = async (taskData) => {
  const response = await fetch(ENDPOINTS.CREATE_TASK, {
    ...REQUEST_CONFIG,
    method: 'POST',
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
};

export const updateTaskStatus = async (taskId, status, alertAt = null) => {
  const response = await fetch(ENDPOINTS.UPDATE_TASK_STATUS(taskId), {
    ...REQUEST_CONFIG,
    method: 'POST',
    body: JSON.stringify({ task_id: taskId, status, alert_at: alertAt })
  });
  return handleResponse(response);
};

export const updateTaskUrgency = async (taskId, urgency) => {
  const response = await fetch(ENDPOINTS.UPDATE_TASK_URGENCY(taskId), {
    ...REQUEST_CONFIG,
    method: 'POST',
    body: JSON.stringify({ task_id: taskId, urgency })
  });
  return handleResponse(response);
};

export const updateTaskNotes = async (taskId, notes) => {
  const response = await fetch(ENDPOINTS.UPDATE_TASK_NOTES(taskId), {
    ...REQUEST_CONFIG,
    method: 'POST',
    body: JSON.stringify({ task_id: taskId, notes })
  });
  return handleResponse(response);
};

export const updateTaskDescription = async (taskId, description) => {
  const response = await fetch(ENDPOINTS.UPDATE_TASK_DESCRIPTION(taskId), {
    ...REQUEST_CONFIG,
    method: 'PUT',
    body: JSON.stringify({ task_id: taskId, description })
  });
  return handleResponse(response);
};

// Profile management services
export const getProfile = async () => {
  const response = await fetch(ENDPOINTS.GET_PROFILE, REQUEST_CONFIG);
  return handleResponse(response);
};

export const updateProfile = async (profileInput) => {
  const response = await fetch(ENDPOINTS.UPDATE_PROFILE, {
    ...REQUEST_CONFIG,
    method: 'POST',
    body: JSON.stringify(profileInput)
  });
  return handleResponse(response);
};

export const getRawProfile = async () => {
  const response = await fetch(ENDPOINTS.GET_RAW_PROFILE, REQUEST_CONFIG);
  return handleResponse(response);
};

export const clearProfile = async () => {
  const response = await fetch(ENDPOINTS.CLEAR_PROFILE, {
    ...REQUEST_CONFIG,
    method: 'DELETE'
  });
  return handleResponse(response);
};

// System health check
export const checkHealth = async () => {
  const response = await fetch(ENDPOINTS.HEALTH_CHECK, REQUEST_CONFIG);
  return handleResponse(response);
}; 