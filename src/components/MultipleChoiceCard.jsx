import { useEffect, useState, useRef } from 'react';
import './MultipleChoiceCard.css';

const questions = {
  q1: {
    text: 'You have one hour in a city you\'ve never been to. What do you do first?',
    options: [
      'Start walking with no destination',
      'Find somewhere to sit and just watch',
      'Hit up the locals\' top rated place to eat',
      'Find the oldest part of the city and start there',
    ],
  },
  q2: {
    text: 'The recipe calls for an ingredient you don\'t have. You...',
    options: [
      'Improvise immediately, probably better this way',
      'Google a substitution',
      'Switch to ordering takeout',
      'Run to the store quick',
    ],
  },
};

export function MultipleChoiceCard({ questionId, logger, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const hasLoggedStartRef = useRef(false);
  const question = questions[questionId];

  useEffect(() => {
    if (!hasLoggedStartRef.current) {
      logger.logEvent('question_start', questionId);
      hasLoggedStartRef.current = true;
    }
  }, [questionId, logger]);

  const handleSelect = (optionIndex) => {
    const selectedOption = question.options[optionIndex];

    if (selected !== null && selected !== optionIndex) {
      // Answer changed
      const previousOption = question.options[selected];
      logger.logEvent('question_answer_change', {
        question: question.text,
        from: previousOption,
        to: selectedOption,
      });
    } else if (selected === null) {
      // First answer
      logger.logEvent('question_answer', {
        question: question.text,
        answer: selectedOption,
      });
    }

    setSelected(optionIndex);
    onAnswer(selectedOption);
  };

  return (
    <div className="multiple-choice-card">
      <div className="mc-header">
        <h2 className="mc-question">{question.text}</h2>
      </div>

      <div className="mc-options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`mc-option ${selected === index ? 'selected' : ''}`}
            onClick={() => handleSelect(index)}
          >
            <span className="mc-option-text">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
