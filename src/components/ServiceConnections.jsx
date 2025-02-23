import React, { useState, useEffect, useRef } from 'react';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import './ServiceConnections.css';

const ServiceConnections = ({ onServiceConnect, connectedServices }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleServiceClick = (service) => {
    onServiceConnect(service);
    setIsMenuOpen(false);
  };

  return (
    <div className="service-connections" ref={menuRef}>
      <button
        className="connect-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <ArrowPathIcon className="button-icon" />
        <span>Connect Services</span>
      </button>

      {isMenuOpen && (
        <div className="services-menu">
          <button
            className={`service-item ${connectedServices.gmail ? 'connected' : ''}`}
            onClick={() => handleServiceClick('gmail')}
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
              alt="Gmail"
              className="service-icon"
            />
            <span>Gmail</span>
            {connectedServices.gmail && (
              <CheckCircleIcon className="check-icon" />
            )}
          </button>

          <button
            className="service-item coming-soon"
            disabled
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
              alt="Outlook"
              className="service-icon"
            />
            <span>Outlook</span>
            <span className="coming-soon-label">Coming Soon</span>
          </button>

          <button
            className="service-item coming-soon"
            disabled
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
              alt="Google Calendar"
              className="service-icon"
            />
            <span>Google Calendar</span>
            <span className="coming-soon-label">Coming Soon</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceConnections; 