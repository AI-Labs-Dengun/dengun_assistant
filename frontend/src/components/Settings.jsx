import React from 'react';

function Settings({ isOpen, onClose, onThemeChange, onVoiceChange, selectedVoice }) {
  if (!isOpen) return null;

  const currentTheme = localStorage.getItem('theme') || 'light';

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Theme</h3>
          <div className="settings-options">
            <button
              className={`settings-option ${currentTheme === 'light' ? 'selected' : ''}`}
              onClick={() => onThemeChange('light')}
            >
              Light
            </button>
            <button
              className={`settings-option ${currentTheme === 'dark' ? 'selected' : ''}`}
              onClick={() => onThemeChange('dark')}
            >
              Dark
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">Voice Selection</h3>
          <div className="voice-options">
            <label className="voice-option">
              <input
                type="radio"
                name="voice"
                value="alloy"
                checked={selectedVoice === 'alloy'}
                onChange={(e) => onVoiceChange(e.target.value)}
              />
              <span className="voice-name">Alloy (Default)</span>
            </label>
            <label className="voice-option">
              <input
                type="radio"
                name="voice"
                value="echo"
                checked={selectedVoice === 'echo'}
                onChange={(e) => onVoiceChange(e.target.value)}
              />
              <span className="voice-name">Echo</span>
            </label>
            <label className="voice-option">
              <input
                type="radio"
                name="voice"
                value="fable"
                checked={selectedVoice === 'fable'}
                onChange={(e) => onVoiceChange(e.target.value)}
              />
              <span className="voice-name">Fable</span>
            </label>
          </div>
        </div>

        <button className="settings-logout" onClick={handleLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Settings; 