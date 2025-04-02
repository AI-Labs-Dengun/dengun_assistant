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
        'pt': t('sampleVoice'),
        'en': t('sampleVoice'),
        'es': t('sampleVoice')
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

      audio.play().catch(error => {
        console.error('Error playing sample voice:', error);
      });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-panel rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{t('settings')}</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">{t('theme')}</label>
            <div className="flex gap-2">
              <button
                onClick={() => onThemeChange('light')}
                className={`px-4 py-2 rounded-lg ${
                  currentTheme === 'light'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {t('light')}
              </button>
              <button
                onClick={() => onThemeChange('dark')}
                className={`px-4 py-2 rounded-lg ${
                  currentTheme === 'dark'
                    ? 'bg-white text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {t('dark')}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">{t('voice')}</label>
            <div className="grid grid-cols-3 gap-2">
              {voices.map((voice) => (
                <button
                  key={voice.id}
                  onClick={() => handleVoiceChange(voice.id)}
                  className={`px-4 py-2 rounded-lg ${
                    selectedVoice === voice.id
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {voice.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings; 