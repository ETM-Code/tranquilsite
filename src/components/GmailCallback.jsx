import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleGmailCallback } from '../services/gmail';
import { auth } from '../firebase';

const GmailCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get code and state from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        
        if (!code || !state) {
          throw new Error('Missing required parameters');
        }

        // Get current user and token
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('User not authenticated');
        }

        // Get the access token
        const token = currentUser.accessToken;

        // Handle the callback
        await handleGmailCallback(code, state, token);

        // Update connected services in localStorage
        const services = JSON.parse(localStorage.getItem('connectedServices') || '{}');
        services.gmail = true;
        localStorage.setItem('connectedServices', JSON.stringify(services));

        // Close the popup window and refresh the parent
        if (window.opener) {
          window.opener.location.reload();
          window.close();
        } else {
          // If not in popup, redirect back to main page
          navigate('/');
        }
      } catch (err) {
        console.error('Error handling Gmail callback:', err);
        setError(err.message || 'Failed to connect Gmail');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Connecting to Gmail</h2>
        <p className="text-gray-600">Please wait while we complete the connection...</p>
      </div>
    </div>
  );
};

export default GmailCallback; 