import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import './users.css';
import { FaMicrophone, FaPlay, FaPause, FaRedo, FaTimes, FaWhatsapp, FaLink, FaVolumeUp, FaStop, FaHandPointRight } from "react-icons/fa";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase2";
import { v4 as uuidv4 } from "uuid";
import { createChildVoice, stopSpeech } from "../utils/textToSpeech";

function Adminform(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [savedData, setSavedData] = useState<any>(null);
  const [customUrl, setCustomUrl] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  
  // Content mode: 'voice' or 'text'
  const [contentMode, setContentMode] = useState<'voice' | 'text'>('voice');
  // Text message for text-to-speech
  const [textMessage, setTextMessage] = useState('');
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  // Recording timer - countdown from 15
  const [recordingSeconds, setRecordingSeconds] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [submissionSaved, setSubmissionSaved] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get customUrl from query parameter
  useEffect(() => {
    const urlParam = searchParams.get('customUrl');
    if (urlParam) {
      setCustomUrl(decodeURIComponent(urlParam));
    }
  }, [searchParams]);

  // Check if this is an existing submission
  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (id) {
        try {
          const docRef = doc(db, "submissions", id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setSavedData(data);
            setWhatsappNumber(data.whatsappNumber || '');
            // Only consider the submission "saved" if it has actual content or whatsapp number
            const hasContent = !!(data.whatsappNumber || data.audioUrl || data.textMessage);
            if (hasContent) {
              // set content mode and relevant data
              if (data.contentMode === 'text') {
                setContentMode('text');
                setTextMessage(data.textMessage || '');
              } else if (data.contentMode === 'voice' && data.audioUrl) {
                setContentMode('voice');
                setAudioBase64(data.audioUrl);
                setRecordedAudioUrl(data.audioUrl);
              }
              setSubmissionSaved(true);
            } else {
              // placeholder only: do not mark as saved; allow the user to fill the form
              // but if the doc contains a link, keep it available
              if (data.link) {
                setCustomUrl(data.link);
              }
            }
          }
        } catch (err) {
          console.error("Error checking submission:", err);
        }
      }
    };

    checkExistingSubmission();
  }, [id]);

  // Create audio element when recordedAudioUrl is available (for mobile compatibility)
  useEffect(() => {
  if (recordedAudioUrl) {
    const audio = new Audio(recordedAudioUrl);

    audio.onended = () => setIsPlaying(false);
    audio.onerror = (e) => {
      console.error("Audio error:", e);
      setIsPlaying(false);
    };

    audioRef.current = audio;
  }

  return () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };
}, [recordedAudioUrl]);



  // Process and save the recorded audio
  const processRecording = () => {
    // Use audio/wav format for better mobile compatibility
    const blob = new Blob(audioChunks.current, {
  type: mediaRecorderRef.current?.mimeType || 'audio/webm'
});
    const url = URL.createObjectURL(blob);
    setRecordedAudioUrl(url);
    
    // Convert to base64 for Firestore storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAudioBase64(base64);
    };
    reader.readAsDataURL(blob);
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsRecording(false);
  };

  // START RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const options = {
  mimeType: 'audio/webm'
};

const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(15);
      
      // Start countdown timer - from 15 to 0
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // PLAY/STOP RECORDED AUDIO - mobile compatible
  const togglePlayback = () => {
    if (!recordedAudioUrl || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Playback failed:', error);
      });
      setIsPlaying(true);
    }
  };

  // Text-to-speech playback
  const toggleTtsPlayback = () => {
    // prefer the saved textMessage when present
    const textToSpeak = textMessage || (savedData && savedData.textMessage) || '';
    if (!textToSpeak) return;

    if (isTtsPlaying) {
      stopSpeech();
      setIsTtsPlaying(false);
    } else {
      setIsTtsPlaying(true);
      const utterance = createChildVoice(textToSpeak);
      utterance.onend = () => setIsTtsPlaying(false);
      utterance.onerror = () => setIsTtsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // SUBMIT - SAVE DATA AND REDIRECT TO THANK
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!whatsappNumber.trim()) {
      alert('WhatsApp number is required');
      return;
    }

    // Validate based on content mode
    if (contentMode === 'voice' && !audioBase64) {
      alert('Please record a voice note first');
      return;
    }

    if (contentMode === 'text' && !textMessage.trim()) {
      alert('Please enter a text message');
      return;
    }

    setIsProcessing(true);

    try {
      const submissionId = id || uuidv4().slice(0, 8);
      
      // Use customUrl from query parameter, or preserve existing link if available
      const linkToSave = customUrl || savedData?.link || null;
      
      const payload: any = {
        id: submissionId,
        whatsappNumber: whatsappNumber.trim(),
        contentMode: contentMode,
        link: linkToSave,
        createdAt: Date.now(),
      };

      // Add voice or text content
      if (contentMode === 'voice') {
        payload.audioUrl = audioBase64;
      } else {
        payload.textMessage = textMessage.trim();
      }

      const docRef = doc(db, "submissions", submissionId);
     await setDoc(docRef, payload, { merge: true });

      // Navigate to Thank page with submission data
      navigate('/thank', { 
        state: { 
          submissionData: payload,
          submissionId: submissionId
        } 
      });

    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear selection - cancel audio
  const clearSelection = () => {
    if (contentMode === 'voice') {
      setRecordedAudioUrl(null);
      setAudioBase64(null);
      setRecordingSeconds(15);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Stop recording if in progress
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setIsRecording(false);
    } else {
      // clear text mode
      setTextMessage('');
      stopSpeech();
      setIsTtsPlaying(false);
    }
  };

  // Restart recording
  const restartRecording = () => {
    setRecordedAudioUrl(null);
    setAudioBase64(null);
    setRecordingSeconds(15);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    // Start new recording
    startRecording();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // If submission is already saved, show view with play button, WhatsApp button, and CHECK THIS OUT button
if (submissionSaved) {

  const getWhatsAppMessage = () => {
    return encodeURIComponent("Hi, I scanned your QR.");
  };

  const savedLink = (savedData as any)?.link;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f1c2e, #1b3358)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        position: "relative"
      }}
    >
      {/* HOME BUTTON - Top Right */}
      <div
        onClick={() => navigate("/")}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#FF0000",
          padding: "10px 20px",
          borderRadius: "25px",
          cursor: "pointer",
          color: "white",
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        <FaHandPointRight size={24} />
        <span>HOME</span>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "#f4a300",
          borderRadius: "20px",
          padding: "30px 20px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}
      >
        {/* TITLE */}
        <h2
          style={{
            fontFamily: "cursive",
            marginBottom: "25px"
          }}
        >
          TALK IN CANDY
        </h2>

        {/* PLAY BUTTON */}
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "center" }}>
      { /* Play button - show TTS for text, audio player for voice */ }
      {((savedData as any)?.contentMode === 'text') ? (
        <div
          onClick={toggleTtsPlayback}
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "#ffffff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(0,0,0,0.35)"
          }}
        >
          {isTtsPlaying ? (
            <FaStop size={34} color="#f4a300" />
          ) : (
            <FaVolumeUp size={34} color="#f4a300" />
          )}
        </div>
      ) : (
        <div
          onClick={togglePlayback}
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "#ffffff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 8px 20px rgba(0,0,0,0.35)"
          }}
        >
          {isPlaying ? (
            <FaPause size={34} color="#f4a300" />
          ) : (
            <FaPlay size={34} color="#f4a300" />
          )}
        </div>
      )}
</div>

        {/* TALK TO ME BUTTON */}
        {whatsappNumber && (
          <button
            onClick={() =>
              window.open(
                `https://wa.me/${whatsappNumber}?text=${getWhatsAppMessage()}`,
                "_blank"
              )
            }
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "12px",
              border: "none",
              background: "#25D366",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: savedLink ? "15px" : "0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer"
            }}
          >
            <FaWhatsapp />
            TALK TO ME
          </button>
        )}

        {/* CHECK THIS OUT BUTTON */}
        {savedLink && (
          <button
            onClick={() => window.open(savedLink, "_blank")}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "12px",
              border: "none",
              background: "#111",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer"
            }}
          >
            <FaLink />
            CHECK THIS OUT
          </button>
        )}
      </div>
      {/* Global Footer */}
        <div className="global-footer">
          ©️ MIKI +2349033666403
        </div>
    </div>
  );
}

      

  // Original form for new submissions - with icons only
  return (
    <div className="users-page">
      {/* HOME BUTTON - Top Right */}
      <div
        onClick={() => navigate("/")}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#FF0000",
          padding: "10px 20px",
          borderRadius: "25px",
          cursor: "pointer",
          color: "white",
          fontWeight: "bold",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          zIndex: 1000
        }}
      >
        <FaHandPointRight size={24} />
        <span>HOME</span>
      </div>

      <div className="users-container">
        <h1 className="users-header">TALK IN CANDY</h1>
        
        <div className="record-icon-container">
          <div 
            className={`record-circle active`}
            style={{ backgroundColor: isRecording ? '#ff0000' : '#e91e63' }}
          >
            <div className="record-icon">
              <FaMicrophone />
            </div>
          </div>
        </div>

        <div className="content-section">
          <div className="voice-section">
            <div className="record-controls">
              {!recordedAudioUrl ? (
                <button 
                  className={`record-btn ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? <FaPause /> : <FaPlay />}
                </button>
              ) : (
                <div className="recorded-audio">
                  <button className="play-btn" onClick={togglePlayback}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                  <button className="re-record-btn" onClick={restartRecording}>
                    <FaRedo />
                  </button>
                  <button className="clear-btn" onClick={clearSelection}>
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
            
            {isRecording && (
              <div className="recording-timer">
                <p className="recording-status">Recording...</p>
                <div className="timer-display">
                  <span className="timer-seconds">{recordingSeconds}</span>
                  <span className="timer-label">seconds left</span>
                </div>
                <div className="timer-progress">
                  <div 
                    className="timer-progress-bar" 
                    style={{ width: `${(recordingSeconds / 15) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="users-form">
          <label className="whatsapp-label">WHATSAPP NUMBER*</label>
          <input
            type="tel"
            className="whatsapp-input"
            placeholder="start with 234... e.g 2348190004000"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            required
          />

          <button type="submit" className="candy-button" disabled={isProcessing}>
            {isProcessing ? 'PROCESSING...' : 'CANDY IT'}
          </button>

          <p className='footer'>(Print your QR code after generating and stick it on your product, flyer, promotional item, gift, or anything!)</p>
        </form>
      </div>

      {/* Global Footer */}
      <div className="global-footer">
        ©️ MIKI +2349033666403
      </div>
    </div>
  );
}

export default Adminform;
