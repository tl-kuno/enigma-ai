import { useState } from 'react';
import { QuizFlow } from './components/QuizFlow';
import LoadingState from './components/LoadingState';
import RevealCard from './components/RevealCard';
import FollowUpQuestion from './components/FollowUpQuestion';
import { getEnigma, generateImage, getEnigmaWithFollowUp } from './enigmaApi';
import './App.css';

function App() {
  // State machine: quiz | loading | followup | reveal | error
  const [appState, setAppState] = useState('quiz');
  const [enigma, setEnigma] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [followUpQuestion, setFollowUpQuestion] = useState(null);
  const [originalPayload, setOriginalPayload] = useState(null);
  const [error, setError] = useState(null);

  const handleQuizSubmit = async (auditTrail, answers) => {
    try {
      setError(null);
      setAppState('loading');
      
      // Assemble complete payload
      const payload = {
        multipleChoiceAnswers: answers.multipleChoiceAnswers,
        dragRankResult: answers.dragRankResult,
        openEndedResponses: answers.openEndedResponses,
        auditTrail,
      };
      
      setOriginalPayload(payload);
      
      // Fire DALL-E in parallel as soon as image_prompt streams in
      let imagePromise = null;
      const onImagePrompt = (prompt) => {
        console.log('Image prompt detected in stream, firing DALL-E:', prompt);
        imagePromise = generateImage(prompt).catch((err) => {
          console.warn('Image generation failed:', err);
          return null;
        });
      };
      
      // Call Claude API with streaming
      const response = await getEnigma(payload, onImagePrompt);
      
      // Route based on response type
      if (response.follow_up) {
        setFollowUpQuestion(response.follow_up);
        setAppState('followup');
      } else {
        // Full output received — wait for image if it was started
        setEnigma(response);
        
        if (imagePromise) {
          const url = await imagePromise;
          setImageUrl(url);
        } else {
          // Fallback: image_prompt wasn't detected mid-stream, fire now
          try {
            const url = await generateImage(response.image_prompt);
            setImageUrl(url);
          } catch (imageError) {
            console.warn('Image generation failed, showing text-only card:', imageError);
            setImageUrl(null);
          }
        }
        
        setAppState('reveal');
      }
    } catch (err) {
      console.error('Error processing quiz:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setAppState('error');
    }
  };

  const handleFollowUpSubmit = async (answer) => {
    try {
      setError(null);
      setAppState('loading');
      
      // Fire DALL-E in parallel as soon as image_prompt streams in
      let imagePromise = null;
      const onImagePrompt = (prompt) => {
        console.log('Image prompt detected in follow-up stream, firing DALL-E:', prompt);
        imagePromise = generateImage(prompt).catch((err) => {
          console.warn('Image generation failed:', err);
          return null;
        });
      };
      
      // Call Claude API with follow-up response
      const response = await getEnigmaWithFollowUp(
        originalPayload,
        followUpQuestion,
        answer,
        onImagePrompt
      );
      
      setEnigma(response);
      
      if (imagePromise) {
        const url = await imagePromise;
        setImageUrl(url);
      } else {
        try {
          const url = await generateImage(response.image_prompt);
          setImageUrl(url);
        } catch (imageError) {
          console.warn('Image generation failed, showing text-only card:', imageError);
          setImageUrl(null);
        }
      }
      
      setAppState('reveal');
    } catch (err) {
      console.error('Error processing follow-up:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setAppState('error');
    }
  };

  const handleRetry = () => {
    setAppState('quiz');
    setEnigma(null);
    setImageUrl(null);
    setFollowUpQuestion(null);
    setOriginalPayload(null);
    setError(null);
  };

  return (
    <div className="app">
      <div className={`app-screen app-screen-${appState}`}>
        {appState === 'quiz' && (
          <QuizFlow onSubmit={handleQuizSubmit} />
        )}
        
        {appState === 'loading' && (
          <LoadingState />
        )}
        
        {appState === 'followup' && followUpQuestion && (
          <FollowUpQuestion 
            question={followUpQuestion}
            onSubmit={handleFollowUpSubmit}
          />
        )}
        
        {appState === 'reveal' && enigma && (
          <RevealCard enigma={enigma} imageUrl={imageUrl} />
        )}
        
        {appState === 'error' && (
          <div className="app-error">
            <div className="error-content">
              <h2>Something went wrong</h2>
              <p>{error}</p>
              <button onClick={handleRetry} className="retry-button">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
