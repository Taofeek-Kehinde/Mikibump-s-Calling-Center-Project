import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointLeft } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from '../context/useAppContext';
import { showAlert } from '../utils/showAlert';
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import './dashboard.css';
import af1 from '../assets/af1.jpg';
import af2 from '../assets/af2.jpg';
import af3 from '../assets/af3.jpg';
import af4 from '../assets/af4.jpg';
import af5 from '../assets/af5.jpg';
import af6 from '../assets/af6.jpg';
import af7 from '../assets/af7.jpg';
import af8 from '../assets/af8.jpg';
import af9 from '../assets/af9.jpg';
import af10 from '../assets/af10.jpg';

function Dashboard() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [pulse, setPulse] = useState(true);
  const { 
    isLive, 
    setIsLive, 
    currentMusic, 
    setCurrentMusic,
    isMusicPlaying, 
    setIsAudioAllowed, 
    playAudio, 
    stopAudio, 
    liveStartTime,      
    setLiveStartTime, 
    countdownTime, 
    setCountdownTime, 
    // isCountdownActive, 
    setIsCountdownActive 
  } = useAppContext();
  const prevIsLiveRef = useRef(isLive);
const formatTime = (time: number) => {
  const m = Math.floor(time / 60);
  const s = time % 60;
  return `${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
};


  const lastSeen = localStorage.getItem('lastSeen');
const lastSeenFormatted = lastSeen
  ? new Date(lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  : '';


  useEffect(() => {
  const musicRef = ref(db, "music");

  return onValue(musicRef, (snap) => {
    const data = snap.val();
    if (!data) return;

    setCurrentMusic(data.url);

    if (data.playing) {
      playAudio(data.url).catch(() => {});
    } else {
      stopAudio();
    }
  });
}, []);

// Auto-play whenever currentMusic changes
useEffect(() => {
  if (currentMusic) {
    playAudio(currentMusic).catch(() => {
      console.log("User must interact to start music");
    });
  }
}, [currentMusic, playAudio]);

useEffect(() => {
    // enable audible playback when dashboard is mounted
    setIsAudioAllowed(true);
    // If there's music, play it
    if (currentMusic) {
      playAudio().catch(() => {});
    }
    return () => setIsAudioAllowed(false);
  }, [setIsAudioAllowed, currentMusic, playAudio]);

  // Control playback based on isMusicPlaying state
  useEffect(() => {
    if (currentMusic && isMusicPlaying) {
      // try to play; if blocked, retry shortly
      playAudio().catch(() => {
        setTimeout(() => playAudio().catch(() => {}), 300);
      });
    } else if (!isMusicPlaying) {
      stopAudio();
    }
  }, [currentMusic, isMusicPlaying, playAudio, stopAudio]);

  // Live indicator pulse animation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 1500);
    return () => clearInterval(interval);
  }, [isLive]);

  // Countdown timer decrement
useEffect(() => {
  if (!isLive || !liveStartTime) return;

  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - liveStartTime) / 1000);
    const remaining = 900 - elapsed; // 15 minutes

    if (remaining > 0) {
      setCountdownTime(remaining);
    } else {
      // AUTO OFFLINE
      setCountdownTime(0);
      setIsLive(false);
      setIsCountdownActive(false);

      const now = new Date();
      localStorage.setItem("lastSeen", now.toISOString());

      setLiveStartTime(null);
      localStorage.removeItem("liveStartTime");
    }
  }, 1000);

  return () => clearInterval(interval);
}, [isLive, liveStartTime]);




  // Detect when live ends and show alert
  useEffect(() => {
    if (prevIsLiveRef.current && !isLive) {
      showAlert('LIVE HAS ENDED');
    }
    prevIsLiveRef.current = isLive;
  }, [isLive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      showAlert(`Code submitted: ${code}`);
      setCode('');
    }
  };

  const images = [af1, af2, af3, af4, af5, af6, af7, af8, af9, af10];
  const [bgIndex, setBgIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const displayTime = 3700; // display image for 3.7s
    const fadeTime = 300; // fade for 0.3s
    const totalCycle = displayTime + fadeTime; // 4s total

    const interval = setInterval(() => {
      setIsFading(true); // start fade
      setTimeout(() => {
        setBgIndex(i => (i + 1) % images.length); // change image
        setIsFading(false); // fade in
      }, fadeTime);
    }, totalCycle);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="dashboard">
      {/* Background with zoom animation and crossfade */}
      <motion.div
        className="background-carousel"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
      >
        <div
          className="background-image"
          style={{
            backgroundImage: `url(${images[bgIndex]})`,
            opacity: isFading ? 0 : 1,
          }}
        />
        <div
          className="background-image"
          style={{
            backgroundImage: `url(${images[(bgIndex + 1) % images.length]})`,
            opacity: isFading ? 1 : 0,
          }}
        />
        <div className="image-overlay"></div>
      </motion.div>

      {/* Main Content Container */}
      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0, y: 50, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, ease: "easeOut", type: "spring", stiffness: 100 }}
      >
     <div className="live-hint-wrapper">
  <div
    className={`live-hint-text ${isLive ? "live" : "offline"}`}
    key={isLive ? "live" : "offline"} // optional, triggers re-render
  >
    {isLive
      ? "Click the LIVE button to fill the form"
      : "We are currently OFFLINE, we will get back to you as soon as possible"}
  </div>
</div>

        {/* Header with Live Indicator */}
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="header-content">
            {isLive ? (
              <>
                <div
                  className="live-pointer"
                  onClick={() => navigate('/form')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { 
                    if (e.key === 'Enter' || e.key === ' ') navigate('/form'); 
                  }}
                >
                  <FontAwesomeIcon icon={faHandPointLeft} className="hand-icon" />
                </div>

                <motion.div
                  className="live-indicator-container"
                  animate={{ scale: pulse ? 1 : 1.05 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  onClick={() => navigate('/form')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      navigate('/form');
                    }
                  }}
                >
                  <div className="live-indicator">
  <div className="live-row">
    <span className="live-texts">LIVE</span>
    <span className="live-dot"></span>
  </div>

  <span className="live-time">{formatTime(countdownTime)}</span>
</div>
                  <motion.div
                    className="live-pulse"
                    animate={{
                      scale: [1, 2],
                      opacity: [0.7, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                </motion.div>
              </>
            ) : (
              <motion.div
                className="live-indicator-container offline"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="live-indicator">
                  <div className="live-rows">
                  <span className="live-dot" style={{ background: '#dc3545' }}></span>
                 <span className='live-text'>OFFLINE</span> 
                </div>
              <span className="time">LAST SEEN {lastSeenFormatted}</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Code Input Section */}
        <motion.form
          className="code-input-section"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="input-container">
            <motion.div
              className="input-wrapper"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  // Play music on user interaction if available and not playing
                  if (currentMusic && !isMusicPlaying) {
                    playAudio().catch(() => {});
                  }
                }}
                
                className="code-input"
                required
              /> */}
             <div className='placeholder'>LIFE IS SWEET!</div> 


              <motion.div
                className="input-decoration"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 1 }}
              />
            </motion.div>

            {/* <motion.button
              type="submit"
              className="submit-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Submit
            </motion.button> */}
          </div>
        </motion.form>

      </motion.div>
    </div>
  );
}

export default Dashboard;