import React, { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { ref, onValue, set } from "firebase/database";
import { db } from "../firebase";

export interface AppContextType {
  isLive: boolean;
  setIsLive: (value: boolean) => void;
  lastSeen: string | null;
  setLastSeen: (value: string | null) => void;
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
  liveStartTime: number | null;
  setLiveStartTime: (v: number | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLive, _setIsLive] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(() => {
    return localStorage.getItem('lastSeen') || null;
  });

const setIsLive = (value: boolean) => {
  _setIsLive(value); 
  if (!value) {
    const now = new Date().toISOString();
    set(ref(db, "liveStatus/lastSeen"), now);
    setLastSeen(now);
  }
};
  const [currentMusic, setCurrentMusic] = useState<string>(() => {
    return localStorage.getItem('currentMusic') || '';
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(() => {
    const saved = localStorage.getItem('isMusicPlaying');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('volume');
    return saved !== null ? JSON.parse(saved) : 20;
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


  useEffect(() => {
  const statusRef = ref(db, "liveStatus");

  return onValue(statusRef, (snap) => {
    const data = snap.val();
    if (!data) return;

    _setIsLive(data.isLive);
    setCountdownTime(data.remaining ?? 900);
    setIsCountdownActive(data.isLive);
    setLastSeen(data.lastSeen || null);
  });
}, []);


  useEffect(() => {
  if (!isCountdownActive) return;

  const timer = setInterval(() => {
    setCountdownTime(prev => {
      if (prev <= 1) {
        const now = new Date().toISOString();       
        // set(ref(db, "liveStatus/isLive"), false);

        set(ref(db, "liveStatus/remaining"), 0);
        set(ref(db, "liveStatus/lastSeen"), now);
        setLastSeen(now);
        return 0;
      }

      const next = prev - 1;
      set(ref(db, "liveStatus/remaining"), next);
      return next;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [isCountdownActive]);




  // Centralized audio element so play() can be invoked from user gesture handlers
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const a = new Audio();
    a.loop = true;
    a.preload = 'auto';
    a.crossOrigin = 'anonymous';
    audioRef.current = a;

    const onPlay = () => setIsMusicPlaying(true);
    const onPause = () => setIsMusicPlaying(true);

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
    try {
      localStorage.setItem('currentMusic', currentMusic);
    } catch (e) {
      console.error('Failed to save currentMusic to localStorage:', e);
    }
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


const [liveStartTime, setLiveStartTime] = useState<number | null>(() => {
  const saved = localStorage.getItem("liveStartTime");
  return saved ? JSON.parse(saved) : null;
});

  // Playback helpers
  const playAudio = useCallback(async (url?: string) => {
    if (!audioRef.current) audioRef.current = new Audio();

    try {
      const audio = audioRef.current;

      // Determine which URL to play
      const musicUrl = url || currentMusic;
      if (!musicUrl) return;

      // Only reload if URL changed
      if (!audio.src.includes(musicUrl)) {
        audio.src = musicUrl;
        audio.load();
      }

      audio.volume = Math.max(0, Math.min(1, volume / 100));
      await audio.play();
      setIsMusicPlaying(true);
  } catch (err) {
    console.log("playAudio error:", err);
    setIsMusicPlaying(false);
  }
  }, [currentMusic, volume]);

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
    const savedLive = localStorage.getItem("isLive");
    const savedCountdown = localStorage.getItem("countdownTime");
    const savedActive = localStorage.getItem("isCountdownActive");

    if (savedLive !== null) setIsLive(JSON.parse(savedLive));
    if (savedCountdown !== null) setCountdownTime(JSON.parse(savedCountdown));
    if (savedActive !== null) setIsCountdownActive(JSON.parse(savedActive));
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);


  return (
    <AppContext.Provider value={{
      isLive,
      setIsLive,
      lastSeen,
      setLastSeen,
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
      liveStartTime,
      setLiveStartTime,
    }}>
      {children}
    </AppContext.Provider>
  );
};


