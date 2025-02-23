import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Chat from './components/Chat';
import TaskList from './components/TaskList';
import ProfileModal from './components/ProfileModal';
import Login from './components/Login';
import GmailCallback from './components/GmailCallback';
import './App.css';
import './components/ButtonStyles.css';
import { UserCircleIcon, ArrowPathIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/solid';
import { startGmailAuth, checkGmailStatus } from './services/gmail';
import { auth } from './firebase';

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('tasks'); // 'tasks' or 'opportunities'
  const [connectedServices, setConnectedServices] = useState({
    gmail: false,
    outlook: false,
    calendar: false
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        navigate('/');
        // Check for connected services
        const services = localStorage.getItem('connectedServices');
        if (services) {
          setConnectedServices(JSON.parse(services));
        }
        
        // Check Gmail connection status
        checkGmailStatus(user.accessToken)
          .then(isConnected => {
            setConnectedServices(prev => ({
              ...prev,
              gmail: isConnected
            }));
            localStorage.setItem('connectedServices', JSON.stringify({
              ...JSON.parse(services || '{}'),
              gmail: isConnected
            }));
          })
          .catch(err => {
            console.error('Error checking Gmail status:', err);
            setError('Failed to check Gmail connection status');
          });
      } else {
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
        setConnectedServices({
          gmail: false,
          outlook: false,
          calendar: false
        });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log("User logged out");
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('connectedServices');
        navigate('/login');
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  };

  const handleServiceConnect = async (service) => {
    setError(null);
    
    if (!user) {
      setError('User authentication required');
      return;
    }

    if (service === 'gmail') {
      try {
        if (connectedServices.gmail) {
          // If already connected, disconnect
          const newServices = {
            ...connectedServices,
            gmail: false
          };
          setConnectedServices(newServices);
          localStorage.setItem('connectedServices', JSON.stringify(newServices));
        } else {
          // Get the access token
          const token = user.accessToken;
          // Start Gmail authentication
          const { auth_url } = await startGmailAuth(token);
          // Open in a new window
          window.open(auth_url, '_blank', 'width=600,height=800');
        }
      } catch (err) {
        console.error('Error connecting to Gmail:', err);
        setError('Failed to connect to Gmail');
      }
    }
    // Close the menu after selection
    setIsServicesMenuOpen(false);
  };

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <Login onLogin={(user) => {
          setUser(user);
          setIsAuthenticated(true);
        }} />
      } />
      <Route path="/gmail/callback" element={<GmailCallback />} />
      <Route path="/" element={
        !isAuthenticated ? <Navigate to="/login" /> : (
          <AppProvider>
            <div className="App">
              <header className="container">
                <div className="flex justify-between items-center">
                  <h1>Tranquil</h1>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="profile-button"
                    >
                      <UserCircleIcon className="button-icon" aria-hidden="true" />
                      <span className="button-text">Profile</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="logout-button"
                    >
                      <ArrowRightOnRectangleIcon className="button-icon" aria-hidden="true" />
                      <span className="button-text">Logout</span>
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                      <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <title>Close</title>
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                      </svg>
                    </span>
                  </div>
                )}
              </header>

              <main>
                <div className="min-h-screen bg-gray-100">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Task List Section */}
                    <div className="lg:w-1/3">
                      <div className="bg-white shadow rounded-lg h-[calc(100vh-12rem)] overflow-y-auto">
                        <div className="card">
                          <div className="card-header">
                            <div className="card-header-content">
                              <h2>Tasks & Opportunities</h2>
                            </div>
                            <div style={{ position: 'relative' }}>
                              <button
                                className="connect-button"
                                onClick={() => setIsServicesMenuOpen(!isServicesMenuOpen)}
                              >
                                <ArrowPathIcon className="button-icon" aria-hidden="true" />
                                <span className="button-text">Connect Services</span>
                              </button>
                              {isServicesMenuOpen && (
                                <div className="services-menu">
                                  <button
                                    className={`services-menu-item ${connectedServices.gmail ? 'connected' : ''}`}
                                    onClick={() => handleServiceConnect('gmail')}
                                  >
                                    Gmail
                                  </button>
                                  <button
                                    className="services-menu-item"
                                    onClick={() => handleServiceConnect('outlook')}
                                  >
                                    Outlook (Coming Soon)
                                  </button>
                                  <button
                                    className="services-menu-item"
                                    onClick={() => handleServiceConnect('calendar')}
                                  >
                                    Google Calendar (Coming Soon)
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="toggle-switch-container">
                            <div className="toggle-switch" onClick={() => setViewMode(viewMode === 'tasks' ? 'opportunities' : 'tasks')}>
                              <div className={`toggle-option ${viewMode === 'tasks' ? 'active' : ''}`}>
                                Tasks
                              </div>
                              <div className={`toggle-option ${viewMode === 'opportunities' ? 'active' : ''}`}>
                                Opportunities
                              </div>
                              <div className={`toggle-slider ${viewMode === 'opportunities' ? 'opportunities' : ''}`} />
                            </div>
                          </div>
                          <div className="card-content">
                            <TaskList viewMode={viewMode} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chat Section */}
                    <div className="lg:w-2/3">
                      <div className="bg-white shadow rounded-lg h-[calc(100vh-12rem)]">
                        <Chat />
                      </div>
                    </div>
                  </div>
                </div>
              </main>

              {/* Profile Modal */}
              <ProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
              />
            </div>
          </AppProvider>
        )
      } />
    </Routes>
  );
}

export default App;
