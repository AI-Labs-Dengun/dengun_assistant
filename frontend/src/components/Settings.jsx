import React, { useRef } from 'react';
import OpenAI from 'openai';
import { useTranslation } from '../hooks/useTranslation';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function Settings({ isOpen, onClose, onThemeChange, onVoiceChange, selectedVoice }) {
  const { t } = useTranslation();
  const audioRef = useRef(null);
  
  if (!isOpen) return null;

  const currentTheme = localStorage.getItem('theme') || 'light';

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  const handleVoiceChange = async (voice) => {
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    try {
      const sampleMessage = t('sampleVoice');

      // Generate audio with the new voice
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: sampleMessage
      });

      const audioData = await response.blob();
      const url = URL.createObjectURL(audioData);
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        URL.revokeObjectURL(url);
      };

      audio.play().catch(error => {
        console.error('Error playing sample voice:', error);
      });

      // Only update the selected voice after successful audio generation
      onVoiceChange(voice);
    } catch (error) {
      console.error('Error generating sample voice:', error);
    }
  };

  const voices = [
    { id: 'alloy', name: 'Alloy' },
    { id: 'nova', name: 'Nova' },
    { id: 'shimmer', name: 'Shimmer' }
  ];

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2 className="settings-title">{t('settings')}</h2>
          <button
            onClick={onClose}
            className="settings-close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">{t('theme')}</h3>
          <div className="settings-options">
            <button
              onClick={() => onThemeChange('light')}
              className={`settings-option ${currentTheme === 'light' ? 'selected' : ''}`}
            >
              {t('light')}
            </button>
            <button
              onClick={() => onThemeChange('dark')}
              className={`settings-option ${currentTheme === 'dark' ? 'selected' : ''}`}
            >
              {t('dark')}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="settings-section-title">{t('voice')}</h3>
          <div className="settings-options">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => handleVoiceChange(voice.id)}
                className={`settings-option ${selectedVoice === voice.id ? 'selected' : ''}`}
              >
                {voice.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="settings-logout"
        >
          {t('logout')}
        </button>
      </div>
    </div>
  );
}

export default Settings; 