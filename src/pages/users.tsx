import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './users.css';
import { FaMicrophone, FaTimes } from "react-icons/fa";

function Users() {
  const navigate = useNavigate();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [LinkNumber, setLinkNumber] = useState('');

  // ✅ NEW STATES (added only)
  const [showTextInput, setShowTextInput] = useState(false);
  const [textMessage, setTextMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsappNumber.trim()) {
      navigate('/Qrcode', { state: { phone: whatsappNumber } });
    }
  };

  // 🎤 START RECORDING
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorderRef.current = mediaRecorder;
    audioChunks.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'voice-note.mp3';
      a.click();

      alert("Voice note downloaded. Send it manually on WhatsApp.");
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // 📝 SEND TEXT TO WHATSAPP
  const sendTextToWhatsapp = () => {
    if (!whatsappNumber || !textMessage) return;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(textMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="users-page">
      <div className="users-container">
        <h1 className="users-header">MAKE IT TALK</h1>
        
      <div className="record-icon-container">
  
  {/* 🎤 MICROPHONE */}
  <div 
    className="record-circle"
    onClick={() => {
      if (!isRecording) startRecording();
      else stopRecording();
    }}
  >
    <div className="record-icon">
      <FaMicrophone />
    </div>
  </div>

  {/* 📝 ENTER TEXT */}
  <div 
    className="record-circle"
    onClick={() => setShowTextInput(!showTextInput)}
  >
    <div className="record-text-circle">
      ENTER TEXT
    </div>
  </div>

</div>

        {showTextInput && (
          <div className="text-slide">
            <textarea
              placeholder="Type your message..."
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
            />
            <div className="text-buttons">
              <button onClick={sendTextToWhatsapp}>
                SEND MESSAGE
              </button>
              <button className="cancel-btn" onClick={() => setShowTextInput(false)}>
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        <p className="shoot-text">SAY IT or TYPE IT   <p className='sec-text'>(It will be converted to audio)</p></p>
       
        
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

          <label className="whatsapp-label">Social Media/Web (OPTIONAL) </label>
  <input
            type="url"
            className="whatsapp-input"
            placeholder="Paste Link to social media or web address"
            value={LinkNumber}
            onChange={(e) => setLinkNumber(e.target.value)}
            required
          />

          <button type="submit" className="candy-button">
            GENERATE
          </button>

          <p className='footer'>(Print your QR code after generating and stick it on your product, flyer, promotional item, gift, or anything!)</p>
        </form>
      </div>
    </div>
  );
}

export default Users;