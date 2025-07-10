import React, { useState, useEffect, useCallback } from 'react';
import AddAuthorForm from './components/AddAuthorForm';
import AddBookForm from './components/AddBookForm';
import BookList from './components/BookList';
import AuthorList from './components/AuthorList';
import BooksByAuthor from './components/BooksByAuthor';
import LoginPage from './components/LoginPage';
import WeatherWidget from './components/WeatherWidget';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [weather, setWeather] = useState(() => {
    const stored = localStorage.getItem('weather');
    return stored ? JSON.parse(stored) : null;
  });

  // Session timeout configuration (30 minutes)
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes warning before timeout

  // Check if session is valid
  const isSessionValid = useCallback(() => {
    const loginTime = localStorage.getItem('loginTime');
    const lastActivity = localStorage.getItem('lastActivity');
    
    if (!loginTime || !lastActivity) return false;
    
    const now = Date.now();
    const loginTimestamp = new Date(loginTime).getTime();
    const lastActivityTimestamp = new Date(lastActivity).getTime();
    
    // Check if session has expired
    if (now - loginTimestamp > SESSION_TIMEOUT) {
      return false;
    }
    
    // Check if user has been inactive for too long
    if (now - lastActivityTimestamp > SESSION_TIMEOUT) {
      return false;
    }
    
    return true;
  }, []);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    localStorage.setItem('lastActivity', new Date().toISOString());
  }, []);

  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    setSessionExpired(true);
    handleLogout();
  }, []);

  // Check session validity on mount and set up activity tracking
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedLoginTime = localStorage.getItem('loginTime');
    
    if (savedUser && savedLoginTime && isSessionValid()) {
      setUser(savedUser);
      updateActivity();
    } else if (savedUser) {
      // Session expired, clear invalid data
      handleLogout();
    }
    
    setIsLoading(false);
  }, [isSessionValid, updateActivity]);

  // Set up activity tracking and session timeout
  useEffect(() => {
    if (!user) return;

    // Update activity on user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set up session timeout check
    const sessionCheckInterval = setInterval(() => {
      if (!isSessionValid()) {
        handleSessionTimeout();
      }
    }, 60000); // Check every minute

    // Set up warning before timeout
    const warningTimeout = setTimeout(() => {
      if (isSessionValid()) {
        showSessionWarning();
      }
    }, SESSION_TIMEOUT - WARNING_TIME);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(sessionCheckInterval);
      clearTimeout(warningTimeout);
    };
  }, [user, isSessionValid, updateActivity, handleSessionTimeout]);

  // Show session warning
  const showSessionWarning = () => {
    const warningMessage = `Your session will expire in ${Math.floor(WARNING_TIME / 60000)} minutes. Click anywhere to extend your session.`;
    
    // Create warning element
    const warningDiv = document.createElement('div');
    warningDiv.id = 'session-warning';
    warningDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        font-size: 14px;
        animation: slideIn 0.3s ease-out;
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 18px;">⚠️</span>
          <span>${warningMessage}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="
          position: absolute;
          top: 5px;
          right: 5px;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 16px;
        ">×</button>
      </div>
    `;
    
    document.body.appendChild(warningDiv);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (warningDiv.parentElement) {
        warningDiv.remove();
      }
    }, 10000);
  };

  const fetchWeather = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `http://127.0.0.1:8000/weather/?lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          setWeather(data);
        } catch {
          setWeather(null);
        }
      });
    }
  }, []);

  const handleLogin = useCallback((username, weatherData) => {
    setUser(username);
    setSessionExpired(false);
    updateActivity();
    setWeather(weatherData);
    if (weatherData) {
      localStorage.setItem('weather', JSON.stringify(weatherData));
    }
  }, [updateActivity]);

  const handleLogout = useCallback(() => {
    // Clear all session data
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('lastActivity');
    
    setUser(null);
    setSessionExpired(false);
    
    // Remove any existing session warnings
    const warning = document.getElementById('session-warning');
    if (warning) {
      warning.remove();
    }
  }, []);

  const handleExtendSession = useCallback(() => {
    updateActivity();
    setSessionExpired(false);
    
    // Remove warning if it exists
    const warning = document.getElementById('session-warning');
    if (warning) {
      warning.remove();
    }
  }, [updateActivity]);

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ margin: 0, color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show session expired message
  if (sessionExpired) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>⏰ Session Expired</h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            Your session has expired due to inactivity. Please log in again to continue.
          </p>
          <button
            onClick={() => setSessionExpired(false)}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Log In Again
          </button>
        </div>
      </div>
    );
  }

  // If no one is logged in, show LoginPage
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Main App UI
  return (
    <div className="container">
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '0 0 16px 16px',
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px' }}>📚 Library Manager</h1>
            <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
              Welcome back, <strong>{user}</strong>! 
              <span style={{ fontSize: '12px', marginLeft: '10px', opacity: 0.7 }}>
                Session active
              </span>
            </p>
            {weather && <WeatherWidget weather={weather} />}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleExtendSession}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              Extend Session
            </button>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(231, 76, 60, 0.8)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(231, 76, 60, 1)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(231, 76, 60, 0.8)'}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <AddAuthorForm onAuthorAdded={() => {}} />
        <AddBookForm onBookAdded={() => {}} />
        <BookList />
        <br />
        <AuthorList />
        <BooksByAuthor />
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default App;
