import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase2";
import { motion } from "framer-motion";
import { FaWhatsapp, FaLink, FaHandPointRight, FaPlay, FaPause, FaRedo, FaSync } from "react-icons/fa";

import "./Qrform.css";

export default function Qrform() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [savedData, setSavedData] = useState<any>(null);
    const [isChecking, setIsChecking] = useState(true);
    
    // Text-to-speech state
    const [isTtsPlaying, setIsTtsPlaying] = useState(false);
    const [isTtsCompleted, setIsTtsCompleted] = useState(false);
    
    // Voice note state
    const [isVoicePlaying, setIsVoicePlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const checkQR = async () => {
            if (!id) {
                setIsChecking(false);
                return;
            }

            try {
                const docRef = doc(db, "submissions", id);
                const snap = await getDoc(docRef);

                if (snap.exists()) {
                    setSavedData(snap.data());
                }
            } catch (err) {
                console.error("Error checking QR:", err);
            } finally {
                setIsChecking(false);
            }
        };

        const timeoutId = setTimeout(() => {
            setIsChecking(false);
        }, 5000);

        checkQR();

        return () => clearTimeout(timeoutId);
    }, [id]);

    // Handle audio events for voice note
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            const handleEnded = () => {
                setIsVoicePlaying(false);
            };
            const handlePlay = () => setIsVoicePlaying(true);
            const handlePause = () => setIsVoicePlaying(false);
            
            audio.addEventListener('ended', handleEnded);
            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);
            
            return () => {
                audio.removeEventListener('ended', handleEnded);
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
            };
        }
    }, [savedData?.audioUrl]);

    if (isChecking) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                color: 'white'
            }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (!savedData) {
        return (
            <div className="qrform-container">
                <div className="qrform-card">
                    <h2>QR Not Found</h2>
                    <p>This QR code is not valid or has expired.</p>
                    <button 
                        className="submit-btn" 
                        onClick={() => navigate('/')}
                        style={{ marginTop: '20px' }}
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    // Play text-to-speech function with child-like voice
    const playTextToSpeech = (text: string) => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsTtsPlaying(false);
        } else {
            setIsTtsPlaying(true);
            setIsTtsCompleted(false);
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.5;
            utterance.lang = 'en-US';
            
            utterance.onend = () => {
                setIsTtsPlaying(false);
                setIsTtsCompleted(true);
            };
            utterance.onerror = () => {
                setIsTtsPlaying(false);
            };
            
            window.speechSynthesis.speak(utterance);
        }
    };

    // Toggle voice playback
    const toggleVoicePlayback = () => {
        if (audioRef.current) {
            if (isVoicePlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    };

    // Replace/reload voice
    const replaceVoice = () => {
        if (audioRef.current) {
            audioRef.current.load();
            audioRef.current.play();
        }
    };

    return (
        <div className="qrform-container">
            <motion.button
                className="cany-home-btn"
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                title="Open Cany Form"
                style={{
                    position: "fixed",
                    top: 20,
                    right: 20,
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "red",
                    border: "none",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    zIndex: 9999,
                }}
            >
                <span
                    style={{
                        position: "absolute",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        color: "#fff",
                        textTransform: "uppercase",
                        pointerEvents: "none",
                    }}
                >
                    HOME
                </span>

                <FaHandPointRight
                    className="lefthands"
                    style={{
                        fontSize: "1.6rem",
                        color: "red",
                        animation: "hand-point 1.2s ease-in-out infinite",
                        transformOrigin: "center",
                        marginRight: "120px",
                        position: "absolute",
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.12))",
                    }}
                />
            </motion.button>

            <div className="qrform-card">
                <h2>TALK IN CANDY</h2>

                {/* Voice Note Section */}
                {savedData.contentMode === 'voice' && savedData.audioUrl && (
                    <div className="audio-section">
                        <h3>Voice Message</h3>
                        <audio 
                            ref={audioRef}
                            src={savedData.audioUrl}
                            style={{ width: '100%' }}
                        >
                            Your browser does not support audio.
                        </audio>
                        <div className="audio-controls">
                            <button 
                                className="play-audio-btn"
                                onClick={toggleVoicePlayback}
                            >
                                {isVoicePlaying ? <FaPause /> : <FaPlay />} 
                                {isVoicePlaying ? " Pause" : " Play"}
                            </button>
                            <button 
                                className="play-audio-btn replace-btn"
                                onClick={replaceVoice}
                            >
                                <FaSync /> Replace
                            </button>
                        </div>
                    </div>
                )}

                {/* Text to Speech Section - With play/pause/replay */}
                {savedData.contentMode === 'text' && savedData.textMessage && (
                    <div className="text-section">
                        {isTtsCompleted ? (
                            <button 
                                className="play-audio-btn"
                                onClick={() => playTextToSpeech(savedData.textMessage)}
                            >
                                <FaRedo /> Replay
                            </button>
                        ) : isTtsPlaying ? (
                            <button 
                                className="play-audio-btn"
                                onClick={() => {
                                    window.speechSynthesis.cancel();
                                    setIsTtsPlaying(false);
                                }}
                            >
                                <FaPause /> Pause
                            </button>
                        ) : (
                            <button 
                                className="play-audio-btn"
                                onClick={() => playTextToSpeech(savedData.textMessage)}
                            >
                                <FaPlay /> Play Message
                            </button>
                        )}
                    </div>
                )}

                {/* WhatsApp Contact */}
                {savedData.whatsappNumber && (
                    <button
                        className="action-btn whatsapp-btn"
                        onClick={() =>
                            window.open(
                                `https://wa.me/${savedData.whatsappNumber}?text=Hi, I scanned your Candy QR`,
                                "_blank"
                            )
                        }
                    >
                        <FaWhatsapp className="btn-icon" />
                        <span>Chat on WhatsApp</span>
                    </button>
                )}

                {/* Social Media Link */}
                {savedData.link && (
                    <button
                        className="action-btn url-btn"
                        onClick={() => window.open(savedData.link, "_blank")}
                    >
                        <FaLink className="btn-icon" />
                        <span>CHECK THIS OUT</span>
                    </button>
                )}
            </div>
        </div>
    );
}
