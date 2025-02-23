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
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Import from LinkedIn</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label">
            LinkedIn Email
          </label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            className="form-input"
            placeholder="your.email@example.com"
            required
            disabled={status === 'loading'}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">
            LinkedIn Password
          </label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            className="form-input"
            placeholder="Enter your LinkedIn password"
            required
            disabled={status === 'loading'}
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200">
            LinkedIn profile imported successfully!
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-gray-500 max-w-sm">
            Note: We use these credentials only to fetch your profile data.
            They are not stored.
          </p>
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`btn btn-primary ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {status === 'loading' ? 'Importing...' : 'Import Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LinkedInImport; 