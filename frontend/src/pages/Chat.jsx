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
import { useTranslation } from '../hooks/useTranslation';
import robotIcon from '../assets/robot.png';
import userIcon from '../assets/user.png';
import aiInstructions from '../../../instructions/instructions-general.txt';
import aiKnowledge from '../../../knowledge/knowledge-general.txt';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import './Chat.css';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const tooltips = {
  pt: [
    {
      id: 1,
      text: "Como é que a Dengun pode ajudar a minha startup?",
      category: "startup-studio"
    },
    {
      id: 2,
      text: "Preciso de ajuda com o desenvolvimento do meu MVP",
      category: "product-development"
    },
    {
      id: 3,
      text: "Quero melhorar a minha estratégia de marketing digital",
      category: "digital-marketing"
    },
    {
      id: 4,
      text: "Como posso otimizar o SEO e o desempenho do meu site?",
      category: "seo"
    },
    {
      id: 5,
      text: "Procuro consultoria em estratégia digital",
      category: "strategy"
    },
    {
      id: 6,
      text: "Como posso implementar IA no meu negócio?",
      category: "ai-solutions"
    },
    {
      id: 7,
      text: "Quero desenvolver uma marca mais forte",
      category: "branding"
    },
    {
      id: 8,
      text: "Necessito de serviços de design UX/UI",
      category: "design"
    },
    {
      id: 9,
      text: "Como posso escalar a minha infraestrutura digital?",
      category: "infrastructure"
    },
    {
      id: 10,
      text: "Gostaria de saber mais sobre e-commerce e marketplaces",
      category: "ecommerce"
    },
    {
      id: 11,
      text: "Preciso de análise de dados e relatórios detalhados",
      category: "data-analytics"
    },
    {
      id: 12,
      text: "O que diferencia a Dengun no mercado?",
      category: "company-info"
    }
  ],
  en: [
    {
      id: 1,
      text: "How can Dengun help my startup?",
      category: "startup-studio"
    },
    {
      id: 2,
      text: "I need help with my MVP development",
      category: "product-development"
    },
    {
      id: 3,
      text: "I want to improve my digital marketing strategy",
      category: "digital-marketing"
    },
    {
      id: 4,
      text: "How can I optimize my website's SEO and performance?",
      category: "seo"
    },
    {
      id: 5,
      text: "Looking for digital strategy consulting",
      category: "strategy"
    },
    {
      id: 6,
      text: "How can I implement AI in my business?",
      category: "ai-solutions"
    },
    {
      id: 7,
      text: "I want to develop a stronger brand",
      category: "branding"
    },
    {
      id: 8,
      text: "I need UX/UI design services",
      category: "design"
    },
    {
      id: 9,
      text: "How can I scale my digital infrastructure?",
      category: "infrastructure"
    },
    {
      id: 10,
      text: "I'd like to know more about e-commerce and marketplaces",
      category: "ecommerce"
    },
    {
      id: 11,
      text: "I need detailed data analysis and reports",
      category: "data-analytics"
    },
    {
      id: 12,
      text: "What makes Dengun stand out in the market?",
      category: "company-info"
    }
  ],
  es: [
    {
      id: 1,
      text: "¿Cómo puede Dengun ayudar a mi startup?",
      category: "startup-studio"
    },
    {
      id: 2,
      text: "Necesito ayuda con el desarrollo de mi MVP",
      category: "product-development"
    },
    {
      id: 3,
      text: "Quiero mejorar mi estrategia de marketing digital",
      category: "digital-marketing"
    },
    {
      id: 4,
      text: "¿Cómo puedo optimizar el SEO y rendimiento de mi sitio web?",
      category: "seo"
    },
    {
      id: 5,
      text: "Busco consultoría en estrategia digital",
      category: "strategy"
    },
    {
      id: 6,
      text: "¿Cómo puedo implementar IA en mi negocio?",
      category: "ai-solutions"
    },
    {
      id: 7,
      text: "Quiero desarrollar una marca más fuerte",
      category: "branding"
    },
    {
      id: 8,
      text: "Necesito servicios de diseño UX/UI",
      category: "design"
    },
    {
      id: 9,
      text: "¿Cómo puedo escalar mi infraestructura digital?",
      category: "infrastructure"
    },
    {
      id: 10,
      text: "Me gustaría saber más sobre e-commerce y marketplaces",
      category: "ecommerce"
    },
    {
      id: 11,
      text: "Necesito análisis de datos e informes detallados",
      category: "data-analytics"
    },
    {
      id: 12,
      text: "¿Qué hace que Dengun destaque en el mercado?",
      category: "company-info"
    }
  ],
  fr: [
    {
      id: 1,
      text: "Comment Dengun peut-il aider ma startup ?",
      category: "startup-studio"
    },
    {
      id: 2,
      text: "J'ai besoin d'aide pour développer mon MVP",
      category: "product-development"
    },
    {
      id: 3,
      text: "Je veux améliorer ma stratégie de marketing digital",
      category: "digital-marketing"
    },
    {
      id: 4,
      text: "Comment optimiser le SEO et la performance de mon site ?",
      category: "seo"
    },
    {
      id: 5,
      text: "Je cherche des conseils en stratégie digitale",
      category: "strategy"
    },
    {
      id: 6,
      text: "Comment implémenter l'IA dans mon entreprise ?",
      category: "ai-solutions"
    },
    {
      id: 7,
      text: "Je veux développer une marque plus forte",
      category: "branding"
    },
    {
      id: 8,
      text: "J'ai besoin de services de design UX/UI",
      category: "design"
    },
    {
      id: 9,
      text: "Comment puis-je faire évoluer mon infrastructure digitale ?",
      category: "infrastructure"
    },
    {
      id: 10,
      text: "Je voudrais en savoir plus sur l'e-commerce",
      category: "ecommerce"
    },
    {
      id: 11,
      text: "J'ai besoin d'analyses de données détaillées",
      category: "data-analytics"
    },
    {
      id: 12,
      text: "Qu'est-ce qui distingue Dengun sur le marché ?",
      category: "company-info"
    }
  ],
  de: [
    {
      id: 1,
      text: "Wie kann Dengun meinem Startup helfen?",
      category: "startup-studio"
    },
    {
      id: 2,
      text: "Ich brauche Hilfe bei der MVP-Entwicklung",
      category: "product-development"
    },
    {
      id: 3,
      text: "Ich möchte meine Digital-Marketing-Strategie verbessern",
      category: "digital-marketing"
    },
    {
      id: 4,
      text: "Wie kann ich SEO und Website-Performance optimieren?",
      category: "seo"
    },
    {
      id: 5,
      text: "Ich suche Beratung für digitale Strategie",
      category: "strategy"
    },
    {
      id: 6,
      text: "Wie kann ich KI in meinem Unternehmen einsetzen?",
      category: "ai-solutions"
    },
    {
      id: 7,
      text: "Ich möchte eine stärkere Marke entwickeln",
      category: "branding"
    },
    {
      id: 8,
      text: "Ich benötige UX/UI-Design-Services",
      category: "design"
    },
    {
      id: 9,
      text: "Wie kann ich meine digitale Infrastruktur skalieren?",
      category: "infrastructure"
    },
    {
      id: 10,
      text: "Ich möchte mehr über E-Commerce erfahren",
      category: "ecommerce"
    },
    {
      id: 11,
      text: "Ich brauche detaillierte Datenanalysen",
      category: "data-analytics"
    },
    {
      id: 12,
      text: "Was macht Dengun am Markt besonders?",
      category: "company-info"
    }
  ],
  it: [
    {
      id: 1,
      text: "Come può Dengun aiutare la mia startup?",
      category: "startup-studio"
    },
    {
      id: 2,
      text: "Ho bisogno di aiuto con lo sviluppo del mio MVP",
      category: "product-development"
    },
    {
      id: 3,
      text: "Voglio migliorare la mia strategia di marketing digitale",
      category: "digital-marketing"
    },
    {
      id: 4,
      text: "Come posso ottimizzare SEO e performance del sito?",
      category: "seo"
    },
    {
      id: 5,
      text: "Cerco consulenza in strategia digitale",
      category: "strategy"
    },
    {
      id: 6,
      text: "Come posso implementare l'IA nel mio business?",
      category: "ai-solutions"
    },
    {
      id: 7,
      text: "Voglio sviluppare un brand più forte",
      category: "branding"
    },
    {
      id: 8,
      text: "Ho bisogno di servizi di design UX/UI",
      category: "design"
    },
    {
      id: 9,
      text: "Come posso scalare la mia infrastruttura digitale?",
      category: "infrastructure"
    },
    {
      id: 10,
      text: "Vorrei saperne di più su e-commerce e marketplace",
      category: "ecommerce"
    },
    {
      id: 11,
      text: "Ho bisogno di analisi dati dettagliate",
      category: "data-analytics"
    },
    {
      id: 12,
      text: "Cosa rende Dengun unica nel mercato?",
      category: "company-info"
    }
  ],
  zh: [
    {
      id: 1,
      text: "Dengun如何帮助我的创业公司？",
      category: "startup-studio"
    },
    {
      id: 2,
      text: "我需要MVP开发帮助",
      category: "product-development"
    },
    {
      id: 3,
      text: "我想改善数字营销策略",
      category: "digital-marketing"
    },
    {
      id: 4,
      text: "如何优化网站SEO和性能？",
      category: "seo"
    },
    {
      id: 5,
      text: "寻求数字战略咨询",
      category: "strategy"
    },
    {
      id: 6,
      text: "如何在业务中实施人工智能？",
      category: "ai-solutions"
    },
    {
      id: 7,
      text: "我想建立更强大的品牌",
      category: "branding"
    },
    {
      id: 8,
      text: "需要UX/UI设计服务",
      category: "design"
    },
    {
      id: 9,
      text: "如何扩展数字基础设施？",
      category: "infrastructure"
    },
    {
      id: 10,
      text: "想了解更多关于电子商务的信息",
      category: "ecommerce"
    },
    {
      id: 11,
      text: "需要详细的数据分析报告",
      category: "data-analytics"
    },
    {
      id: 12,
      text: "Dengun在市场上有什么特别之处？",
      category: "company-info"
    }
  ],
  hi: [
    {
      id: 1,
      text: "Dengun मेरे स्टार्टअप की कैसे मदद कर सकता है?",
      category: "startup-studio"
    },
    {
      id: 2,
      text: "मुझे MVP विकास में मदद चाहिए",
      category: "product-development"
    },
    {
      id: 3,
      text: "मैं अपनी डिजिटल मार्केटिंग रणनीति को बेहतर बनाना चाहता हूं",
      category: "digital-marketing"
    },
    {
      id: 4,
      text: "SEO और वेबसाइट प्रदर्शन को कैसे बेहतर बनाएं?",
      category: "seo"
    },
    {
      id: 5,
      text: "डिजिटल रणनीति में सलाह चाहिए",
      category: "strategy"
    },
    {
      id: 6,
      text: "अपने व्यवसाय में AI को कैसे लागू करें?",
      category: "ai-solutions"
    },
    {
      id: 7,
      text: "मैं एक मजबूत ब्रांड विकसित करना चाहता हूं",
      category: "branding"
    },
    {
      id: 8,
      text: "UX/UI डिज़ाइन सेवाओं की आवश्यकता है",
      category: "design"
    },
    {
      id: 9,
      text: "डिजिटल इंफ्रास्ट्रक्चर को कैसे बढ़ाएं?",
      category: "infrastructure"
    },
    {
      id: 10,
      text: "ई-कॉमर्स के बारे में और जानना चाहता हूं",
      category: "ecommerce"
    },
    {
      id: 11,
      text: "विस्तृत डेटा विश्लेषण की आवश्यकता है",
      category: "data-analytics"
    },
    {
      id: 12,
      text: "Dengun बाजार में क्या अलग करता है?",
      category: "company-info"
    }
  ],
  ru: [
    {
      id: 1,
      text: "Как Dengun может помочь моему стартапу?",
      category: "startup-studio"
    },
    {
      id: 2,
      text: "Мне нужна помощь в разработке MVP",
      category: "product-development"
    },
    {
      id: 3,
      text: "Хочу улучшить стратегию цифрового маркетинга",
      category: "digital-marketing"
    },
    {
      id: 4,
      text: "Как оптимизировать SEO и производительность сайта?",
      category: "seo"
    },
    {
      id: 5,
      text: "Ищу консультацию по цифровой стратегии",
      category: "strategy"
    },
    {
      id: 6,
      text: "Как внедрить ИИ в мой бизнес?",
      category: "ai-solutions"
    },
    {
      id: 7,
      text: "Хочу развить более сильный бренд",
      category: "branding"
    },
    {
      id: 8,
      text: "Нужны услуги UX/UI дизайна",
      category: "design"
    },
    {
      id: 9,
      text: "Как масштабировать цифровую инфраструктуру?",
      category: "infrastructure"
    },
    {
      id: 10,
      text: "Хочу узнать больше об электронной коммерции",
      category: "ecommerce"
    },
    {
      id: 11,
      text: "Нужен детальный анализ данных",
      category: "data-analytics"
    },
    {
      id: 12,
      text: "Чем Dengun выделяется на рынке?",
      category: "company-info"
    }
  ],
  ja: [
    {
      id: 1,
      text: "Dengunは私のスタートアップをどのように支援できますか？",
      category: "startup-studio"
    },
    {
      id: 2,
      text: "MVPの開発支援が必要です",
      category: "product-development"
    },
    {
      id: 3,
      text: "デジタルマーケティング戦略を改善したい",
      category: "digital-marketing"
    },
    {
      id: 4,
      text: "SEOとウェブサイトのパフォーマンスを最適化するには？",
      category: "seo"
    },
    {
      id: 5,
      text: "デジタル戦略のコンサルティングを探しています",
      category: "strategy"
    },
    {
      id: 6,
      text: "AIをビジネスに実装するには？",
      category: "ai-solutions"
    },
    {
      id: 7,
      text: "より強力なブランドを構築したい",
      category: "branding"
    },
    {
      id: 8,
      text: "UX/UIデザインサービスが必要です",
      category: "design"
    },
    {
      id: 9,
      text: "デジタルインフラをスケールするには？",
      category: "infrastructure"
    },
    {
      id: 10,
      text: "eコマースについてもっと知りたい",
      category: "ecommerce"
    },
    {
      id: 11,
      text: "詳細なデータ分析が必要です",
      category: "data-analytics"
    },
    {
      id: 12,
      text: "Dengunの市場での強みは何ですか？",
      category: "company-info"
    }
  ]
};

function Chat() {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const [userEmail, setUserEmail] = useState('');
  const [userPhotoUrl, setUserPhotoUrl] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [comments, setComments] = useState({});
  const [isAudioLoading, setIsAudioLoading] = useState({});
  const [currentlyPlayingMessageId, setCurrentlyPlayingMessageId] = useState(null);
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
  const [isPreparingVoiceAudio, setIsPreparingVoiceAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const [isVoicePopupOpen, setIsVoicePopupOpen] = useState(false);
  const currentAudioRef = useRef(null);
  const audioStartTimeRef = useRef(0);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [instructions, setInstructions] = useState('');
  const [knowledge, setKnowledge] = useState('');
  const [showSuggestedMessages, setShowSuggestedMessages] = useState(true);
  const [isSuggestedMessagesOpen, setIsSuggestedMessagesOpen] = useState(false);
  const [currentTooltips, setCurrentTooltips] = useState([]);
  const currentMessageAudioRef = useRef(null);
  // New state variables for contact information
  const [userPhone, setUserPhone] = useState('');
  const [contactInfoDetected, setContactInfoDetected] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const messagesContainerRef = useRef(null);

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
      try {
        // Check if API key is available
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        console.log("API Key available:", !!apiKey);
        
        // Mask the API key for logging (only show first 4 and last 4 characters)
        const maskedKey = apiKey 
          ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
          : "not available";
        console.log("Masked API Key:", maskedKey);
        
        // Check for user authentication
        if (!apiKey) {
          throw new Error('OpenAI API key is not available');
        }

        const email = localStorage.getItem('userEmail');
        if (!email) {
          navigate('/');
          return;
        }
        setUserEmail(email);

        // Load user's profile photo
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where("email", "==", email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            if (userData.photoUrl) {
              setUserPhotoUrl(userData.photoUrl);
            }
          }
        } catch (error) {
          console.error('Error loading user photo:', error);
        }

        // Load saved voice preference
        const savedVoice = localStorage.getItem('selectedVoice') || 'alloy';
        setSelectedVoice(savedVoice);

        // Check for secure context and proper API support
        try {
          // Check if we're in a secure context
          if (!window.isSecureContext) {
            throw new Error('Microphone access requires a secure context (HTTPS or localhost)');
          }

          // Check if mediaDevices API is supported
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Media devices API is not supported in this browser');
          }

          // Check if MediaRecorder is supported
          if (typeof MediaRecorder === 'undefined') {
            throw new Error('MediaRecorder is not supported in this browser');
          }

        } catch (error) {
          console.error('Error checking audio support:', error);
        }

        // Detect browser language and set it as the user's language
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
        setUserLanguage(detectedLanguage);
        console.log('Detected language:', detectedLanguage);

        // Wait for instructions to load before showing welcome message
        try {
          const [instructionsResponse, knowledgeResponse] = await Promise.all([
            fetch(aiInstructions),
            fetch(aiKnowledge)
          ]);
          
          const [instructionsText, knowledgeText] = await Promise.all([
            instructionsResponse.text(),
            knowledgeResponse.text()
          ]);

          setInstructions(instructionsText);
          setKnowledge(knowledgeText);

          // Add initial welcome message using instructions
          const welcomeMessage = await getLocalizedWelcomeMessage(detectedLanguage, instructionsText);
          setMessages([{
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date()
          }]);
        } catch (error) {
          console.error('Error loading AI files:', error);
        }

        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setIsInitializing(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      handleVoicePopupClose();
    };
  }, [navigate]);

  const getLocalizedWelcomeMessage = async (langCode, instructions) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Instructions: ${instructions}\nLanguage: ${langCode}\nImportant: Respond in the same language as the user's language (${langCode}). If the user's language is Portuguese, respond in Portuguese. Provide a warm and welcoming greeting that establishes trust and creates a conversation flow that will naturally lead to asking for contact information later.`
          },
          {
            role: "user",
            content: "Say hello and welcome the user to the chat."
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error getting welcome message:', error);
      // Silently fall back to English without showing any error message
      return t('welcome');
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
    
    // Hide the suggested messages button when user sends a message
    setShowSuggestedMessages(false);
    
    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Check if the message contains contact information
    const contactInfo = detectContactInfo(userMessage.content);
    
    // If contact info is detected and we haven't processed it yet
    if (contactInfo && contactInfo.hasContactInfo && !contactInfoDetected && !emailSent) {
      console.log('Contact information detected:', contactInfo);
      setContactInfoDetected(true);
      // Process in background while the conversation continues
      sendContactEmail(contactInfo).catch(error => 
        console.error('Error in background contact processing:', error)
      );
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Instructions: ${instructions}\nKnowledge Base: ${knowledge}\nLanguage: ${userLanguage}\nImportant: Actively ask for the user's contact information (email and/or phone) during the conversation in a natural way.`
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
      return assistantMessage;
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: t('errorTryAgain'),
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
      // If this message is currently playing, stop it
      if (currentlyPlayingMessageId === messageId) {
        if (currentMessageAudioRef.current) {
          currentMessageAudioRef.current.pause();
          currentMessageAudioRef.current.currentTime = 0;
          URL.revokeObjectURL(currentMessageAudioRef.current.src);
          currentMessageAudioRef.current = null;
        }
        setCurrentlyPlayingMessageId(null);
        setIsAudioLoading(prev => ({ ...prev, [messageId]: false }));
        return;
      }

      // If another message is playing, stop that one first
      if (currentlyPlayingMessageId && currentlyPlayingMessageId !== messageId) {
        if (currentMessageAudioRef.current) {
          currentMessageAudioRef.current.pause();
          currentMessageAudioRef.current.currentTime = 0;
          URL.revokeObjectURL(currentMessageAudioRef.current.src);
          currentMessageAudioRef.current = null;
        }
        setIsAudioLoading(prev => ({ ...prev, [currentlyPlayingMessageId]: false }));
      }

      // Set loading state immediately when button is clicked
      setIsAudioLoading(prev => ({ ...prev, [messageId]: true }));
      
      // Cancel any ongoing speech synthesis
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
      
      // Create audio object
      const audio = new Audio(url);
      currentMessageAudioRef.current = audio;
      
      // Set up event listeners before starting playback
      
      // Once audio is actually playing, update the playing state
      audio.onplaying = () => {
        setCurrentlyPlayingMessageId(messageId);
        setIsAudioLoading(prev => ({ ...prev, [messageId]: false }));
      };
      
      // When audio ends, clean up everything
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setIsAudioLoading(prev => ({ ...prev, [messageId]: false }));
        setCurrentlyPlayingMessageId(null);
        currentMessageAudioRef.current = null;
      };
      
      // Handle any errors during playback
      audio.onerror = () => {
        console.error('Error during audio playback');
        URL.revokeObjectURL(url);
        setIsAudioLoading(prev => ({ ...prev, [messageId]: false }));
        setCurrentlyPlayingMessageId(null);
        currentMessageAudioRef.current = null;
      };
      
      // Start playing the audio
      try {
        await audio.play();
      } catch (playError) {
        console.error('Error playing audio:', playError);
        setIsAudioLoading(prev => ({ ...prev, [messageId]: false }));
        setCurrentlyPlayingMessageId(null);
        currentMessageAudioRef.current = null;
      }

    } catch (error) {
      console.error('Error getting audio from API:', error);
      setIsAudioLoading(prev => ({ ...prev, [messageId]: false }));
      setCurrentlyPlayingMessageId(null);
      currentMessageAudioRef.current = null;
      
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
    const isPlaying = currentlyPlayingMessageId === messageId;

    return (
      <div className="message-actions">
        <button 
          className={`message-action-button ${isLoading ? 'loading' : ''} ${isPlaying ? 'playing' : ''}`}
          onClick={() => handlePlayAudio(messageId, message.content)}
          title={isPlaying ? t('stopAudio') : isLoading ? t('preparingAudio') : t('playAudio')}
          disabled={isLoading && !isPlaying}
        >
          {isLoading && !isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
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
          title={t('likeMessage')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={currentFeedback === 'like' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
          </svg>
        </button>
        <button
          className={`message-action-button ${currentFeedback === 'dislike' ? 'active' : ''}`}
          onClick={() => handleDislike(messageId)}
          title={t('dislikeMessage')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={currentFeedback === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 14V2"/>
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/>
          </svg>
        </button>
        <button 
          className={`message-action-button ${hasComment ? 'active' : ''}`}
          onClick={() => handleOpenCommentModal(message, index)}
          title={t('commentMessage')}
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

  const handlePauseResume = () => {
    if (currentAudioRef.current) {
      if (isPaused) {
        currentAudioRef.current.play();
        setIsPaused(false);
      } else {
        currentAudioRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handleVoicePopupClose = () => {
    console.log("Closing voice popup and cleaning up resources...");
    
    // First set closing flags immediately to prevent interaction during cleanup
    setIsVoicePopupOpen(false);
    
    // Stop any playing audio and cleanup
    if (currentAudioRef.current) {
      console.log("Cleaning up audio element...");
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      if (currentAudioRef.current.src) {
        URL.revokeObjectURL(currentAudioRef.current.src);
      }
      currentAudioRef.current = null;
    }

    // Clean up any ongoing recording
    if (mediaRecorderRef.current) {
      console.log("Cleaning up media recorder...");
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      } catch (error) {
        console.error('Error stopping mediaRecorder:', error);
      }
    }

    // Clean up audio stream
    if (audioStreamRef.current) {
      console.log("Stopping audio tracks...");
      try {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      } catch (error) {
        console.error('Error stopping audio tracks:', error);
      }
    }

    // Clear any stored audio chunks and reset time
    audioChunksRef.current = [];
    audioStartTimeRef.current = 0;

    // Reset all voice-related states with a small delay to ensure cleanup is complete
    // This also prevents rapid reopening which could cause issues
    setTimeout(() => {
      console.log("Resetting all voice states...");
      setIsPlayingLastMessage(false);
      setIsPaused(false);
      setIsRecording(false);
      setIsTranscribing(false);
      setIsPreparingVoiceAudio(false);
    }, 300);
  };

  const handleMicClick = async () => {
    // Prevent multiple clicks while processing
    if (isLoading || isPlayingLastMessage || isPreparingVoiceAudio) {
      console.log('Voice interaction is busy, please wait...');
      return;
    }

    if (!window.isSecureContext) {
      alert(t('errorMicrophone'));
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(t('errorBrowserSupport'));
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      alert(t('errorRecording'));
      return;
    }

    try {
      console.log("Starting voice interaction process...");
      
      // First, ensure a complete cleanup of any existing resources
      // But don't set isVoicePopupOpen to false yet, as we're about to open it
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime =.0;
        if (currentAudioRef.current.src) {
          URL.revokeObjectURL(currentAudioRef.current.src);
        }
        currentAudioRef.current = null;
      }

      // Reset voice-related states except isVoicePopupOpen
      setIsPlayingLastMessage(false);
      setIsPaused(false);
      setIsRecording(false);
      setIsTranscribing(false);
      
      // Clean up any ongoing recording
      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
          mediaRecorderRef.current = null;
        } catch (error) {
          console.error('Error stopping mediaRecorder:', error);
        }
      }

      // Clean up audio stream
      if (audioStreamRef.current) {
        try {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        } catch (error) {
          console.error('Error stopping audio tracks:', error);
        }
      }

      // Clear any stored audio chunks
      audioChunksRef.current = [];
      audioStartTimeRef.current = 0;

      // Get the last AI message
      const lastAiMessage = messages
        .slice()
        .reverse()
        .find(msg => msg.role === 'assistant');

      if (lastAiMessage) {
        try {
          console.log("Starting voice interaction sequence");
          
          // 1. First step: Set AI as active and open popup BEFORE any async operations
          setIsPreparingVoiceAudio(true);
          setIsVoicePopupOpen(true);
          
          // 2. Prepare audio in the background
          console.log("Preparing AI speech...");
          const response = await openai.audio.speech.create({
            model: "tts-1",
            voice: selectedVoice,
            input: lastAiMessage.content
          });

          const audioData = await response.blob();
          const url = URL.createObjectURL(audioData);
          
          // 3. Create and set up the audio with proper handlers
          console.log("Setting up audio playback...");
          const audio = new Audio(url);
          
          // Set up all event handlers BEFORE assigning to currentAudioRef
          audio.oncanplay = () => {
            console.log("Audio ready to play");
            setIsPreparingVoiceAudio(false);
            setIsPlayingLastMessage(true);
          };
          
          audio.onended = () => {
            console.log("AI finished speaking");
            URL.revokeObjectURL(url);
            setIsPlayingLastMessage(false);
            setIsPaused(false);
            setIsPreparingVoiceAudio(false);
            
            // No automatic actions after AI finishes speaking
            // User needs to manually press the record button
          };
          
          audio.onerror = (e) => {
            console.error('Error during audio playback:', e);
            URL.revokeObjectURL(url);
            setIsPreparingVoiceAudio(false);
            setIsPlayingLastMessage(false);
            setIsPaused(false);
          };
          
          // 4. Now assign to ref and play
          currentAudioRef.current = audio;
          
          try {
            console.log("Starting AI speech playback");
            await audio.play();
          } catch (playError) {
            console.error('Error playing audio:', playError);
            setIsPreparingVoiceAudio(false);
            setIsPlayingLastMessage(false);
            handleVoicePopupClose();
          }
        } catch (error) {
          console.error('Error in voice interaction sequence:', error);
          handleVoicePopupClose();
        }
      } else {
        alert(t('noAIMessageToRead'));
      }
    } catch (error) {
      console.error('Error initializing voice interaction:', error);
      handleVoicePopupClose();
    }
  };
  
  // Add separated functions for starting and stopping recording
  const handleStartRecording = async () => {
    try {
      console.log("Starting recording...");
      // Only proceed if we're not already recording
      if (isRecording) {
        console.warn('Already recording');
        return;
      }
      
      // Stop any previous media recorder and audio stream
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        console.log('Stopping existing recorder before starting new one');
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
      
      if (audioStreamRef.current) {
        console.log('Stopping existing audio tracks before starting new ones');
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
      
      // Clear any previous audio chunks
      audioChunksRef.current = [];
      
      // Get fresh audio stream
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      // Create new MediaRecorder
      console.log('Creating new MediaRecorder...');
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        console.log('Audio data available');
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstart = () => {
        console.log('Recording started successfully');
        setIsRecording(true);
      };
      
      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
        setIsRecording(false);
        
        // Clean up on error
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        setIsRecording(false);
        setIsTranscribing(true);
        
        try {
          // Process the recorded audio
          if (audioChunksRef.current.length === 0) {
            console.warn('No audio data recorded');
            setIsTranscribing(false);
            return;
          }
          
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          audioChunksRef.current = [];
          
          // Send audio to Whisper API
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.wav');
          formData.append('model', 'whisper-1');
          formData.append('response_format', 'json');
          
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
            
            // Check if the transcribed message contains contact information
            const contactInfo = detectContactInfo(transcript);
    
            // If contact info is detected and we haven't processed it yet
            if (contactInfo && contactInfo.hasContactInfo && !contactInfoDetected && !emailSent) {
              console.log('Contact information detected:', contactInfo);
              setContactInfoDetected(true);
              // Process in background while the conversation continues
              sendContactEmail(contactInfo).catch(error => 
                console.error('Error in background contact processing:', error)
              );
            }
            
            // Get AI response
            console.log('Getting AI response...');
            const aiResponse = await openai.chat.completions.create({
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content: `Instructions: ${instructions}\nKnowledge Base: ${knowledge}\nImportant: You MUST detect and respond in the EXACT SAME language as the user's message. DO NOT translate anything. If the user speaks in Portuguese, you MUST respond in Portuguese. If they speak in Spanish, respond in Spanish. If in English, respond in English. Never translate to English.\nAlso important: Actively ask for the user's contact information (email and/or phone) during the conversation in a natural way.`
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
            
            // Play the AI response
            setIsPreparingVoiceAudio(true);
            
            const ttsResponse = await openai.audio.speech.create({
              model: "tts-1",
              voice: selectedVoice,
              input: assistantMessage.content
            });
            
            const audioData = await ttsResponse.blob();
            const url = URL.createObjectURL(audioData);
            const audio = new Audio(url);
            
            // Clear any existing audio
            if (currentAudioRef.current) {
              currentAudioRef.current.pause();
              if (currentAudioRef.current.src) {
                URL.revokeObjectURL(currentAudioRef.current.src);
              }
            }
            
            // Set up event handlers
            audio.oncanplay = () => {
              setIsPreparingVoiceAudio(false);
              setIsPlayingLastMessage(true);
            };
            
            audio.onended = () => {
              URL.revokeObjectURL(url);
              setIsPlayingLastMessage(false);
              setIsPaused(false);
              setIsPreparingVoiceAudio(false);
            };
            
            audio.onerror = () => {
              console.error('Error during AI response audio playback');
              URL.revokeObjectURL(url);
              setIsPreparingVoiceAudio(false);
              setIsPlayingLastMessage(false);
              setIsPaused(false);
            };
            
            // Play the audio
            currentAudioRef.current = audio;
            await audio.play();
          }
        } catch (error) {
          console.error('Error processing recording:', error);
          alert(t('errorTranscribeAudio'));
        } finally {
          setIsTranscribing(false);
        }
      };
      
      // Start recording
      mediaRecorder.start(1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      alert(t('errorStartRecording'));
    }
  };
  
  const handleStopRecording = () => {
    try {
      console.log("Stopping recording...");
      
      // Only try to stop if we're actually recording
      if (!isRecording) {
        console.warn('Not currently recording');
        return;
      }
      
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state === 'recording') {
          console.log('Stopping active MediaRecorder');
          mediaRecorderRef.current.stop();
        } else {
          console.log('MediaRecorder not in recording state:', mediaRecorderRef.current.state);
          setIsRecording(false);
        }
      } else {
        console.warn('No MediaRecorder available');
        // Reset the recording state if there's no recorder
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      // Make sure to reset the recording state on error
      setIsRecording(false);
      
      // Also clean up any streams that might be open
      if (audioStreamRef.current) {
        try {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        } catch (streamError) {
          console.error('Error stopping audio tracks:', streamError);
        }
      }
    }
  };

  // Function to hide tooltips
  const hideTooltips = () => {
    setShowSuggestedMessages(false);
  };

  // Function to randomly select 4 tooltips based on current language
  const selectRandomTooltips = (language) => {
    // Ensure we have a valid language and tooltips for that language
    const availableTooltips = tooltips[language] || tooltips['en'] || [];
    
    // If no tooltips are available, return an empty array
    if (!Array.isArray(availableTooltips) || availableTooltips.length === 0) {
      console.warn(`No tooltips available for language: ${language}`);
      return [];
    }

    // Shuffle and select 4 tooltips
    const shuffled = [...availableTooltips].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  const handleSuggestedMessagesClick = (e) => {
    e.preventDefault(); // Prevent form submission
    setIsSuggestedMessagesOpen(true);
    const randomTooltips = selectRandomTooltips(currentLanguage);
    setCurrentTooltips(randomTooltips);
  };

  const handleSuggestedMessagesClose = () => {
    setIsSuggestedMessagesOpen(false);
  };

  const handleSuggestedMessageSelect = (messageText) => {
    handleTooltipClick(messageText);
    setIsSuggestedMessagesOpen(false);
    setShowSuggestedMessages(false);
  };

  const handleTooltipClick = async (tooltipText) => {
    setInputMessage(tooltipText);
    hideTooltips(); // Hide tooltips when user clicks one
    
    // Create a user message object
    const userMessage = {
      role: 'user',
      content: tooltipText.trim(),
      timestamp: new Date()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Instructions: ${instructions}\nKnowledge Base: ${knowledge}\nLanguage: ${userLanguage}\nImportant: Actively ask for the user's contact information (email and/or phone) during the conversation in a natural way.`
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
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'assistant',
        content: t('errorTryAgain'),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (content) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    } else {
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Function to detect contact information in a message
  const detectContactInfo = (message) => {
    if (contactInfoDetected || emailSent) return null;
    
    const content = message.trim();
    
    // More comprehensive phone number patterns
    // Covers international formats, local formats, with/without country codes
    // Handles various separators like spaces, dashes, periods, parentheses
    const phonePattern = /(?:(?:\+|00)(?:[1-9]\d{0,3}))?[-.\s]?\(?(?:\d{1,4})\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    
    // More comprehensive email pattern
    // Handles most valid email formats, including international domains
    const emailPattern = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    
    // Check for common ways people introduce their contact information
    const contactPhrases = [
      /my (phone|number|contact|cell|mobile|telephone) (is|:) ?([\+\d\s\-\(\)\.]{7,})/i,
      /you can (call|reach|contact) me at ?([\+\d\s\-\(\)\.]{7,})/i,
      /my email (is|address is|:) ?([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
      /you can email me at ?([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/i,
      /here'?s my (email|contact|phone|number): ?(.+)/i
    ];

    // Direct matches using patterns
    let detectedPhones = content.match(phonePattern) || [];
    let detectedEmails = content.match(emailPattern) || [];
    
    // Extract from phrases
    for (const phrase of contactPhrases) {
      const match = content.match(phrase);
      if (match) {
        if (match[0].toLowerCase().includes('email') || match[0].includes('@')) {
          const potentialEmail = match[0].match(emailPattern);
          if (potentialEmail && !detectedEmails.includes(potentialEmail[0])) {
            detectedEmails.push(potentialEmail[0]);
          }
        } else {
          const potentialPhone = match[0].match(phonePattern);
          if (potentialPhone && !detectedPhones.includes(potentialPhone[0])) {
            detectedPhones.push(potentialPhone[0]);
          }
        }
      }
    }
    
    // Clean up detected phone numbers to remove duplicates and invalid formats
    detectedPhones = detectedPhones
      .filter(phone => phone && phone.replace(/[^\d]/g, '').length >= 7) // At least 7 digits
      .filter((phone, index, self) => self.indexOf(phone) === index); // Remove duplicates
    
    // Clean up detected emails to remove duplicates
    detectedEmails = detectedEmails
      .filter((email, index, self) => self.indexOf(email) === index); // Remove duplicates
    
    console.log('Detection results:', { detectedPhones, detectedEmails });
    
    const contactInfo = {
      hasContactInfo: !!(detectedPhones.length > 0 || detectedEmails.length > 0),
      phones: detectedPhones,
      emails: detectedEmails
    };
    
    return contactInfo;
  };
  
  // Function to format conversation for email
  const formatConversationForEmail = async (messages, userName, userEmail, userPhone) => {
    try {
      // Use GPT to format the conversation in a nice way
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that formats conversation data for an email. Format the content in a clear, readable way with proper sections for user details and conversation history."
          },
          {
            role: "user",
            content: `Please format the following conversation for an email to our team:
            
USER DETAILS:
Name: ${userName || "Unknown"}
Email: ${userEmail || "Not provided"}
Phone: ${userPhone || "Not provided"}

CONVERSATION HISTORY:
${messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n')}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });
      
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error formatting conversation:', error);
      
      // Fallback to simple format if GPT fails
      return `
USER DETAILS:
Name: ${userName || "Unknown"}
Email: ${userEmail || "Not provided"}
Phone: ${userPhone || "Not provided"}

CONVERSATION HISTORY:
${messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n')}
      `;
    }
  };
  
  // Function to send the email with conversation information
  const sendContactEmail = async (detectedContacts) => {
    if (emailSent) return;
    
    try {
      setIsLoading(true);
      
      // Get the user's name from storage
      const userName = localStorage.getItem('userName') || localStorage.getItem('name') || userEmail?.split('@')[0] || 'Unknown User';
      
      // If a phone number was detected in the message, save it
      if (detectedContacts.phones.length > 0) {
        setUserPhone(detectedContacts.phones[0]);
      }
      
      // Format the conversation for email
      const emailContent = await formatConversationForEmail(
        messages, 
        userName, 
        userEmail, 
        detectedContacts.phones[0] || userPhone
      );
      
      // Get the email service URL from environment variables
      const emailServiceUrl = 'http://localhost:8000/api/send-email';
      console.log('Sending email via', emailServiceUrl);
      console.log('User details:', { userName, userEmail, userPhone });
      
      const response = await fetch(emailServiceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'leandro.justino@dengun.com',
          subject: `New Contact Information from Chat: ${userName}`,
          content: emailContent,
          userName,
          userEmail,
          userPhone: detectedContacts.phones[0] || userPhone
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Email sent successfully:', data);
        setEmailSent(true);
      } else {
        const errorData = await response.text();
        console.error('Failed to send email:', errorData);
        throw new Error(`Failed to send email: ${response.status} ${errorData}`);
      }
    } catch (error) {
      console.error('Error sending contact email:', error);
      // Still mark as processed even if there's an error
      // This prevents multiple attempts with the same contact info
      setEmailSent(true);
    } finally {
      setIsLoading(false);
    }
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
            {t('aiAssistant')}
          </div>
          <button 
            className="settings-button"
            onClick={() => setIsSettingsOpen(true)}
            title={t('settings')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>

        <div className="chat-messages" ref={messagesContainerRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? (
                  <img 
                    src={userPhotoUrl || userIcon} 
                    alt="User" 
                    className="w-6 h-6 object-cover rounded-full" 
                  />
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
                  {formatDistanceToNow(message.timestamp, { 
                    addSuffix: true,
                    includeSeconds: true,
                    locale: {
                      formatDistance: (token, count) => {
                        const translations = {
                          lessThanXSeconds: t('justNow'),
                          xSeconds: t('justNow'),
                          halfAMinute: t('justNow'),
                          lessThanXMinutes: `${count} ${t('minutes')} ${t('ago')}`,
                          xMinutes: `${count} ${t('minutes')} ${t('ago')}`,
                          aboutXHours: `${count} ${t('hours')} ${t('ago')}`,
                          xHours: `${count} ${t('hours')} ${t('ago')}`,
                          xDays: `${count} ${t('days')} ${t('ago')}`,
                          aboutXWeeks: `${count} ${t('weeks')} ${t('ago')}`,
                          xWeeks: `${count} ${t('weeks')} ${t('ago')}`,
                          aboutXMonths: `${count} ${t('months')} ${t('ago')}`,
                          xMonths: `${count} ${t('months')} ${t('ago')}`,
                          aboutXYears: `${count} ${t('years')} ${t('ago')}`,
                          xYears: `${count} ${t('years')} ${t('ago')}`,
                          overXYears: `${count} ${t('years')} ${t('ago')}`,
                          almostXYears: `${count} ${t('years')} ${t('ago')}`
                        };
                        return translations[token] || '';
                      }
                    }
                  })}
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
                title={t('addEmoji')}
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
                    searchPlaceholder={t('searchEmoji')}
                    theme="dark"
                    skinTonesDisabled
                    lazyLoadEmojis
                  />
                </div>
              )}
            </div>
            {showSuggestedMessages && (
              <button 
                type="button"
                className="suggested-messages-button"
                onClick={handleSuggestedMessagesClick}
              >
                {t('suggestedMessages')}
              </button>
            )}
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t('sendMessage')}
              className="chat-input"
              disabled={isLoading}
              autoFocus
            />
            <button 
              type="button" 
              className={`message-action-button ${isLoading || isPlayingLastMessage || isPreparingVoiceAudio ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleMicClick}
              title={isLoading || isPlayingLastMessage || isPreparingVoiceAudio ? t('voiceBusy') : t('startVoiceChat')}
              disabled={isLoading || isPlayingLastMessage || isPreparingVoiceAudio}
            >
              {isPreparingVoiceAudio ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
              )}
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

        <div className="chat-disclaimer">
          {t('disclaimer')}
        </div>
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
        onClose={handleVoicePopupClose}
        isPlayingLastMessage={isPlayingLastMessage}
        isPreparingVoiceAudio={isPreparingVoiceAudio}
        isRecording={isRecording}
        isTranscribing={isTranscribing}
        onStopRecording={handleStopRecording}
        onStartRecording={handleStartRecording}
        currentAudioRef={currentAudioRef}
        isPaused={isPaused}
        onSkip={handlePauseResume}
      />
      {isSuggestedMessagesOpen && (
        <div className="suggested-messages-modal">
          <div className="suggested-messages-content">
            <div className="suggested-messages-header">
              <h3>{t('suggestedMessages')}</h3>
              <button 
                className="modal-close"
                onClick={handleSuggestedMessagesClose}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="suggested-messages-grid">
              {currentTooltips && currentTooltips.map((tooltip, index) => (
                <div
                  key={tooltip.id || index}
                  className="suggested-message-item"
                  onClick={() => handleSuggestedMessageSelect(tooltip.text)}
                >
                  {tooltip.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;