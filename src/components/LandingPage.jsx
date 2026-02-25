import { useEffect } from 'react';
import './LandingPage.css';

export function LandingPage({ logger, onBegin }) {
  useEffect(() => {
    logger.init();
  }, [logger]);

  const handleHover = (area) => {
    logger.logEvent('landing_hover', area);
  };

  const handleBegin = () => {
    logger.logEvent('begin_click');
    onBegin();
  };

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div
          className="landing-hero"
          onMouseEnter={() => handleHover('hero')}
          onMouseLeave={() => {}}
        >
          You've been using AI. You haven't met it yet.
        </div>

        <div
          className="landing-subtitle"
          onMouseEnter={() => handleHover('subtitle')}
          onMouseLeave={() => {}}
        >
          Five questions. One revelation.
        </div>

        <button className="landing-button" onClick={handleBegin}>
          Begin →
        </button>

        <div
          className="landing-fine-print"
          onMouseEnter={() => handleHover('fine_print')}
          onMouseLeave={() => {}}
        >
          No wrong answers. Just yours.
        </div>
      </div>
    </div>
  );
}
