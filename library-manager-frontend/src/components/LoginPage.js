import React, { useState, useEffect } from 'react';
import api from '../api';
import WeatherWidget from './WeatherWidget';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    city: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [weather, setWeather] = useState(null);

  // Clear errors when form data changes
  useEffect(() => {
    if (errors.username && formData.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
    if (errors.password && formData.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
    if (errors.city && formData.city) {
      setErrors(prev => ({ ...prev, city: '' }));
    }
  }, [formData, errors]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchWeatherByCity = async (city) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/weather/?city=${encodeURIComponent(city)}`
      );
      const data = await res.json();
      setWeather(data);
      return data;
    } catch {
      setWeather(null);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const params = new URLSearchParams();
      params.append('username', formData.username.trim());
      params.append('password', formData.password);

      const response = await api.post('/login/', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000 // 10 second timeout
      });

      const { username: user } = response.data;

      // Store user info in localStorage
      localStorage.setItem('user', user);
      localStorage.setItem('loginTime', new Date().toISOString());
      
      // Fetch weather by city after login
      const weatherData = await fetchWeatherByCity(formData.city.trim());
      onLogin(user, weatherData);
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        // Server responded with error
        if (err.response.status === 401) {
          setErrors({ general: 'Invalid username or password' });
        } else if (err.response.status === 500) {
          setErrors({ general: 'Server error. Please try again later.' });
        } else {
          setErrors({ general: 'Login failed. Please try again.' });
        }
      } else if (err.request) {
        // Network error
        setErrors({ general: 'Network error. Please check your connection.' });
      } else {
        // Other error
        setErrors({ general: 'An unexpected error occurred.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>🔐 Welcome Back</h2>
          <p>Sign in to your library account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className={errors.username ? 'error' : ''}
              autoComplete="username"
              style={{ width: '100%' }}
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className={errors.password ? 'error' : ''}
                autoComplete="current-password"
                style={{ width: '100%' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="Enter your city"
              value={formData.city}
              onChange={handleInputChange}
              disabled={isLoading}
              className={errors.city ? 'error' : ''}
              autoComplete="address-level2"
              style={{ width: '100%' }}
            />
            {errors.city && (
              <span className="error-message">{errors.city}</span>
            )}
          </div>

          {errors.general && (
            <div className="general-error">
              <span className="error-message">{errors.general}</span>
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo credentials:</p>
          <div className="demo-credentials">
            <div>
              <strong>Admin:</strong> admin / password123
            </div>
            <div>
              <strong>Reader:</strong> reader / booksrock
            </div>
          </div>
        </div>
      </div>

      {weather && <WeatherWidget weather={weather} />}

      <style jsx>{`
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .login-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 40px;
          width: 100%;
          max-width: 400px;
          animation: slideUp 0.5s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h2 {
          margin: 0 0 8px 0;
          color: #333;
          font-size: 28px;
          font-weight: 600;
        }

        .login-header p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }

        .form-group input {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          transition: all 0.2s ease;
          background: #fafbfc;
          width: 100%;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input.error {
          border-color: #e74c3c;
          background: #fdf2f2;
        }

        .form-group input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .password-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }

        .password-toggle:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }

        .password-toggle:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .error-message {
          color: #e74c3c;
          font-size: 12px;
          margin-top: 4px;
        }

        .general-error {
          background: #fdf2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }

        .login-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 14px 20px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 48px;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .login-footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e1e5e9;
          text-align: center;
        }

        .login-footer p {
          margin: 0 0 12px 0;
          color: #666;
          font-size: 14px;
        }

        .demo-credentials {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          font-size: 12px;
          color: #666;
        }

        .demo-credentials div {
          margin: 4px 0;
        }

        .demo-credentials strong {
          color: #333;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 30px 20px;
            margin: 10px;
          }

          .login-header h2 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
