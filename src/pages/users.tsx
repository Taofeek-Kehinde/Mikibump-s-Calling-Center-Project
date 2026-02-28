import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './users.css';
import { FaMicrophone, FaTimes, FaVolumeUp, FaStop } from "react-icons/fa";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase2";
import { v4 as uuidv4 } from "uuid";

function Users() {
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

  // Speech synthesis for text-to-speech preview
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Toggle between voice and text mode (mutually exclusive)
  const selectVoiceMode = () => {
    setContentMode('voice');
    setTextMessage('');
    setRecordedAudioUrl(null);
    setAudioBase64(null);
  };

  const selectTextMode = () => {
    setContentMode('text');
    setRecordedAudioUrl(null);
    setAudioBase64(null);
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  // 🎤 START RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
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
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopTextToSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

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
                        startRecording();
                      }}>
                        🔄 Re-record
                      </button>
                    </div>
                  )}
                </div>
                {isRecording && <p className="recording-status">🔴 Recording...</p>}
                {audioBase64 && <p className="audio-saved">✓ Audio saved</p>}
              </div>
            )}

            {contentMode === 'text' && (
              <div className="text-section">
                <textarea
                  placeholder="Type your message here..."
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  rows={4}
                />
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
