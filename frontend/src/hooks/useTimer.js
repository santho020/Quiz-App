import { useState, useEffect } from 'react';

export default function useTimer(initialSeconds = 30, onTimeUp = null, resetKey = 'default', paused = false) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    setSeconds(initialSeconds);
    setIsActive(!paused);
  }, [initialSeconds, resetKey]);

  useEffect(() => {
    setIsActive(!paused && seconds > 0);
  }, [paused, seconds]);

  useEffect(() => {
    if (!isActive || seconds <= 0) return;

    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s - 1 <= 0) {
          clearInterval(interval);
          setIsActive(false);
          onTimeUp?.();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp, seconds, resetKey]);

  return { seconds, isActive, setSeconds, setIsActive };
}
