import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { db } from "../firebase2";
import { collection, addDoc } from "firebase/firestore";
import QRCode from "qrcode";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandPointLeft, faHandPointRight } from '@fortawesome/free-solid-svg-icons';
import { showAlert } from '../utils/showAlert';
// import { useAppContext } from '../context/useAppContext';
import './candyform.css';

interface FormData {

  recipientContact: string;
  relationship: 'CHOCOLATE' | 'LOLLIPOP';

}

function Form() {

  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({

    recipientContact: '',
    relationship: 'CHOCOLATE',

  });

  useEffect(() => {
    document.body.classList.add('candyform-page');
    return () => document.body.classList.remove('candyform-page');
  }, []);

 

const [spotifyLink, setSpotifyLink] = useState("");
const [qrImage, setQrImage] = useState("");
const [generatedUrl] = useState("");

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!formData.recipientContact || !spotifyLink) {
    showAlert("Fill all fields", "error");
    return;
  }

  try {
    const unlockTime = Date.now() + 15 * 60 * 1000;

    const docRef = await addDoc(collection(db, "candies"), {
      name: formData.recipientContact,
      relationship: formData.relationship,
      spotifyLink: spotifyLink,
      createdAt: Date.now(),
      unlockTime: unlockTime
    });

    const candyUrl = `${window.location.origin}/candy/${docRef.id}`;

    const qr = await QRCode.toDataURL(candyUrl);
    setQrImage(qr);

    showAlert("Candy Generated Successfully 🍫", "success");

  } catch (error) {
    console.error(error);
    showAlert("Error saving candy", "error");
  }
};




// hmm


const handleCandyClick = async (type: "CHOCOLATE" | "LOLLIPOP") => {
  if (!formData.recipientContact || !spotifyLink) {
    showAlert("Enter name and paste Spotify link", "error");
    return;
  }

  try {
    const unlockTime = Date.now() + 15 * 60 * 1000;

    const docRef = await addDoc(collection(db, "candies"), {
      name: formData.recipientContact,
      relationship: type,
      spotifyLink: spotifyLink,
      createdAt: Date.now(),
      unlockTime: unlockTime
    });

    const candyUrl = `${window.location.origin}/candy/${docRef.id}`;

    // Generate QR
    const qr = await QRCode.toDataURL(candyUrl);
    setQrImage(qr);

    // Open WhatsApp
    const message = `🍫 Someone sent you a Candy Surprise!\nTap to open:\n${candyUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank"
    );

  } catch (error) {
    console.error(error);
    showAlert("Error creating candy", "error");
  }
};


  // const noteWords = formData.note.trim().split(/\s+/).filter(word => word.length > 0).length;

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

        <h1 className="form-titless" style={{
          fontFamily: "sans-serif",
          userSelect: "none"
        }}>
          SAY IT WITH CANDY <p className='nowords'>(NO WORDS NEEDED)</p></h1>

    <span className='mycanndy'>CANDY TREAT </span>

        <form onSubmit={handleSubmit}>


          {/* Input session */}


          <input
  type="text"
  placeholder="PASTE Link to SONG OR VIDEO"
  value={spotifyLink}
  className='recipient-input'
  onChange={(e) => setSpotifyLink(e.target.value)}
/>


    <p className='question' style={{
      fontFamily: "sans-serif",
      fontWeight: "500",
      position:"relative",
      bottom: "20px",
      fontSize: "15px",
      textAlign: "center",
      userSelect: "none",
      textShadow: "0 1px 3px rgba(0, 0, 0, 0.35)"
    }}> WHO ARE YOU SENDING IT TO?</p>


<input 
  type="text"
  placeholder="ENTER NAME"
  className="recipient-inputs"
  value={formData.recipientContact}
  onChange={(e) =>
    setFormData({ ...formData, recipientContact: e.target.value })
  }
/>

{qrImage && (
  <div style={{ textAlign: "center", marginTop: "20px" }}>
    <div style={{
      display: "inline-block",
      padding: "20px",
      borderRadius: "50%",
      background: formData.relationship === "CHOCOLATE" ? "chocolate" : "yellow",
      boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
    }}>
      <img src={qrImage} alt="Candy QR" width="150" height="150" style={{ borderRadius: "50%" }}/>
    </div>

    <div style={{ marginTop: "10px" }}>
      <a href={qrImage} download={`candy-${formData.recipientContact}.png`}>
        <button>Download QR</button>
      </a>
    </div>

    <div style={{ marginTop: "10px" }}>
      <button
        onClick={() => {
          const message = `🍫 Someone sent you a Candy Surprise!\nTap to open:\n${generatedUrl}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
        }}
      >
        Share on WhatsApp
      </button>
    </div>
  </div>
)}

          {/* Your Details Section */}


          <div className="relationship-container">
            <div className="relationship-options">
              <motion.button
                type="button"
                className={`relationship-btns ${formData.relationship === 'CHOCOLATE' ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: "chocolate", position: "relative", left: "10px" }}
                onClick={() => handleCandyClick("CHOCOLATE")}
              >
  <FontAwesomeIcon icon={faHandPointRight} className="lefthand"  style={{
    marginRight: "150px",
    color:"chocolate",
  }}/>

                <span>CHOCOLATE</span>

                 
              </motion.button>
              <div className='middle'>
              <p>OR</p>
              </div>
              <motion.button
                type="button"
                className={`relationship-btns ${formData.relationship === 'LOLLIPOP' ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ backgroundColor: "yellow", position: "relative", right: "10px"}} 
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


          <span className='introduction'>[CANDY Treat will be made available after 15 minutes to build suspense]</span>

        </form>
      </motion.div>
    </motion.div>
  );
}

export default Form;
