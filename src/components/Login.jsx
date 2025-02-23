import PropTypes from 'prop-types';
import { auth, provider, signInWithPopup } from '../firebase';  // Import signInWithPopup from firebase.js
import '../components/ButtonStyles.css';
import "./Login.css";

const Login = ({ onLogin }) => {
  const handleGoogleLoginClick = async () => {
    try {
      const result = await signInWithPopup(auth, provider);  // Use the signInWithPopup method
      const user = result.user;
      localStorage.setItem('user', JSON.stringify(user));
      console.log("User logged in:", user);
      // Notify the parent component (App.jsx) about the successful login
      onLogin(user);  // Passing the user data to App.jsx via onLogin
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const handleMicrosoftLoginClick = async () => {
    console.log("Microsoft login clicked");
  };

  const handleAppleLoginClick = async () => {
    console.log("Apple login clicked");
  };

  return (
    <div className="App">
      <div className="login-container card fade-in">
        <h1>Welcome to Tranquil</h1>
        <p className="login-subtitle">Your personal AI-powered task management companion</p>
        <div className="login-buttons">
          <button 
            onClick={handleGoogleLoginClick}
            className="login-button-google"
          >
            <svg className="button-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          <button 
            onClick={handleMicrosoftLoginClick}
            className="login-button-microsoft"
          >
            <svg className="button-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
            </svg>
            <span>Continue with Microsoft</span>
          </button>
          <button 
            onClick={handleAppleLoginClick}
            className="login-button-apple"
          >
            <svg className="button-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M14.94 5.19A4.38 4.38 0 0 0 16 2.5a4.38 4.38 0 0 0-2.89 1.48 4.1 4.1 0 0 0-1.02 2.63 3.62 3.62 0 0 0 2.85-1.42zm2.52 8.57a4.81 4.81 0 0 1 2.31-4.05 5 5 0 0 0-3.93-2.12c-1.67-.17-3.26 1-4.11 1-.85 0-2.17-1-3.57-1a5.23 5.23 0 0 0-4.41 2.68c-1.88 3.26-.48 8.1 1.35 10.76.9 1.3 1.97 2.76 3.38 2.71 1.35-.05 1.86-.88 3.49-.88 1.63 0 2.09.88 3.52.85 1.45-.02 2.37-1.32 3.26-2.63a11.08 11.08 0 0 0 1.47-3.02 4.69 4.69 0 0 1-2.86-4.3z"/>
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>
      </div>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired
};

export default Login;