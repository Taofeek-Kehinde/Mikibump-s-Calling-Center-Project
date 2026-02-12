import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun, faArrowRightFromBracket, faPlay, faPause, faStop, faVolumeHigh, faUpload} from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from './context/useAppContext';
import { showAlert } from './utils/showAlert';
import { ref, set } from "firebase/database";
import { db } from "./firebase";
import './Admin.css';

function Admin() {
  const {
    isLive,
    // setIsLive,
    currentMusic,
    // setCurrentMusic,
    isMusicPlaying,
    // setIsMusicPlaying,
    volume,
    setVolume,
    isDarkMode,
    setIsDarkMode,
    playAudio,
    pauseAudio,
    stopAudio,
    setIsAudioAllowed,
    // setIsCountdownActive,
    // setCountdownTime,
    backgroundImages,
    setBackgroundImages,
    // liveStartTime,
    // setLiveStartTime,
  } = useAppContext();

  useEffect(() => {
    setIsAudioAllowed(false);
    pauseAudio();
    return () => setIsAudioAllowed(true);
  }, [setIsAudioAllowed, pauseAudio]);

  const navigate = useNavigate();
  // const musicFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  

const handleGoLive = () => {
  set(ref(db, "liveStatus"), {
    isLive: true,
    remaining: 900,
    lastSeen: null
  });
  // Set the hardcoded music when going live
  set(ref(db, 'music'), { url: '/music/music.mp3', playing: true });
};

const handleGoOffline = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const timeString = `${hours}:${minutes}:${seconds}`;

  set(ref(db, "liveStatus"), {
    isLive: false,
    remaining: 0,
    lastSeen: timeString // <-- store hh:mm:ss directly
  });
  // Stop music when going offline
  set(ref(db, 'music'), { url: '/music/music.mp3', playing: false });
};

const handleMusicUpload = (fileName: string) => {
  // Store the URL and playing status in Firebase
  const url = `/music/${fileName}`;
  set(ref(db, 'music'), { url, playing: true })
    .then(() => showAlert(`Music set: ${fileName}`, 'success'))
    .catch(err => console.error(err));
};


  const handlePlayPauseMusic = () => {
    if (isMusicPlaying) {
      // If playing, pause
      pauseAudio();
    } else {
      // If not playing, play
      if (!currentMusic) {
        showAlert('Please upload or select a music file first', 'error');
        return;
      }
      // Ensure volume is at least 30% when playing
      if (volume < 30) {
        setVolume(30);
      }
      playAudio().catch(() => {});
    }
  };


  const handleStopMusic = () => {
    set(ref(db, 'music/playing'), false);
    stopAudio();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImageUrls = Array.from(files).map(file => URL.createObjectURL(file));
      setBackgroundImages((prev: string[]) => [...prev, ...newImageUrls]);
      showAlert(`Uploaded ${files.length} background image(s)`, 'success');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    navigate('/admin/login');
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };


  return (
    <motion.div 
      className="admin-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div 
        className="admin-panel"
        initial={{ y: -50, scale: 0.9 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "backOut" }}
      >
        {/* Admin Header */}
        <div className="admin-header">
          <h1 className="admin-title">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              
            </motion.span>
            Admin Control Panel
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              
            </motion.span>
          </h1>
          
          <div className="header-buttons">
            {/* <motion.button
              className="elastis-btn"
              onClick={() => navigate('/admin/elastis')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="View Application Logs"
            >
              <FontAwesomeIcon icon={faFileAlt} />
              Elastis
            </motion.button> */}

            <motion.button
              className="theme-toggle-btn"
              onClick={handleThemeToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              <FontAwesomeIcon icon={isDarkMode ? faSun : faMoon} />
            </motion.button>

            <motion.button
              className="logout-btn"
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
              Logout
            </motion.button>
          </div>
        </div>

        {/* Status Section */}
        <motion.div 
          className="status-section"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="status-indicator">
            <div className={`status-dot ${isLive ? 'live' : 'offline'}`}></div>
            <span className="status-text">
              Dashboard Status: <strong>{isLive ? 'LIVE' : 'OFFLINE'}</strong>
            </span>
          </div>
          
          <div className="music-status">
            <div className="music-wave">
              {isMusicPlaying && currentMusic && (
                <>
                  <motion.div animate={{ height: ['10px', '20px', '10px'] }} transition={{ duration: 0.5, repeat: Infinity }} />
                  <motion.div animate={{ height: ['15px', '25px', '15px'] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />
                  <motion.div animate={{ height: ['20px', '30px', '20px'] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} />
                  <motion.div animate={{ height: ['15px', '25px', '15px'] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }} />
                  <motion.div animate={{ height: ['10px', '20px', '10px'] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }} />
                </>
              )}
            </div>
            <span className="music-status-text">
              Music: <strong>{isMusicPlaying ? 'PLAYING' : 'STOPPED'}</strong>
            </span>
          </div>
        </motion.div>

        {/* Live Control Buttons */}
        <motion.div 
          className="control-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="section-title">Live Status Control</h2>
          <div className="button-group">
            <motion.button
              className={`control-btn ${isLive ? 'active' : ''}`}
              onClick={handleGoLive}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isLive ? { 
                boxShadow: "0 0 20px rgba(46, 204, 113, 0.5)" 
              } : {}}
            >
              <span className="btn-icon">🟢</span>
              <span className="btn-text">GO LIVE</span>
              <motion.div 
                className="btn-pulse"
                animate={isLive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.button>
            
            <motion.button
              className={`control-btn offline ${!isLive ? 'active' : ''}`}
              onClick={handleGoOffline}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={!isLive ? {
                boxShadow: "0 0 20px rgba(220, 53, 69, 0.5)"
              } : {}}
            >
              <span className="btn-icon">🔴</span>
              <span className="btn-text">GO OFFLINE</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Image Upload Section */}
        <motion.div
          className="image-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="section-title">Background Images Control</h2>

          <div className="image-controls">
            <div className="image-upload">
              <input
                type="file"
                ref={imageFileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <motion.button
                className="upload-btn"
                onClick={() => imageFileInputRef.current?.click()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faUpload} />
                Upload Background Images
              </motion.button>
            </div>

            <div className="image-count">
              <span>Images uploaded: {backgroundImages.length}</span>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}

export default Admin;
