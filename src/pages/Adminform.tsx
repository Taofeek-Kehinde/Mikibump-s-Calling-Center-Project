import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './users.css';
import { FaMicrophone, FaPlay, FaPause, FaRedo, FaTimes } from "react-icons/fa";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase2";
import { v4 as uuidv4 } from "uuid";

function Adminform(): React.ReactElement {
  const { id } = useParams();
  const navigate = useNavigate();
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  
  // Recording timer - countdown from 15
  const [recordingSeconds, setRecordingSeconds] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [submissionSaved, setSubmissionSaved] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if this is an existing submission
  useEffect(() => {
    const checkExistingSubmission = async () => {
      if (id) {
        try {
          const docRef = doc(db, "submissions", id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setWhatsappNumber(data.whatsappNumber || '');
            if (data.contentMode === 'voice' && data.audioUrl) {
              setAudioBase64(data.audioUrl);
              setRecordedAudioUrl(data.audioUrl);
            }
            setSubmissionSaved(true);
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
    if (recordedAudioUrl && !audioRef.current) {
      const audio = new Audio(recordedAudioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        console.error('Audio error:', audio.error);
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
    const blob = new Blob(audioChunks.current, { type: 'audio/wav' });
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

      const mediaRecorder = new MediaRecorder(stream);

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

  // SUBMIT - SAVE DATA AND REDIRECT TO THANKS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!whatsappNumber.trim()) {
      alert('WhatsApp number is required');
      return;
    }

    if (!audioBase64) {
      alert('Please record a voice note first');
      return;
    }

    setIsProcessing(true);

    try {
      const submissionId = id || uuidv4().slice(0, 8);
      
      const payload: any = {
        id: submissionId,
        whatsappNumber: whatsappNumber.trim(),
        contentMode: 'voice',
        audioUrl: audioBase64,
        createdAt: Date.now(),
      };

      const docRef = doc(db, "submissions", submissionId);
      await setDoc(docRef, payload);

      // Navigate to Thanks page after successful submission
      navigate('/thanks');

    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear selection - cancel audio
  const clearSelection = () => {
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

  // If submission is already saved, show simple view with play button and WhatsApp number only
  if (submissionSaved) {
    return (
      <div className="users-page">
        <div className="users-container">
          <h1 className="users-header">TALK IN CANDY</h1>

          <div className="content-section">
            <div className="voice-section">
              <div className="record-controls">
                <div className="recorded-audio">
                  <button className="play-btn" onClick={togglePlayback}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="users-form">
            <label className="whatsapp-label">WHATSAPP NUMBER</label>
            <p className="whatsapp-display">{whatsappNumber}</p>
          </div>
        </div>
      </div>
    );
  }

  // Original form for new submissions - with icons only
  return (
    <div className="users-page">
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
    </div>
  );
}

export default Adminform;
