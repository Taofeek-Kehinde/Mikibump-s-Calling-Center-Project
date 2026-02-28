import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase2";
import { motion } from "framer-motion";
import { FaWhatsapp } from "react-icons/fa";
import { FaLink } from "react-icons/fa";
import { FaHandPointRight } from "react-icons/fa";

import "./Qrform.css";

export default function Qrform() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [savedData, setSavedData] = useState<any>(null);
    const [isChecking, setIsChecking] = useState(true);

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
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.5;
            utterance.lang = 'en-US';
            
            // Try to find a child-friendly voice
            const voices = window.speechSynthesis.getVoices();
            const childVoice = voices.find(voice => 
                voice.name.includes('Microsoft Zira') ||
                voice.name.includes('Samantha')
            );
            if (childVoice) {
                utterance.voice = childVoice;
            }
            
            window.speechSynthesis.speak(utterance);
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
                        <audio controls src={savedData.audioUrl} style={{ width: '100%' }}>
                            Your browser does not support audio.
                        </audio>
                        <p className="audio-label">Tap play to listen to the voice note</p>
                    </div>
                )}

                {/* Text to Speech Section */}
                {savedData.contentMode === 'text' && savedData.textMessage && (
                    <div className="text-section">
                        <h3>Text Message</h3>
                        <p className="message-text">{savedData.textMessage}</p>
                        <button 
                            className="play-audio-btn"
                            onClick={() => playTextToSpeech(savedData.textMessage)}
                        >
                            🔊 Play as Audio
                        </button>
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
                        <span>Visit Link</span>
                    </button>
                )}
            </div>
        </div>
    );
}
