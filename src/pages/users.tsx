import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './users.css';
import { FaMicrophone, FaTimes, FaVolumeUp, FaStop } from "react-icons/fa";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase2";
import { v4 as uuidv4 } from "uuid";

function Users(): React.ReactElement {
  const navigate = useNavigate();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [linkNumber, setLinkNumber] = useState('');

  // Mode: 'voice' | 'text' | null
  const [contentMode, setContentMode] = useState<'voice' | 'text' | null>(null);
  const [textMessage, setTextMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  
  // Recording timer - countdown from 15
  const [recordingSeconds, setRecordingSeconds] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Speech synthesis for text-to-speech preview
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Toggle between voice and text mode (mutually exclusive)
  const selectVoiceMode = () => {
    setContentMode('voice');
    setTextMessage('');
    setRecordedAudioUrl(null);
    setAudioBase64(null);
    setRecordingSeconds(15);
  };

  const selectTextMode = () => {
    setContentMode('text');
    setRecordedAudioUrl(null);
    setAudioBase64(null);
    setRecordingSeconds(15);
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

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
        // Recording stopped - process the audio
        processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(15);
      
      // Start countdown timer - from 15 to 0
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev <= 1) {
            // Auto-stop at 0 seconds - recording is saved automatically
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

  // 🔊 TEXT TO SPEECH - Preview
  const playTextToSpeech = () => {
    if (!textMessage.trim()) return;

    // Stop if already speaking
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textMessage);
    utterance.rate = 0.9;
    utterance.pitch = 1.5;
    utterance.lang = 'en-US';
    
    // Try to find a child-friendly voice
    const voices = window.speechSynthesis.getVoices();
    const childVoice = voices.find(voice => 
      voice.name.includes('Microsoft Aria') ||
      voice.name.includes('Microsoft Aria')
    );
    if (childVoice) {
      utterance.voice = childVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopTextToSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Word count helper
  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // 📝 SUBMIT - SAVE DATA AND GENERATE QR
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!whatsappNumber.trim()) {
      alert('WhatsApp number is required');
      return;
    }

    if (!contentMode) {
      alert('Please select either Voice Note or Enter Text');
      return;
    }

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
      // Generate unique ID for this submission
      const submissionId = uuidv4().slice(0, 8);
      
      // Prepare payload
      const payload: any = {
        id: submissionId,
        whatsappNumber: whatsappNumber.trim(),
        link: linkNumber.trim() || null,
        contentMode: contentMode,
        createdAt: Date.now(),
      };

      // Handle voice or text content
      if (contentMode === 'voice' && audioBase64) {
        payload.audioUrl = audioBase64;
        payload.textMessage = null;
      } else if (contentMode === 'text') {
        payload.textMessage = textMessage.trim();
        payload.audioUrl = null;
      }

      // Save to Firestore
      const docRef = doc(db, "submissions", submissionId);
      await setDoc(docRef, payload);

      // Navigate to Qrcode page with the ID
      navigate(`/Qrcode/${submissionId}`);

    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear selection
  const clearSelection = () => {
    setContentMode(null);
    setTextMessage('');
    setRecordedAudioUrl(null);
    setAudioBase64(null);
    setRecordingSeconds(15);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
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
        <h1 className="users-header">MAKE IT TALK</h1>
        
        <div className="record-icon-container">
          {/* 🎤 MICROPHONE - Voice Mode */}
          <div 
            className={`record-circle ${contentMode === 'voice' ? 'active' : ''}`}
            onClick={selectVoiceMode}
            style={contentMode === 'voice' ? { backgroundColor: '#e91e63' } : {}}
          >
            <div className="record-icon">
              <FaMicrophone />
            </div>
          </div>

          {/* 📝 ENTER TEXT - Text Mode */}
          <div 
            className={`record-circle ${contentMode === 'text' ? 'active' : ''}`}
            onClick={selectTextMode}
            style={contentMode === 'text' ? { backgroundColor: '#e91e63' } : {}}
          >
            <div className="record-text-circle">
              ENTER TEXT
            </div>
          </div>
        </div>

        {/* Show content based on mode */}
        {contentMode && (
          <div className="content-section">
            <button className="clear-btn" onClick={clearSelection}>
              <FaTimes /> Clear
            </button>

            {contentMode === 'voice' && (
              <div className="voice-section">
                <div className="record-controls">
                  {!recordedAudioUrl ? (
                    <button 
                      className={`record-btn ${isRecording ? 'recording' : ''}`}
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      {isRecording ? '⏹ Stop Recording' : '🎤 Start Recording'}
                    </button>
                  ) : (
                    <div className="recorded-audio">
                      <button className="play-btn" onClick={togglePlayback}>
                        {isPlaying ? '⏸ Stop' : '▶ Play Recording'}
                      </button>
                      <button className="re-record-btn" onClick={() => {
                        setRecordedAudioUrl(null);
                        setAudioBase64(null);
                        setRecordingSeconds(15);
                        startRecording();
                      }}>
                        🔄 Re-record
                      </button>
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
            )}

            {contentMode === 'text' && (
              <div className="text-section">
                <textarea
                  placeholder="Type your message here... (max 15 words)"
                  value={textMessage}
                  onChange={(e) => {
                    const words = e.target.value.trim().split(/\s+/).filter(word => word.length > 0);
                    if (words.length <= 15) {
                      setTextMessage(e.target.value);
                    }
                  }}
                  rows={4}
                />
                <div className="word-count">
                  {getWordCount(textMessage)} / 15 words
                </div>
                <button 
                  className="speak-btn"
                  onClick={isSpeaking ? stopTextToSpeech : playTextToSpeech}
                  disabled={!textMessage.trim()}
                >
                  {isSpeaking ? (
                    <>🔊 <FaStop /> Stop Audio</>
                  ) : (
                    <>🔊 <FaVolumeUp /> Preview Audio</>
                  )}
                </button>
                {isSpeaking && <p className="speaking-status">🔊 Playing audio...</p>}
              </div>
            )}
          </div>
        )}

        <p className="shoot-text">
          {contentMode === 'voice' ? 'VOICE NOTE MODE' : contentMode === 'text' ? 'TEXT TO SPEECH MODE' : 'SELECT AN OPTION'}
        </p>
        <p className='sec-text'>
          {contentMode === 'text' ? '(Your text will be converted to audio when scanned)' : ''}
        </p>
        
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

          <label className="whatsapp-label">Social Media/Web (OPTIONAL)</label>
          <input
            type="url"
            className="whatsapp-input"
            placeholder="Paste Link to social media or web address"
            value={linkNumber}
            onChange={(e) => setLinkNumber(e.target.value)}
          />

          <button type="submit" className="candy-button" disabled={isProcessing}>
            {isProcessing ? 'PROCESSING...' : 'GENERATE'}
          </button>

          <p className='footer'>(Print your QR code after generating and stick it on your product, flyer, promotional item, gift, or anything!)</p>
        </form>
      </div>
    </div>
  );
}

export default Users;
