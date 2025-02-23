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
import ServiceConnections from './components/ServiceConnections';

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
      <Route path="/tranquilsite/gmail/callback" element={<GmailCallback />} />
      <Route path="/gmail/callback" element={<GmailCallback />} />
      <Route path="/" element={
        !isAuthenticated ? <Navigate to="/login" /> : (
          <AppProvider>
            <div className="App">
              <header className="app-header">
                <div className="header-content">
                  <h1>Tranquil</h1>
                  <div className="header-actions">
                    <button
                      onClick={() => setIsProfileOpen(true)}
                      className="header-button"
                    >
                      <UserCircleIcon className="button-icon" aria-hidden="true" />
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="header-button"
                    >
                      <ArrowRightOnRectangleIcon className="button-icon" aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="error-alert" role="alert">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="error-close">
                      <svg className="h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <title>Close</title>
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                      </svg>
                    </button>
                  </div>
                )}
              </header>

              <main className="app-main">
                <div className="app-content">
                  <div className="task-list-container">
                    <div className="card">
                      <div className="card-header">
                        <div className="card-header-content">
                          <h2>Tasks & Opportunities</h2>
                        </div>
                        <ServiceConnections
                          onServiceConnect={handleServiceConnect}
                          connectedServices={connectedServices}
                        />
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

                  <div className="chat-container">
                    <div className="card">
                      <Chat />
                    </div>
                  </div>
                </div>
              </main>

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
