import React from 'react';
import robot2Icon from '../assets/robot2.png';
import { useTranslation } from '../hooks/useTranslation';

const VoiceInteractionPopup = ({
  isOpen,
  onClose,
  isPlayingLastMessage,
  isRecording,
  isTranscribing,
  onStopRecording,
  onStartRecording,
  currentAudioRef,
  isPaused,
  onSkip
}) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;

  // Determine who is currently active
  const isAISpeaking = isPlayingLastMessage;
  const isUserActive = isRecording || isTranscribing;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="glass-panel rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">{t('voiceChat')}</h2>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center space-y-8">
          {/* Status Icon */}
          <div className="relative">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center overflow-hidden transition-colors duration-300
              ${isAISpeaking ? 'bg-blue-500/20' : 
                isRecording ? 'bg-red-500/20' : 
                'bg-gray-500/20'}`}>
              {isAISpeaking ? (
                <img 
                  src={robot2Icon} 
                  alt="AI Speaking" 
                  className="w-full h-full object-contain p-6"
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
            <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full transition-colors duration-300
              ${isRecording ? 'bg-red-500 animate-pulse' : 
                isTranscribing ? 'bg-yellow-500' : 
                'bg-green-500'}`} />
          </div>

          {/* Status Text */}
          <div className="text-center space-y-2">
            <p className="text-xl font-medium text-white">
              {isAISpeaking ? (isPaused ? t('aiPaused') : t('aiSpeaking')) :
               isRecording ? t('recording') :
               isTranscribing ? t('processing') :
               t('readyToRecord')}
            </p>
            <p className="text-sm text-gray-300">
              {isAISpeaking ? (isPaused ? t('clickPlayToContinue') : t('clickStopToPause')) :
               isRecording ? t('clickStopToEnd') :
               isTranscribing ? t('pleaseWait') :
               t('clickRecordToStart')}
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            <button
              onClick={isAISpeaking ? onSkip : (isRecording ? onStopRecording : onStartRecording)}
              className={`voice-action-button ${isRecording ? 'recording' : ''} transition-transform duration-200 hover:scale-110`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                {isRecording ? (
                  <rect x="8" y="8" width="8" height="8" rx="2"/>
                ) : isAISpeaking ? (
                  isPaused ? (
                    <polygon points="10 8 16 12 10 16 10 8"/>
                  ) : (
                    <rect x="8" y="8" width="8" height="8" rx="2"/>
                  )
                ) : (
                  <circle cx="12" cy="12" r="6"/>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceInteractionPopup; 