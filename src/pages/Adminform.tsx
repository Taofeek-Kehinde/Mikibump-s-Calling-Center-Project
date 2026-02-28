import React, { useState, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import './users.css';
import { FaMicrophone, FaTimes } from "react-icons/fa";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase2";
import { v4 as uuidv4 } from "uuid";

function Adminform(): React.ReactElement {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [customUrl, setCustomUrl] = useState<string>('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [linkNumber, setLinkNumber] = useState('');

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  
  // Recording timer - countdown from 15
  const [recordingSeconds, setRecordingSeconds] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [showShareOptions, setShowShareOptions] = useState(false);
  const [submissionSaved, setSubmissionSaved] = useState(false);
  const [savedSubmissionId, setSavedSubmissionId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get customUrl from query parameter on page load
  useEffect(() => {
    const urlParam = searchParams.get('customUrl');
    if (urlParam) {
      setCustomUrl(decodeURIComponent(urlParam));
      setLinkNumber(decodeURIComponent(urlParam));
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
            setWhatsappNumber(data.whatsappNumber || '');
            setLinkNumber(data.link || '');
            setCustomUrl(data.customUrl || '');
            if (data.contentMode === 'voice' && data.audioUrl) {
              setAudioBase64(data.audioUrl);
              setRecordedAudioUrl(data.audioUrl);
            }
            setSubmissionSaved(true);
            setSavedSubmissionId(id);
          }
        } catch (err) {
          console.error("Error checking submission:", err);
        }
      }
    };

    checkExistingSubmission();
  }, [id]);

  // Process and save the recorded audio
  const processRecording = () => {
    const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
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

  // 🎤 START RECORDING
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
        setRecordingSeconds(prev => {
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

  // 🔊 PLAY/STOP RECORDED AUDIO
  const togglePlayback = () => {
    if (!recordedAudioUrl) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        const audio = new Audio(recordedAudioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setIsPlaying(true);
      }
    }
  };

  // Share as image
  const shareAsImage = async () => {
    const shareData = {
      title: 'TALK IN CANDY',
      text: `Check out my voice message!`,
      url: `${window.location.origin}/view/${savedSubmissionId}`
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      const url = `${window.location.origin}/view/${savedSubmissionId}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
    setShowShareOptions(false);
  };

  // Share as URL via WhatsApp
  const shareViaWhatsApp = () => {
    if (!whatsappNumber.trim()) {
      alert('Please enter a WhatsApp number');
      return;
    }

    const url = `${window.location.origin}/view/${savedSubmissionId}`;
    const message = encodeURIComponent(`Check out my TALK IN CANDY message: ${url}`);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
    setShowShareOptions(false);
  };

  // 📝 SUBMIT - SAVE DATA AND GENERATE QR
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
        link: customUrl || linkNumber.trim() || null,
        customUrl: customUrl || null,
        contentMode: 'voice',
        audioUrl: audioBase64,
        createdAt: Date.now(),
      };

      const docRef = doc(db, "submissions", submissionId);
      await setDoc(docRef, payload);

      setSavedSubmissionId(submissionId);
      setSubmissionSaved(true);
      setShowShareOptions(true);

    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear selection
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

  return (
    <div className="users-page">
      <div className="users-container">
        <h1 className="users-header">TALK IN CANDY</h1>
        
        <div className="record-icon-container">
          {/* 🎤 MICROPHONE - Voice Mode Only */}
          <div 
            className={`record-circle active`}
            style={{ backgroundColor: '#e91e63' }}
          >
            <div className="record-icon">
              <FaMicrophone />
            </div>
          </div>
        </div>

        {/* Show recording content */}
        <div className="content-section">
          {!submissionSaved && (
            <button className="clear-btn" onClick={clearSelection}>
              <FaTimes /> Clear
            </button>
          )}

          <div className="voice-section">
            <div className="record-controls">
              {!recordedAudioUrl ? (
                !submissionSaved && (
                  <button 
                    className={`record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
                  </button>
                )
              ) : (
                <div className="recorded-audio">
                  <button className="play-btn" onClick={togglePlayback}>
                    {isPlaying ? '⏸ Stop' : '▶ Play Recording'}
                  </button>
                  {!submissionSaved && (
                    <button className="re-record-btn" onClick={() => {
                      setRecordedAudioUrl(null);
                      setAudioBase64(null);
                      setRecordingSeconds(15);
                      startRecording();
                    }}>
                      🔄 Re-record
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {isRecording && (
              <div className="recording-timer">
                <p className="recording-status">🔴 Recording...</p>
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
            
            {audioBase64 && <p className="audio-saved">✓ Audio saved</p>}
          </div>
        </div>

        <p className="shoot-text">VOICE NOTE MODE</p>
        
        {/* Share Options Modal */}
        {showShareOptions && (
          <div className="content-section">
            <h3>Share Your Message</h3>
            <p>How would you like to share?</p>
            <div className="users-form">
              <button 
                className="candy-button" 
                onClick={shareAsImage}
              >
                📤 Share Link
              </button>
              <button 
                className="candy-button" 
                onClick={shareViaWhatsApp}
              >
                📱 Send to WhatsApp
              </button>
              <button 
                className="clear-btn" 
                onClick={() => setShowShareOptions(false)}
                style={{ background: '#666' }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!showShareOptions && (
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

            {/* Show custom URL if provided, otherwise show regular link input */}
            {customUrl ? (
              <div>
                <label className="whatsapp-label">Your Custom URL</label>
                <input
                  type="text"
                  className="whatsapp-input"
                  value={customUrl}
                  disabled
                  style={{ backgroundColor: '#333' }}
                />
              </div>
            ) : (
              <>
                <label className="whatsapp-label">Social Media/Web (OPTIONAL)</label>
                <input
                  type="url"
                  className="whatsapp-input"
                  placeholder="Paste Link to social media or web address"
                  value={linkNumber}
                  onChange={(e) => setLinkNumber(e.target.value)}
                />
              </>
            )}

            <button type="submit" className="candy-button" disabled={isProcessing}>
              {isProcessing ? 'PROCESSING...' : submissionSaved ? 'UPDATE' : 'CANDY IT'}
            </button>

            <p className='footer'>(Print your QR code after generating and stick it on your product, flyer, promotional item, gift, or anything!)</p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Adminform;
