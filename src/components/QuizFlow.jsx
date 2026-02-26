import { useState, useCallback } from 'react';
import { createAuditLogger } from '../auditLogger';
import { LandingPage } from './LandingPage';
import { MultipleChoiceCard } from './MultipleChoiceCard';
import { DragToRank } from './DragToRank';
import { OpenEndedTextarea } from './OpenEndedTextarea';
import './QuizFlow.css';

export function QuizFlow({ onSubmit }) {
  const [state, setState] = useState('landing');
  const [logger] = useState(() => createAuditLogger());
  const [answers, setAnswers] = useState({
    multipleChoiceAnswers: {},
    dragRankResult: {},
    openEndedResponses: {},
  });

  const handleBegin = useCallback(() => {
    setState('q1');
  }, []);

  const handleQ1Answer = useCallback((answer) => {
    setAnswers((prev) => ({
      ...prev,
      multipleChoiceAnswers: {
        ...prev.multipleChoiceAnswers,
        q1: {
          question: 'You have one hour in a city you\'ve never been to. What do you do first?',
          answer,
        },
      },
    }));
  }, []);

  const handleQ1Continue = useCallback(() => {
    logger.logEvent('question_continue', 'q1');
    setState('q2');
  }, [logger]);

  const handleQ2Answer = useCallback((answer) => {
    setAnswers((prev) => ({
      ...prev,
      multipleChoiceAnswers: {
        ...prev.multipleChoiceAnswers,
        q2: {
          question: 'The recipe calls for an ingredient you don\'t have. You...',
          answer,
        },
      },
    }));
  }, []);

  const handleQ2Continue = useCallback(() => {
    logger.logEvent('question_continue', 'q2');
    setState('q3');
  }, [logger]);

  const handleQ3Answer = useCallback((order) => {
    setAnswers((prev) => ({
      ...prev,
      dragRankResult: {
        question: 'Put these in order of how your mind works naturally...',
        order,
      },
    }));
  }, []);

  const handleQ3Continue = useCallback(() => {
    logger.logEvent('question_continue', {
      question_id: 'q3',
      order: answers.dragRankResult.order || ['Feel', 'Think', 'Make', 'Move'],
    });
    setState('q4');
  }, [logger, answers.dragRankResult]);

  const handleQ4Answer = useCallback((text) => {
    setAnswers((prev) => ({
      ...prev,
      openEndedResponses: {
        ...prev.openEndedResponses,
        q4: {
          question: 'What\'s something most people walk past that you always stop for?',
          answer: text,
        },
      },
    }));
  }, []);

  const handleQ4Continue = useCallback(() => {
    logger.logEvent('question_continue', 'q4');
    setState('q5');
  }, [logger]);

  const handleQ5Answer = useCallback((text) => {
    setAnswers((prev) => ({
      ...prev,
      openEndedResponses: {
        ...prev.openEndedResponses,
        q5: {
          question: 'If your energy were a sound, what would it be?',
          answer: text,
        },
      },
    }));
  }, []);

  const handleQ5Submit = useCallback((text) => {
    const finalAnswers = {
      ...answers,
      openEndedResponses: {
        ...answers.openEndedResponses,
        q5: {
          question: 'If your energy were a sound, what would it be?',
          answer: text,
        },
      },
    };
    logger.logEvent('question_continue', 'q5');
    logger.logEvent('submit');
    const auditTrail = logger.getTrail();
    onSubmit(auditTrail, finalAnswers);
  }, [logger, answers, onSubmit]);

  return (
    <div className="quiz-flow">
      {state === 'landing' && (
        <LandingPage logger={logger} onBegin={handleBegin} />
      )}

      {state === 'q1' && (
        <div className="quiz-container">
          <div className="quiz-progress">Question 1 of 5</div>
          <MultipleChoiceCard
            questionId="q1"
            logger={logger}
            onAnswer={handleQ1Answer}
          />
          <button className="quiz-continue-btn" onClick={handleQ1Continue}>
            Continue →
          </button>
        </div>
      )}

      {state === 'q2' && (
        <div className="quiz-container">
          <div className="quiz-progress">Question 2 of 5</div>
          <MultipleChoiceCard
            questionId="q2"
            logger={logger}
            onAnswer={handleQ2Answer}
          />
          <button className="quiz-continue-btn" onClick={handleQ2Continue}>
            Continue →
          </button>
        </div>
      )}

      {state === 'q3' && (
        <div className="quiz-container">
          <div className="quiz-progress">Question 3 of 5</div>
          <DragToRank logger={logger} onAnswer={handleQ3Answer} />
          <button className="quiz-continue-btn" onClick={handleQ3Continue}>
            Continue →
          </button>
        </div>
      )}

      {state === 'q4' && (
        <div className="quiz-container">
          <div className="quiz-progress">Question 4 of 5</div>
          <OpenEndedTextarea
            questionId="q4"
            logger={logger}
            onAnswer={handleQ4Answer}
            onAdvance={handleQ4Continue}
            isLastQuestion={false}
          />
        </div>
      )}

      {state === 'q5' && (
        <div className="quiz-container">
          <div className="quiz-progress">Question 5 of 5</div>
          <OpenEndedTextarea
            questionId="q5"
            logger={logger}
            onAnswer={handleQ5Answer}
            onAdvance={handleQ5Submit}
            isLastQuestion={true}
          />
        </div>
      )}
    </div>
  );
}
