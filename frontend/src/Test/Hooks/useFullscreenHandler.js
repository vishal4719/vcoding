import { useEffect } from 'react';

export const useFullscreenHandler = (testStarted, onViolation, showTestEndedModal) => {
  useEffect(() => {
    if (!testStarted) return;

    const handleViolation = () => {
      // Don't trigger violation if test ended modal is shown
      if (showTestEndedModal) return;
      onViolation();
    };

    // Listen for fullscreen change
    const fullscreenChangeEvents = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];

    const fullscreenListener = () => {
      if (!document.fullscreenElement &&
          !document.webkitFullscreenElement &&
          !document.mozFullScreenElement &&
          !document.msFullscreenElement) {
        handleViolation();
      }
    };

    fullscreenChangeEvents.forEach(event => {
      document.addEventListener(event, fullscreenListener);
    });

    // Listen for tab/window switch
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Clean up
    return () => {
      fullscreenChangeEvents.forEach(event => {
        document.removeEventListener(event, fullscreenListener);
      });
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [testStarted, onViolation, showTestEndedModal]);
};

export const enterFullscreen = () => {
  const elem = document.documentElement;
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
};