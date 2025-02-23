import { useState } from 'react';
import { useApp } from '../context/AppContext';

const LinkedInImport = () => {
  const { updateUserProfile } = useApp();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      // Call the backend endpoint to handle LinkedIn scraping
      const response = await fetch('/profile/import/linkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Failed to import LinkedIn profile');
      }

      const data = await response.json();
      
      // Update the user profile with the imported data
      await updateUserProfile({
        text: data.profileData,
        is_direct_input: true,
        source: 'linkedin'
      });

      setStatus('success');
      setCredentials({ email: '', password: '' });
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Import from LinkedIn</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            LinkedIn Email
          </label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            required
            disabled={status === 'loading'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            LinkedIn Password
          </label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 border rounded-lg"
            required
            disabled={status === 'loading'}
          />
        </div>

        {error && (
          <div className="text-red-500 p-3 rounded bg-red-100">
            {error}
          </div>
        )}

        {status === 'success' && (
          <div className="text-green-500 p-3 rounded bg-green-100">
            LinkedIn profile imported successfully!
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Note: We use these credentials only to fetch your profile data.
            They are not stored.
          </p>
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`px-4 py-2 rounded-lg text-white
              ${status === 'loading' 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {status === 'loading' ? 'Importing...' : 'Import Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LinkedInImport; 