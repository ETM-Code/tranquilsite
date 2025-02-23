// Gmail service functions
import { ENDPOINTS } from '../constants/endpoints';

const makeRequest = async (endpoint, options = {}) => {
  const defaultOptions = {
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  };

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  const response = await fetch(endpoint, finalOptions);
  if (!response.ok) {
    const errorData = await response.text();
    console.error('Request failed:', {
      endpoint,
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Start Gmail authentication flow
export const startGmailAuth = async (userToken) => {
  try {
    console.log('Starting Gmail auth with token:', userToken);
    const data = await makeRequest(ENDPOINTS.GMAIL_AUTH, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        token: userToken
      })
    });
    
    if (!data.auth_url || !data.state) {
      throw new Error('Invalid response from Gmail auth endpoint');
    }
    
    localStorage.setItem('gmail_state', data.state);
    return data;
  } catch (error) {
    console.error('Error starting Gmail auth:', error);
    throw error;
  }
};

// Check Gmail connection status
export const checkGmailStatus = async (userToken) => {
  try {
    const data = await makeRequest(ENDPOINTS.GMAIL_STATUS, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    return data.is_authenticated;
  } catch (error) {
    console.error('Error checking Gmail status:', error);
    throw error;
  }
};

// Process Gmail messages
export const processGmailMessages = async (userToken) => {
  try {
    return await makeRequest(ENDPOINTS.GMAIL_PROCESS, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
  } catch (error) {
    console.error('Error processing Gmail messages:', error);
    throw error;
  }
};

// Handle Gmail OAuth callback
export const handleGmailCallback = async (code, state, userToken) => {
  try {
    const storedState = localStorage.getItem('gmail_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    
    return await makeRequest(ENDPOINTS.GMAIL_CALLBACK, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ code, state })
    });
  } catch (error) {
    console.error('Error handling Gmail callback:', error);
    throw error;
  }
};

// Revoke Gmail access
export const revokeGmailAccess = async (userToken) => {
  try {
    await makeRequest(ENDPOINTS.GMAIL_REVOKE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    return true;
  } catch (error) {
    console.error('Error revoking Gmail access:', error);
    throw error;
  }
}; 