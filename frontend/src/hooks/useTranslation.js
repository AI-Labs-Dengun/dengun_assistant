import { useState, useEffect } from 'react';
import { translations } from '../translations';

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    // Map language codes to supported languages
    const languageMap = {
      'en': 'en', // English
      'es': 'es', // Spanish
      'pt': 'pt', // Portuguese
      'fr': 'fr', // French
      'de': 'de', // German
      'it': 'it', // Italian
      'zh': 'zh', // Chinese
      'hi': 'hi', // Hindi
      'ru': 'ru', // Russian
      'ja': 'ja'  // Japanese
    };
    
    const detectedLanguage = languageMap[langCode] || 'en';
    setCurrentLanguage(detectedLanguage);
  }, []);

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations['en'][key] || key;
  };

  return { t, currentLanguage, setCurrentLanguage };
}; 