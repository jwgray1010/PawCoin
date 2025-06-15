import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

/**
 * List of supported Barkley animations.
 * Extend as needed for new 3D model animations.
 */
export const barkleyAnimations = [
  'idle', 'rest', 'idle1', 'idle2', 'jump', 'walk', 'run', 'run2',
  'falls1', 'fall2', 'falls3', 'wakesup1', 'wakesup2', 'wakesup3',
  'no', 'yes', 'waving', 'happy', 'attack1', 'attack2', 'dmg1', 'dmg2'
];

/**
 * BarkleyContext provides AR Barkley's state and actions.
 */
const BarkleyContext = createContext();

/**
 * useBarkley - React hook for Barkley AR assistant state/actions.
 * @returns {object} Barkley state and control functions
 */
export function useBarkley() {
  return useContext(BarkleyContext);
}

/**
 * BarkleyProvider - Context provider for Barkley AR assistant.
 * Wrap your AR scene or app with this.
 */
export function BarkleyProvider({ children }) {
  const [bubbleText, setBubbleText] = useState('');
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [animation, setAnimation] = useState('idle');
  const [sound, setSound] = useState(null); // e.g., 'bark', 'celebrate'
  const bubbleTimeout = useRef(null);
  const animationQueue = useRef([]);
  const soundQueue = useRef([]);
  const animating = useRef(false);
  const sounding = useRef(false);

  // Show Barkley's speech bubble
  const speak = useCallback((text, { autoHide = true, duration = 3500 } = {}) => {
    setBubbleText(text);
    setBubbleVisible(true);
    if (bubbleTimeout.current) clearTimeout(bubbleTimeout.current);
    if (autoHide) {
      bubbleTimeout.current = setTimeout(() => setBubbleVisible(false), duration);
    }
  }, []);

  // Hide Barkley's speech bubble
  const hideBubble = useCallback(() => {
    setBubbleVisible(false);
    if (bubbleTimeout.current) clearTimeout(bubbleTimeout.current);
  }, []);

  // Play a Barkley sound (queue if busy)
  const playSound = useCallback((soundName) => {
    if (sounding.current) {
      soundQueue.current.push(soundName);
      return;
    }
    setSound(soundName);
    sounding.current = true;
    setTimeout(() => {
      setSound(null);
      sounding.current = false;
      if (soundQueue.current.length > 0) {
        playSound(soundQueue.current.shift());
      }
    }, 2000);
  }, []);

  // Set Barkley's animation (queue if busy)
  const animate = useCallback((animName, duration = 1200) => {
    if (animating.current) {
      animationQueue.current.push({ animName, duration });
      return;
    }
    setAnimation(animName);
    animating.current = true;
    if (animName !== 'idle') {
      setTimeout(() => {
        setAnimation('idle');
        animating.current = false;
        if (animationQueue.current.length > 0) {
          const next = animationQueue.current.shift();
          animate(next.animName, next.duration);
        }
      }, duration);
    } else {
      animating.current = false;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (bubbleTimeout.current) clearTimeout(bubbleTimeout.current);
      animationQueue.current = [];
      soundQueue.current = [];
    };
  }, []);

  return (
    <BarkleyContext.Provider
      value={{
        bubbleText,
        bubbleVisible,
        animation,
        sound,
        speak,
        hideBubble,
        playSound,
        animate,
        barkleyAnimations,
      }}
    >
      {children}
    </BarkleyContext.Provider>
  );
}