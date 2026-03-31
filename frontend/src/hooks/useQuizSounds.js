import { useEffect, useRef } from 'react';

function createTone(context, { frequency, duration, type = 'sine', gain = 0.03, delay = 0 }) {
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  const startAt = context.currentTime + delay;
  const stopAt = startAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  volume.gain.setValueAtTime(0.0001, startAt);
  volume.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
  volume.gain.exponentialRampToValueAtTime(0.0001, stopAt);

  oscillator.connect(volume);
  volume.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(stopAt);
}

export default function useQuizSounds() {
  const audioContextRef = useRef(null);

  useEffect(() => () => {
    audioContextRef.current?.close?.();
  }, []);

  function getContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  }

  function playCorrect() {
    const context = getContext();
    if (!context) return;
    createTone(context, { frequency: 520, duration: 0.12, type: 'triangle', gain: 0.03 });
    createTone(context, { frequency: 780, duration: 0.16, type: 'triangle', gain: 0.025, delay: 0.08 });
  }

  function playWrong() {
    const context = getContext();
    if (!context) return;
    createTone(context, { frequency: 210, duration: 0.18, type: 'sawtooth', gain: 0.025 });
    createTone(context, { frequency: 160, duration: 0.22, type: 'sawtooth', gain: 0.02, delay: 0.07 });
  }

  function playTick() {
    const context = getContext();
    if (!context) return;
    createTone(context, { frequency: 940, duration: 0.05, type: 'square', gain: 0.012 });
  }

  function playTimeout() {
    const context = getContext();
    if (!context) return;
    createTone(context, { frequency: 240, duration: 0.14, type: 'triangle', gain: 0.018 });
    createTone(context, { frequency: 180, duration: 0.2, type: 'triangle', gain: 0.018, delay: 0.12 });
  }

  return {
    playCorrect,
    playWrong,
    playTick,
    playTimeout
  };
}
