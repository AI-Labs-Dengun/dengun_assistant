import React, { useRef } from 'react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function Settings({ isOpen, onClose, onThemeChange, onVoiceChange, selectedVoice }) {
  if (!isOpen) return null;

  const currentTheme = localStorage.getItem('theme') || 'light';
  const audioRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    window.location.href = '/';
  };

  const handleVoiceChange = async (voice) => {
    onVoiceChange(voice);
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    try {
      // Get a sample message in the user's language
      const browserLang = navigator.language || navigator.userLanguage;
      const langCode = browserLang.split('-')[0];
      
      const sampleMessages = {
        'pt': 'Olá! Esta é uma amostra da minha voz.',
        'en': 'Hello! This is a sample of my voice.',
        'es': '¡Hola! Esta es una muestra de mi voz.',
        'fr': 'Bonjour! Voici un échantillon de ma voix.',
        'de': 'Hallo! Dies ist eine Probe meiner Stimme.',
        'it': 'Ciao! Questo è un esempio della mia voce.',
        'ja': 'こんにちは！これは私の声のサンプルです。',
        'ko': '안녕하세요! 이것은 제 목소리 샘플입니다.',
        'zh': '你好！这是我的声音样本。',
        'ru': 'Привет! Это образец моего голоса.'
      };

      const sampleMessage = sampleMessages[langCode] || sampleMessages['en'];

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

      audio.play().catch((error) => {
        console.error('Error playing voice sample:', error);
      });
    } catch (error) {
      console.error('Error generating voice sample:', error);
    }
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
                onChange={(e) => handleVoiceChange(e.target.value)}
              />
              <span className="voice-name">Alloy (Default)</span>
            </label>
            <label className="voice-option">
              <input
                type="radio"
                name="voice"
                value="echo"
                checked={selectedVoice === 'echo'}
                onChange={(e) => handleVoiceChange(e.target.value)}
              />
              <span className="voice-name">Echo</span>
            </label>
            <label className="voice-option">
              <input
                type="radio"
                name="voice"
                value="fable"
                checked={selectedVoice === 'fable'}
                onChange={(e) => handleVoiceChange(e.target.value)}
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