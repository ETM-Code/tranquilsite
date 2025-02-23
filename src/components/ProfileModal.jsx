import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useApp } from '../context/AppContext';
import LinkedInImport from './LinkedInImport';
import './ProfileModal.css';

const ACCEPTED_FILE_TYPES = {
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-powerpoint': '.ppt',
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png'
};

const ProfileModal = ({ isOpen, onClose }) => {
  const {
    profile,
    updateUserProfile,
    clearUserProfile,
    isLoading,
    error
  } = useApp();

  const [profileInput, setProfileInput] = useState('');
  const [viewMode, setViewMode] = useState('view'); // 'view', 'edit', 'raw'
  const [rawProfile, setRawProfile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen && viewMode === 'raw') {
      fetchRawProfile();
    }
  }, [isOpen, viewMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchRawProfile = async () => {
    try {
      const response = await fetch('/profile/raw');
      const data = await response.json();
      setRawProfile(data);
    } catch (err) {
      console.error('Error fetching raw profile:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        text: profileInput,
        is_direct_input: true
      });
      setProfileInput('');
      setViewMode('view');
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleClearProfile = async () => {
    if (window.confirm("Are you sure you want to clear your profile? This cannot be undone.")) {
      try {
        await clearUserProfile();
        setViewMode('view');
      } catch (err) {
        console.error('Error clearing profile:', err);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    try {
      setUploadStatus(prev => ({
        ...prev,
        [file.name]: { status: 'uploading', progress: 0 }
      }));

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/profile/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type here, let the browser set it with the boundary
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadStatus(prev => ({
            ...prev,
            [file.name]: { status: 'uploading', progress }
          }));
        }
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Update profile with extracted text
      await updateUserProfile({
        text: data.extractedText,
        is_direct_input: true,
        source: file.name
      });

      setUploadStatus(prev => ({
        ...prev,
        [file.name]: { status: 'completed', progress: 100 }
      }));

      // Clear status after a delay
      setTimeout(() => {
        setUploadStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[file.name];
          return newStatus;
        });
      }, 3000);

    } catch (err) {
      console.error('Error processing file:', err);
      setUploadStatus(prev => ({
        ...prev,
        [file.name]: { status: 'error', error: err.message }
      }));
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const { files } = e.dataTransfer;
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const { files } = e.target;
    handleFiles(files);
    // Reset file input
    e.target.value = '';
  };

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
        processFile(file);
      } else {
        setUploadStatus(prev => ({
          ...prev,
          [file.name]: { 
            status: 'error', 
            error: 'Unsupported file type' 
          }
        }));
      }
    });
  };

  const renderUploadStatus = () => {
    return Object.entries(uploadStatus).map(([fileName, status]) => (
      <div
        key={fileName}
        className={`flex items-center justify-between p-2 mb-2 rounded ${
          status.status === 'error' ? 'bg-red-100' :
          status.status === 'completed' ? 'bg-green-100' :
          'bg-blue-100'
        }`}
      >
        <div className="flex items-center">
          <span className="font-medium">{fileName}</span>
          {status.status === 'uploading' && (
            <div className="ml-4 w-24 bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          )}
        </div>
        <div>
          {status.status === 'error' && (
            <span className="text-red-600">{status.error}</span>
          )}
          {status.status === 'completed' && (
            <span className="text-green-600">✓</span>
          )}
        </div>
      </div>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div ref={modalRef} className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('view')}
              className={`mode-button ${viewMode === 'view' ? 'active' : ''}`}
            >
              View
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`mode-button ${viewMode === 'edit' ? 'active' : ''}`}
            >
              Edit
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`mode-button ${viewMode === 'raw' ? 'active' : ''}`}
            >
              History
            </button>
            <button
              onClick={onClose}
              className="close-button ml-4"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-body">
          {viewMode === 'view' && (
            <div className="space-y-4">
              {profile && Object.entries(profile)
                .filter(([key]) => key !== '_meta')
                .map(([category, data]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold capitalize mb-2">
                      {category.replace(/_/g, ' ')}
                    </h3>
                    <div className="text-gray-700">
                      {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
                    </div>
                  </div>
                ))}
              {(!profile || Object.keys(profile).length <= 1) && (
                <div className="text-gray-500 text-center py-8">
                  No profile information yet. Click &apos;Edit&apos; to add some!
                </div>
              )}
            </div>
          )}

          {viewMode === 'edit' && (
            <div className="space-y-6">
              {/* LinkedIn Import */}
              <LinkedInImport />

              {/* File Upload Area */}
              <div className="relative">
                <div className="divider">
                  <span>or</span>
                </div>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    accept={Object.values(ACCEPTED_FILE_TYPES).join(',')}
                    className="hidden"
                  />
                  <p className="upload-area-text">
                    Drag and drop files here, or click to select files
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-primary"
                  >
                    Select Files
                  </button>
                  <p className="file-types-text">
                    Supported formats: PDF, TXT, DOC(X), PPT(X), JPG, PNG
                  </p>
                </div>
              </div>

              {/* Upload Status */}
              <div className="upload-status">
                {Object.entries(uploadStatus).map(([fileName, status]) => (
                  <div
                    key={fileName}
                    className={`status-item ${
                      status.status === 'error' ? 'error' :
                      status.status === 'completed' ? 'success' :
                      'uploading'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="status-text">{fileName}</span>
                      {status.status === 'uploading' && (
                        <div className="progress-bar">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${status.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      {status.status === 'error' && (
                        <span className="status-error">{status.error}</span>
                      )}
                      {status.status === 'completed' && (
                        <span className="status-success">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Manual Input Form */}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    Or enter information manually
                  </label>
                  <textarea
                    value={profileInput}
                    onChange={(e) => setProfileInput(e.target.value)}
                    placeholder="Tell me about your background, experience, interests, goals, or anything else relevant..."
                    className="form-textarea"
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <div className="error-message">
                    Error: {error}
                  </div>
                )}
                <div className="button-group">
                  <button
                    type="button"
                    onClick={handleClearProfile}
                    className="btn btn-danger"
                    disabled={isLoading}
                  >
                    Clear Profile
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading || !profileInput.trim()}
                  >
                    Update Profile
                  </button>
                </div>
              </form>
            </div>
          )}

          {viewMode === 'raw' && (
            <div className="space-y-4">
              {rawProfile ? (
                <>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(rawProfile.created_at).toLocaleString()}
                    <br />
                    Last Updated: {new Date(rawProfile.updated_at).toLocaleString()}
                  </div>
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                    {rawProfile.raw_input}
                  </pre>
                </>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  No profile history available.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ProfileModal; 