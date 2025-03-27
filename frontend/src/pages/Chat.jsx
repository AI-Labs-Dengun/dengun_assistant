import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OpenAI from 'openai';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import EmojiPicker from 'emoji-picker-react';
import Settings from '../components/Settings';
import CommentModal from '../components/CommentModal';
import LoadingScreen from '../components/LoadingScreen';
import VoiceInteractionPopup from '../components/VoiceInteractionPopup';
import robotIcon from '../assets/robot.png';
import userIcon from '../assets/user.png';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const [userEmail, setUserEmail] = useState('');
  const [feedback, setFeedback] = useState({});
  const [comments, setComments] = useState({});
  const [isAudioLoading, setIsAudioLoading] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const inputRef = useRef(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userLanguage, setUserLanguage] = useState('en');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingLastMessage, setIsPlayingLastMessage] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const [isVoicePopupOpen, setIsVoicePopupOpen] = useState(false);
  const currentAudioRef = useRef(null);
  const audioStartTimeRef = useRef(0);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Apply theme on component mount and when theme changes
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // Apply theme immediately
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  useEffect(() => {
    const initializeChat = async () => {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        navigate('/');
        return;
      }
      setUserEmail(email);

      // Load saved voice preference
      const savedVoice = localStorage.getItem('selectedVoice') || 'alloy';
      setSelectedVoice(savedVoice);

      // Initialize MediaRecorder
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          console.log('Audio data available');
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          console.log('Recording stopped, processing audio...');
          setIsTranscribing(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          audioChunksRef.current = [];
          
          try {
            // Send audio to Whisper API with language detection
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.wav');
            formData.append('model', 'whisper-1');
            formData.append('language', userLanguage);

            console.log('Sending audio to Whisper API...');
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
              },
              body: formData
            });

            if (!response.ok) {
              throw new Error('Transcription failed');
            }

            const data = await response.json();
            const transcript = data.text;
            console.log('Transcription received:', transcript);
            
            if (transcript.trim()) {
              // Add user message to chat
              const userMessage = {
                role: 'user',
                content: transcript,
                timestamp: new Date()
              };
              setMessages(prev => [...prev, userMessage]);

              // Get AI response
              const aiResponse = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                  {
                    role: "system",
                    content: `You are a helpful AI assistant. Always respond in ${userLanguage} language only.`
                  },
                  ...messages.concat(userMessage).map(msg => ({
                    role: msg.role,
                    content: msg.content
                  }))
                ],
                temperature: 0.7,
                max_tokens: 1000
              });

              const assistantMessage = {
                role: 'assistant',
                content: aiResponse.choices[0].message.content,
                timestamp: new Date()
              };

              // Add AI response to chat
              setMessages(prev => [...prev, assistantMessage]);

              // Set AI speaking state and play the response
              setIsPlayingLastMessage(true);
              setIsPaused(false);
              try {
                const response = await openai.audio.speech.create({
                  model: "tts-1",
                  voice: selectedVoice,
                  input: assistantMessage.content
                });

                const audioData = await response.blob();
                const url = URL.createObjectURL(audioData);
                const audio = new Audio(url);
                currentAudioRef.current = audio;
                
                audio.onended = () => {
                  URL.revokeObjectURL(url);
                  setIsPlayingLastMessage(false);
                  setIsPaused(false);
                };

                audio.play().catch((error) => {
                  console.error('Error playing audio:', error);
                  setIsPlayingLastMessage(false);
                  setIsPaused(false);
                });

              } catch (error) {
                console.error('Error playing AI response:', error);
                setIsPlayingLastMessage(false);
                setIsPaused(false);
              }
            }
          } catch (error) {
            console.error('Error transcribing audio:', error);
            alert('Failed to transcribe audio. Please try again.');
          } finally {
            setIsTranscribing(false);
          }
        };

        mediaRecorder.onstart = () => {
          console.log('Recording started');
        };

      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Failed to access microphone. Please ensure you have granted microphone permissions.');
      }

      // Detect browser language
      const browserLang = navigator.language || navigator.userLanguage;
      const langCode = browserLang.split('-')[0];
      setUserLanguage(langCode);

      // Add initial welcome message in detected language
      const welcomeMessage = await getLocalizedWelcomeMessage(langCode);
      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);

      setIsInitializing(false);
    };

    initializeChat();

    // Cleanup function
    return () => {
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [navigate]);

  const getLocalizedWelcomeMessage = async (langCode) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a friendly AI assistant. Respond in ${langCode} language only. Keep the response short and welcoming.`
          },
          {
            role: "user",
            content: "Say hello and welcome the user to the chat."
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error getting localized welcome message:', error);
      return 'Hello! Welcome to the chat.';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant. Always respond in ${userLanguage} language only.`
          },
          ...messages.concat(userMessage).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.choices[0].message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Set AI speaking state and play the response
      setIsPlayingLastMessage(true);
      setIsPaused(false);
      setIsVoicePopupOpen(true);

      try {
        const audioResponse = await openai.audio.speech.create({
          model: "tts-1",
          voice: selectedVoice,
          input: assistantMessage.content
        });

        const audioData = await audioResponse.blob();
        const url = URL.createObjectURL(audioData);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        
        audio.onended = () => {
          URL.revokeObjectURL(url);
          setIsPlayingLastMessage(false);
          setIsPaused(false);
        };

        audio.play().catch((error) => {
          console.error('Error playing audio:', error);
          setIsPlayingLastMessage(false);
          setIsPaused(false);
        });

      } catch (error) {
        console.error('Error playing AI response:', error);
        setIsPlayingLastMessage(false);
        setIsPaused(false);
      }

      return assistantMessage;
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return errorMessage;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (messageId) => {
    setFeedback(prev => ({ ...prev, [messageId]: 'like' }));
  };

  const handleDislike = async (messageId) => {
    setFeedback(prev => ({ ...prev, [messageId]: 'dislike' }));
  };

  const handleVoiceChange = (voice) => {
    setSelectedVoice(voice);
    localStorage.setItem('selectedVoice', voice);
  };

  const handlePlayAudio = async (messageId, content) => {
    try {
      setIsAudioLoading(prev => ({ ...prev, [messageId]: true }));
      
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // OpenAI TTS implementation
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: selectedVoice,
        input: content
      });

      // Convert the response to a blob
      const audioData = await response.blob();
      const url = URL.createObjectURL(audioData);
      
      // Create and play audio
      const audio = new Audio(url);
      audio.play();

      // Cleanup
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setIsAudioLoading(prev => ({ ...prev, [messageId]: false }));
      };

    } catch (error) {
      console.error('Error playing audio:', error);
      setIsAudioLoading(prev => ({ ...prev, [messageId]: false }));
      // Fallback to browser's speech synthesis if OpenAI TTS fails
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Load voices when the component mounts
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Log available voices for debugging
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleComment = async (messageId, comment) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "The user has added a comment to your previous response. Use this feedback to improve your future responses."
          },
          {
            role: "user",
            content: `Comment: ${comment}`
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      });
      // Store the comment
      setComments(prev => ({ ...prev, [messageId]: comment }));
    } catch (error) {
      console.error('Error processing comment:', error);
    }
  };

  const handleOpenCommentModal = (message, index) => {
    setSelectedMessage({ message, index });
    setIsCommentModalOpen(true);
  };

  const handleCloseCommentModal = () => {
    setIsCommentModalOpen(false);
    setSelectedMessage(null);
  };

  const handleSubmitComment = (comment) => {
    if (selectedMessage) {
      handleComment(`msg-${selectedMessage.index}`, comment);
    }
  };

  const MessageActions = ({ message, index }) => {
    if (message.role !== 'assistant') return null;

    const messageId = `msg-${index}`;
    const currentFeedback = feedback[messageId];
    const hasComment = !!comments[messageId];
    const isLoading = isAudioLoading[messageId];

    return (
      <div className="message-actions">
        <button 
          className={`message-action-button ${isLoading ? 'loading' : ''}`}
          onClick={() => handlePlayAudio(messageId, message.content)}
          title="Play Audio"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L7 8H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h3l5 5V3z"/>
              <path d="M16.5 7.5a5 5 0 0 1 0 9"/>
              <path d="M19.5 4.5a10 10 0 0 1 0 15"/>
            </svg>
          )}
        </button>
        <button 
          className={`message-action-button ${currentFeedback === 'like' ? 'active' : ''}`}
          onClick={() => handleLike(messageId)}
          title="Like"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={currentFeedback === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12"/>
            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
          </svg>
        </button>
        <button 
          className={`message-action-button ${currentFeedback === 'dislike' ? 'active' : ''}`}
          onClick={() => handleDislike(messageId)}
          title="Dislike"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={currentFeedback === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 14V2"/>
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
          </svg>
        </button>
        <button 
          className={`message-action-button ${hasComment ? 'active' : ''}`}
          onClick={() => handleOpenCommentModal(message, index)}
          title="Comment"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={hasComment ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>
    );
  };

  // Add click outside handler for emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onEmojiClick = (emojiObject) => {
    setInputMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  // Add effect to focus input after assistant responds
  useEffect(() => {
    if (!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      inputRef.current?.focus();
    }
  }, [isLoading, messages]);

  const handleSkip = () => {
    if (currentAudioRef?.current) {
      if (currentAudioRef.current.paused) {
        // Resume playback
        currentAudioRef.current.play();
        setIsPaused(false);
      } else {
        // Pause playback
        currentAudioRef.current.pause();
        audioStartTimeRef.current = currentAudioRef.current.currentTime;
        setIsPaused(true);
      }
    }
  };

  const handleMicClick = async () => {
    if (!mediaRecorderRef.current) {
      alert('Audio recording is not supported in your browser.');
      return;
    }

    setIsVoicePopupOpen(true);

    // Get the last AI message
    const lastAiMessage = messages
      .slice()
      .reverse()
      .find(msg => msg.role === 'assistant');

    if (lastAiMessage) {
      setIsPlayingLastMessage(true);
      try {
        // Play the last message
        const response = await openai.audio.speech.create({
          model: "tts-1",
          voice: selectedVoice,
          input: lastAiMessage.content
        });

        const audioData = await response.blob();
        const url = URL.createObjectURL(audioData);
        const audio = new Audio(url);
        currentAudioRef.current = audio;
        
        await new Promise((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(url);
            setIsPlayingLastMessage(false);
            setIsPaused(false);
            resolve();
          };
          audio.play();
        });
      } catch (error) {
        console.error('Error playing last message:', error);
        setIsPlayingLastMessage(false);
        setIsPaused(false);
      }
    } else {
      setIsPlayingLastMessage(false);
      setIsPaused(false);
    }
  };

  const handleStartRecording = () => {
    if (!mediaRecorderRef.current) {
      alert('Audio recording is not supported in your browser.');
      return;
    }

    try {
      console.log('Starting recording...');
      audioChunksRef.current = [];
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        console.log('Stopping recording...');
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        alert('Failed to stop recording. Please try again.');
      }
    }
  };

  const handleCloseVoicePopup = async () => {
    // Stop recording if active
    if (isRecording) {
      await stopRecording();
    }
    
    // Stop AI speech if playing
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      setIsPlayingLastMessage(false);
      setIsPaused(false);
    }
    
    setIsVoicePopupOpen(false);
  };

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div className="gradient-background">
      <div className="glass-panel chat-container">
        <div className="chat-header">
          <div className="chat-header-title">
            <img src={robotIcon} alt="AI Assistant" width="24" height="24" className="text-white" />
            AI Assistant
          </div>
          <button 
            className="settings-button"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? (
                  <img src={userIcon} alt="User" className="w-6 h-6" />
                ) : (
                  <img src={robotIcon} alt="AI Assistant" className="w-6 h-6" />
                )}
              </div>
              <div className="message-bubble">
                <div className="message-content">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <MessageActions message={message} index={index} />
                <div className="message-timestamp">
                  {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant-message">
              <div className="message-avatar">
                <img src={robotIcon} alt="AI Assistant" className="w-6 h-6" />
              </div>
              <div className="message-bubble">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input-container">
          <div className="chat-input-wrapper">
            <div className="emoji-picker-container" ref={emojiPickerRef}>
              <button 
                type="button" 
                className="message-action-button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </button>
              {showEmojiPicker && (
                <div className="emoji-picker-popup">
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    width={300}
                    height={400}
                    searchPlaceholder="Search emoji..."
                    theme="dark"
                    skinTonesDisabled
                    lazyLoadEmojis
                  />
                </div>
              )}
            </div>
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="chat-input"
              disabled={isLoading}
              autoFocus
            />
            <button 
              type="button" 
              className="message-action-button"
              onClick={handleMicClick}
              title="Start Voice Chat"
              disabled={isLoading || isPlayingLastMessage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </button>
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !inputMessage.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
      <Settings 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onThemeChange={handleThemeChange}
        onVoiceChange={handleVoiceChange}
        selectedVoice={selectedVoice}
      />
      {selectedMessage && (
        <CommentModal
          isOpen={isCommentModalOpen}
          onClose={handleCloseCommentModal}
          onSubmit={handleSubmitComment}
          messageContent={selectedMessage.message.content}
          initialComment={comments[`msg-${selectedMessage.index}`]}
        />
      )}
      <VoiceInteractionPopup
        isOpen={isVoicePopupOpen}
        onClose={handleCloseVoicePopup}
        isPlayingLastMessage={isPlayingLastMessage}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        onStopRecording={stopRecording}
        onStartRecording={handleStartRecording}
        currentAudioRef={currentAudioRef}
        isPaused={isPaused}
        onSkip={handleSkip}
      />
    </div>
  );
}

export default Chat; 