// Gmail service functions
import { ENDPOINTS } from '../constants/endpoints';

// Start Gmail authentication flow
export const startGmailAuth = async (userToken) => {
  try {
    console.log('Starting Gmail auth with token:', userToken);
    const response = await fetch(ENDPOINTS.GMAIL_AUTH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        token: userToken
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gmail auth failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(`Failed to start Gmail authentication: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Gmail auth response:', data);
    
    if (!data.auth_url || !data.state) {
      throw new Error('Invalid response from Gmail auth endpoint');
    }
    
    // Store state for verification
    localStorage.setItem('gmail_state', data.state);
    
    return data;
  } catch (error) {
    console.error('Error starting Gmail auth:', error);
    throw error;
  }
};

// Handle Gmail OAuth callback
export const handleGmailCallback = async (code, state, userToken) => {
  try {
    // Verify state matches stored state
    const storedState = localStorage.getItem('gmail_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    
    const response = await fetch(ENDPOINTS.GMAIL_CALLBACK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({ code, state })
    });
    
    if (!response.ok) {
      throw new Error('Failed to complete Gmail authentication');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error handling Gmail callback:', error);
    throw error;
  }
};

// Check Gmail connection status
export const checkGmailStatus = async (userToken) => {
  try {
    const response = await fetch(ENDPOINTS.GMAIL_STATUS, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check Gmail status');
    }
    
    const data = await response.json();
    return data.is_authenticated;
  } catch (error) {
    console.error('Error checking Gmail status:', error);
    throw error;
  }
};

// Process Gmail messages
export const processGmailMessages = async (userToken) => {
  try {
    const response = await fetch(ENDPOINTS.GMAIL_PROCESS, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to process Gmail messages');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing Gmail messages:', error);
    throw error;
  }
};

// Revoke Gmail access
export const revokeGmailAccess = async (userToken) => {
  try {
    const response = await fetch(ENDPOINTS.GMAIL_REVOKE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to revoke Gmail access');
    }
    
    return true;
  } catch (error) {
    console.error('Error revoking Gmail access:', error);
    throw error;
  }
}; 