import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface AppContextType {
  isLive: boolean;
  setIsLive: (value: boolean) => void;
  currentMusic: string;
  setCurrentMusic: (url: string) => void;
  isMusicPlaying: boolean;
  setIsMusicPlaying: (value: boolean) => void;
  volume: number;
  setVolume: (value: number) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  playAudio: (url?: string) => Promise<void>;
  pauseAudio: () => void;
  stopAudio: () => void;
  isAudioAllowed: boolean;
  setIsAudioAllowed: (v: boolean) => void;
  countdownTime: number;
  setCountdownTime: React.Dispatch<React.SetStateAction<number>>;
  isCountdownActive: boolean;
  setIsCountdownActive: (value: boolean) => void;
  backgroundImages: string[];
  setBackgroundImages: React.Dispatch<React.SetStateAction<string[]>>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLive, setIsLive] = useState<boolean>(() => {
    const saved = localStorage.getItem('isLive');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [currentMusic, setCurrentMusic] = useState<string>(() => {
    return localStorage.getItem('currentMusic') || '';
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(() => {
    const saved = localStorage.getItem('isMusicPlaying');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('volume');
    return saved !== null ? JSON.parse(saved) : 50;
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('isDarkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [isAudioAllowed, setIsAudioAllowed] = useState<boolean>(true);
  const [countdownTime, setCountdownTime] = useState<number>(() => {
    const saved = localStorage.getItem('countdownTime');
    return saved !== null ? JSON.parse(saved) : 900;
  });
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('isCountdownActive');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [backgroundImages, setBackgroundImages] = useState<string[]>(() => {
    const saved = localStorage.getItem('backgroundImages');
    return saved !== null ? JSON.parse(saved) : [];
  });

  // Centralized audio element so play() can be invoked from user gesture handlers
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio();
    a.loop = true;
    a.preload = 'auto';
    a.crossOrigin = 'anonymous';
    audioRef.current = a;

    const onPlay = () => setIsMusicPlaying(true);
    const onPause = () => setIsMusicPlaying(false);

    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);

    return () => {
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.pause();
      audioRef.current = null;
    };
  }, []);



  useEffect(() => {
    localStorage.setItem('currentMusic', currentMusic);
  }, [currentMusic]);

  useEffect(() => {
    localStorage.setItem('isMusicPlaying', JSON.stringify(isMusicPlaying));
  }, [isMusicPlaying]);

  useEffect(() => {
    localStorage.setItem('volume', JSON.stringify(volume));
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    // Apply dark mode class to root element
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('countdownTime', JSON.stringify(countdownTime));
  }, [countdownTime]);

  useEffect(() => {
    localStorage.setItem('isCountdownActive', JSON.stringify(isCountdownActive));
  }, [isCountdownActive]);

  useEffect(() => {
    localStorage.setItem('backgroundImages', JSON.stringify(backgroundImages));
  }, [backgroundImages]);

  useEffect(() => {
    localStorage.setItem('isLive', JSON.stringify(isLive));
  }, [isLive]);

  // Playback helpers
  const playAudio = useCallback(async (url?: string) => {
    if (!audioRef.current) return;
    try {
      let needsLoad = false;
      if (url) {
        setCurrentMusic(url);
        if (audioRef.current.src !== url) {
          audioRef.current.src = url;
          needsLoad = true;
        }
      } else if (currentMusic) {
        if (audioRef.current.src !== currentMusic) {
          audioRef.current.src = currentMusic;
          needsLoad = true;
        }
      }

      if (needsLoad) {
        audioRef.current.load();
        // Wait for the audio to be ready
        await new Promise((resolve, reject) => {
          if (!audioRef.current) return reject(new Error('No audio element'));

          const onCanPlay = () => {
            audioRef.current?.removeEventListener('canplay', onCanPlay);
            audioRef.current?.removeEventListener('error', onError);
            resolve(void 0);
          };

          const onError = () => {
            audioRef.current?.removeEventListener('canplay', onCanPlay);
            audioRef.current?.removeEventListener('error', onError);
            reject(new Error('Audio failed to load'));
          };

          audioRef.current.addEventListener('canplay', onCanPlay);
          audioRef.current.addEventListener('error', onError);

          // Timeout after 10 seconds
          setTimeout(() => {
            audioRef.current?.removeEventListener('canplay', onCanPlay);
            audioRef.current?.removeEventListener('error', onError);
            reject(new Error('Audio load timeout'));
          }, 10000);
        });
      }

      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));

      // Always try to play
      await audioRef.current.play();
      setIsMusicPlaying(true);
    } catch (err) {
      console.error('playAudio error:', err);
      setIsMusicPlaying(false);
      throw err; // Re-throw to allow caller to handle
    }
  }, [currentMusic, volume, isAudioAllowed, setCurrentMusic, setIsMusicPlaying]);

  const pauseAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsMusicPlaying(false);
  }, [setIsMusicPlaying]);

  const stopAudio = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    try {
      audioRef.current.currentTime = 0;
    } catch {
      // ignore
    }
    try {
      // unload source so audio truly stops across views
      audioRef.current.src = '';
      audioRef.current.load();
    } catch {
      // ignore
    }
    setCurrentMusic('');
    setIsMusicPlaying(false);
  }, [setCurrentMusic, setIsMusicPlaying]);

  // Listen for storage changes to sync across tabs
  useEffect(() => {
    const handleStorageChange = () => {
      // Implementation removed for simplicity
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AppContext.Provider value={{
      isLive,
      setIsLive,
      currentMusic,
      setCurrentMusic,
      isMusicPlaying,
      setIsMusicPlaying,
      volume,
      setVolume,
      isDarkMode,
      setIsDarkMode,
      playAudio,
      pauseAudio,
      stopAudio,
      isAudioAllowed,
      setIsAudioAllowed,
      countdownTime,
      setCountdownTime,
      isCountdownActive,
      setIsCountdownActive,
      backgroundImages,
      setBackgroundImages,
    }}>
      {children}
    </AppContext.Provider>
  );
};


