import { useEffect, useRef, useState } from 'react';
import './OpenEndedTextarea.css';

const questions = {
  q4: 'What\'s something most people walk past that you always stop for?',
  q5: 'If your energy were a sound, what would it be?',
};

export function OpenEndedTextarea({ questionId, logger, onAnswer, onAdvance, isLastQuestion }) {
  const [text, setText] = useState('');
  const hasLoggedStartRef = useRef(false);
  const textareaRef = useRef(null);
  const backspaceHoldRef = useRef(null);
  const backspacePressTimeRef = useRef(null);

  const question = questions[questionId];
  const buttonText = isLastQuestion ? 'See your Enigma →' : 'Continue →';

  useEffect(() => {
    if (!hasLoggedStartRef.current) {
      logger.logEvent('question_start', questionId);
      hasLoggedStartRef.current = true;
    }
  }, [questionId, logger]);

  const handleKeyDown = (e) => {
    // Log every keydown with key content
    logger.logEvent('keydown', { key: e.key });

    // Handle special keys
    if (e.key === 'Backspace') {
      backspacePressTimeRef.current = Date.now();
      backspaceHoldRef.current = setTimeout(() => {
        if (backspacePressTimeRef.current) {
          const duration = Date.now() - backspacePressTimeRef.current;
          if (duration > 500) {
            logger.logEvent('backspace_hold', { duration_ms: duration });
          }
        }
      }, 500);
    } else if (e.ctrlKey || e.metaKey) {
      if (e.key === 'v' || e.code === 'KeyV') {
        // Paste will be handled in onPaste
      } else if (e.key === 'x' || e.code === 'KeyX') {
        logger.logEvent('cut');
      } else if (e.key === 'a' || e.code === 'KeyA') {
        logger.logEvent('select_all');
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Backspace' && backspaceHoldRef.current) {
      clearTimeout(backspaceHoldRef.current);
      backspacePressTimeRef.current = null;
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text/plain');
    logger.logEvent('paste', { text: pasted });
    setText(text + pasted);
  };

  const handleChange = (e) => {
    setText(e.target.value);
  };

  const handleFocus = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleContinue = () => {
    logger.logEvent('open_ended_final', {
      question,
      text,
    });
    onAnswer(text);
    if (onAdvance) onAdvance(text);
  };

  return (
    <div className="open-ended-card">
      <div className="oe-header">
        <h2 className="oe-question">{question}</h2>
      </div>

      <textarea
        ref={textareaRef}
        className="oe-textarea"
        placeholder="Type anything..."
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
      />

      <div className="oe-footer">
        <button className="oe-button" onClick={handleContinue}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
