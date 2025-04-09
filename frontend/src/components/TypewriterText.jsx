import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const TypewriterText = ({ text = '', speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Clean the input text first
    const cleanText = text
      .replace(/\s+/g, ' ')  // normalize whitespace
      .trim();
    
    if (!cleanText) {
      setDisplayedText('');
      setIsComplete(true);
      return;
    }

    // Reset states for new text
    setDisplayedText('');
    setIsComplete(false);

    let currentLength = 0;
    const timer = setInterval(() => {
      if (currentLength <= cleanText.length) {
        setDisplayedText(cleanText.substring(0, currentLength));
        currentLength++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  // If typing is complete and no text is showing, show full text as fallback
  const finalText = isComplete && !displayedText ? text : displayedText;

  return (
    <div className="message-content">
      <ReactMarkdown>{finalText}</ReactMarkdown>
    </div>
  );
};

export default TypewriterText; 