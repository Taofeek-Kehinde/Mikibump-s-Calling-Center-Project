import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from "../firebase2";
import { collection, addDoc } from "firebase/firestore";
import QRCode from "qrcode"; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointLeft, faHandPointRight } from '@fortawesome/free-solid-svg-icons';
import { showAlert } from '../utils/showAlert';
import { FaWhatsapp } from "react-icons/fa";
import { useAppContext } from '../context/useAppContext';
import { stopSpeech } from '../utils/textToSpeech';
import './candyform.css';



interface FormData {
  recipientContact: string;
  relationship: 'CHOCOLATE' | 'LOLLIPOP';
}

function Form() {
  const navigate = useNavigate();
  const { showFreeCallsButton } = useAppContext();
  
  const [formData, setFormData] = useState<FormData>({
    recipientContact: '',
    relationship: 'CHOCOLATE',
  });

  useEffect(() => {
    document.body.classList.add('candyform-page');
    return () => {
      document.body.classList.remove('candyform-page');
      stopSpeech();
    };
  }, []);

  const [message, setMessage] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [selectedCandy, setSelectedCandy] = useState<"CHOCOLATE" | "LOLLIPOP" | null>(null);
  const [showSharePrompt, setShowSharePrompt] = useState(false);

  // Handle message input with 15-word limit
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length > 15) {
      // Don't allow more than 15 words
      return;
    }
    
    setMessage(value);
    setWordCount(words.length);
  };

  const handleCandyClick = async (type: "CHOCOLATE" | "LOLLIPOP") => {
    if (!formData.recipientContact || !message) {
      showAlert("Enter name and message", "error");
      return;
    }

    setSelectedCandy(type);
    setShowSharePrompt(true);
  };

  const handleShareChoice = async (option: "LINK" | "QR") => {
    if (!selectedCandy) return;

    try {
      // 15 minutes = 15 * 60 * 1000 ms
      const unlockTime = Date.now() + 15 * 60 * 1000;
      // 15 hours = 15 * 60 * 60 * 1000 ms
      const expireTime = Date.now() + 15 * 60 * 60 * 1000;

      const docRef = await addDoc(collection(db, "candies"), {
        name: formData.recipientContact,
        relationship: selectedCandy,
        message: message.trim(), // Store the text message
        createdAt: Date.now(),
        unlockTime: unlockTime,
        expireTime: expireTime
      });

      const candyUrl = `${window.location.origin}/candy/${docRef.id}`;
      const messageText = `🎁 You got a Candy Treat! Open it here: ${candyUrl}`;

      // Check if Web Share API is available (mobile devices)
      const canUseWebShare = typeof navigator.share === 'function' && typeof navigator.canShare === 'function';

      if (option === "LINK") {
        if (canUseWebShare) {
          // Use native share on mobile
          try {
            await navigator.share({
              title: 'Candy Treat',
              text: messageText,
              url: candyUrl
            });
          } catch (err) {
            // User cancelled or error - do nothing
            console.log('Share cancelled or failed:', err);
          }
        } else {
          // Desktop fallback: copy to clipboard and open WhatsApp Web
          try {
            await navigator.clipboard.writeText(messageText);
            showAlert('Link copied to clipboard!', 'success');
            // Open WhatsApp Web
            window.open('https://web.whatsapp.com/send?text=' + encodeURIComponent(messageText), '_blank');
          } catch (clipErr) {
            // Fallback if clipboard fails
            window.open('https://wa.me/?text=' + encodeURIComponent(messageText), '_blank');
          }
        }
      }

      if (option === "QR") {
        const qrDataUrl = await QRCode.toDataURL(candyUrl, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: 'M'
        });

        if (canUseWebShare) {
          // Convert data URL to blob for sharing
          const response = await fetch(qrDataUrl);
          const blob = await response.blob();
          const file = new File([blob], 'candy-qr.png', { type: 'image/png' });

          if (navigator.canShare?.({ files: [file] })) {
            try {
              await navigator.share({
                title: 'Candy QR Code',
                text: 'Scan this QR code to open your Candy Treat!',
                files: [file]
              });
            } catch (err) {
              console.log('Share cancelled or failed:', err);
            }
          } else {
            // Fallback: share as link with QR description
            try {
              await navigator.share({
                title: 'Candy Treat',
                text: messageText + '\n\nOr scan the downloaded QR code!',
                url: candyUrl
              });
            } catch (err) {
              console.log('Share cancelled or failed:', err);
            }
          }
        } else {
          // Desktop fallback: download QR and show WhatsApp link
          const link = document.createElement('a');
          link.href = qrDataUrl;
          link.download = `candy-qr-${docRef.id}.png`;
          link.click();
          
          showAlert('QR code downloaded! Now you can send it via WhatsApp.', 'success');
          
          // Open WhatsApp Web with pre-filled message
          setTimeout(() => {
            window.open('https://web.whatsapp.com/send?text=' + encodeURIComponent(messageText), '_blank');
          }, 500);
        }
      }

      setShowSharePrompt(false);
      setSelectedCandy(null);
      stopSpeech();

    } catch (error) {
      console.error(error);
      showAlert("Error creating candy", "error");
    }
  };

  return (
    <motion.div
      className="form-containers"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="form-panels"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {showFreeCallsButton && (
          <motion.button
            className="cany-btns"
            onClick={() => navigate('/form')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Open Cany Form"
          >
            <FontAwesomeIcon icon={faHandPointRight} className="lefthand" />
            FREE CALLS
          </motion.button>
        )}

        <h1 className="form-titless" style={{
          fontFamily: "sans-serif",
          userSelect: "none"
        }}>
          LET CANDY DO THE TALKIN 
        </h1>

        <span className='mycanndy' style={{fontSize: "13px"}}>TALK IN CANDY </span>

        <form>

          <input
            type="text"
            placeholder={`ENTER MESSAGE (${wordCount}/15 words)`}
            value={message}
            className='recipient-input'
            onChange={handleMessageChange}
          />


          <p className='question'> WHO ARE YOU SENDING IT TO?</p>

          <input
            type="text"
            placeholder="ENTER NAME"
            className="recipient-inputs"
            value={formData.recipientContact}
            onChange={(e) =>
              setFormData({ ...formData, recipientContact: e.target.value })
            }
          />

          <div className="relationship-container">
            <div className="relationship-options">

              <motion.button
                type="button"
                className={`relationship-btns ${formData.relationship === 'CHOCOLATE' ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: "brown", position: "relative", left: "10px" }}
                onClick={() => handleCandyClick("CHOCOLATE")}
              >
                <FontAwesomeIcon icon={faHandPointRight} className="lefthand" style={{
                  marginRight: "150px",
                  color: "chocolate",
                }} />
                <span>CHOCOLATE</span>
              </motion.button>

              <div className="middle-divider">
                <span className="divider-line">||</span>
              </div>

              <motion.button
                type="button"
                className={`relationship-btns ${formData.relationship === 'LOLLIPOP' ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: "yellow", position: "relative", right: "10px" }}
                onClick={() => handleCandyClick("LOLLIPOP")}
              >
                <FontAwesomeIcon icon={faHandPointLeft} className="lefthand" style={{
                  marginLeft: "270px",
                  color: "yellow"
                }} />
                <span>LOLLIPOP</span>
              </motion.button>

            </div>
          </div>

          <span className='introduction'>
            (Your MESSAGE will be delivered in CANDY's voice after 15 minutes and disappears after 15 hours)
          </span>

        </form>
      </motion.div>

     
      {showSharePrompt && (
        <div className="share-prompt">
          <div className="share-box">
            <p>How do you want to share?</p>

            <button
              onClick={() => handleShareChoice("QR")}
              style={{
                background: "darkblue",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center"
              }}
            >
              <FaWhatsapp size={18} />
              Share as QR CODE
            </button>

            <button
              onClick={() => handleShareChoice("LINK")}
              style={{
                background: "green",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center"
              }}
            >
              <FaWhatsapp size={18} />
              Share as LINK
            </button>
          </div>
        </div>
      )}

    </motion.div>
  );
}

export default Form;
