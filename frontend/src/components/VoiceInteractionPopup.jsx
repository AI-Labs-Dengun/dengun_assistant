import React from 'react';
import robot2Icon from '../assets/robot2.png';

const VoiceInteractionPopup = ({
  isOpen,
  onClose,
  isPlayingLastMessage,
  isRecording,
  isTranscribing,
  onStopRecording,
  onStartRecording,
  currentAudioRef
}) => {
  if (!isOpen) return null;

  const handleSkip = () => {
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    if (currentAudioRef?.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }
  };

  // Determine who is currently active
  const isAISpeaking = isPlayingLastMessage;
  const isUserActive = isRecording || isTranscribing;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Voice Chat</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {/* Status Icon */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden
              ${isAISpeaking ? 'bg-blue-100 dark:bg-blue-900' : 
                isRecording ? 'bg-red-100 dark:bg-red-900' : 
                'bg-gray-100 dark:bg-gray-700'}`}>
              {isAISpeaking ? (
                <img 
                  src={robot2Icon} 
                  alt="AI Speaking" 
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
            <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full
              ${isRecording ? 'bg-red-500 animate-pulse' : 
                isTranscribing ? 'bg-yellow-500' : 
                'bg-green-500'}`} />
          </div>

          {/* Status Text */}
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {isAISpeaking ? 'AI Assistant Speaking' :
               isRecording ? 'Recording Your Voice' :
               isTranscribing ? 'Processing Your Message' :
               'Ready to Record'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isAISpeaking ? 'Click stop to stop AI' :
               isRecording ? 'Click stop to end recording' :
               isTranscribing ? 'Please wait while we process your message' :
               'Click record to start speaking'}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={isAISpeaking ? handleSkip : (isRecording ? onStopRecording : onStartRecording)}
            disabled={isTranscribing}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors
              ${isAISpeaking || isRecording
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-green-500 hover:bg-green-600'
              } ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {(isAISpeaking || isRecording) ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="12" height="12"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceInteractionPopup; 