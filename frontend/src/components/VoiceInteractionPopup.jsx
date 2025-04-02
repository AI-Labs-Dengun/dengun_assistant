import React from 'react';
import robot2Icon from '../assets/robot2.png';
import user2Icon from '../assets/user2.png';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="voice-interaction-popup relative max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">{t('voiceChat')}</h2>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="voice-status-container">
          {/* Show AI Speaking Status only when AI is active */}
          {isAISpeaking && (
            <div className="voice-status active">
              <div className="voice-status-icon">
                <img 
                  src={robot2Icon} 
                  alt="AI" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="voice-status-text">
                <h4>{t('assistant')}</h4>
                <p>{isPaused ? t('paused') : t('speaking')}</p>
              </div>
              <button
                onClick={onSkip}
                className="ml-auto text-white/80 hover:text-white transition-colors"
              >
                {isPaused ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* Show User Speaking Status only when user is active or neither is active */}
          {(!isAISpeaking) && (
            <div className={`voice-status ${isUserActive ? 'active' : ''}`}>
              <div className="voice-status-icon">
                <img 
                  src={user2Icon} 
                  alt="User" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="voice-status-text">
                <h4>{t('you')}</h4>
                <p>
                  {isRecording ? t('recording') : 
                   isTranscribing ? t('transcribing') : 
                   t('readyToRecord')}
                </p>
              </div>
              <button
                onClick={isRecording ? onStopRecording : onStartRecording}
                disabled={isAISpeaking}
                className="ml-auto text-white/80 hover:text-white transition-colors"
              >
                {isRecording ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceInteractionPopup; 