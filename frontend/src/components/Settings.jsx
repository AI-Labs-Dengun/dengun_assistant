import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const VOICES = [
  { id: 'voice1', name: 'Default Voice', pitch: 1.0, rate: 1.0 },
  { id: 'voice2', name: 'Friendly Voice', pitch: 1.2, rate: 0.9 },
  { id: 'voice3', name: 'Professional Voice', pitch: 0.9, rate: 1.1 }
];

function Settings({ isOpen, onClose, onThemeChange }) {
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState('voice1');
  const [currentTheme, setCurrentTheme] = useState(
    document.documentElement.getAttribute('data-theme') || 'light'
  );

  const handleThemeChange = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(theme);
    onThemeChange?.(theme);
  };

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Theme</h3>
          <div className="settings-options">
            <button
              className={`settings-option ${currentTheme === 'light' ? 'selected' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              Light
            </button>
            <button
              className={`settings-option ${currentTheme === 'dark' ? 'selected' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              Dark
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Voice</h3>
          <div className="settings-options voice-options">
            {VOICES.map(voice => (
              <label key={voice.id} className="voice-option">
                <input
                  type="radio"
                  name="voice"
                  value={voice.id}
                  checked={selectedVoice === voice.id}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                />
                <span className="voice-name">{voice.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="settings-logout" onClick={handleLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Settings; 