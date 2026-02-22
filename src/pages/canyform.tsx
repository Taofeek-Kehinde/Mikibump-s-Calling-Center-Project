import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { db } from "../firebase2";
import { collection, addDoc } from "firebase/firestore";
// import QRCode from "qrcode";
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
  // const [qrImage, setQrImage] = useState("");
  // const [generatedUrl] = useState("");


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

    const message = `🍫 Someone sent you a Candy Treat!\nTap to open:\n${candyUrl}`;

    window.location.href = `https://wa.me/?text=${encodeURIComponent(message)}`;

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

        <form>


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
            position: "relative",
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


          <span className='introduction'> (Your CANDY TREAT will be revealed after 15 minutes to build suspense)</span>

        </form>
      </motion.div>
    </motion.div>
  );
}

export default Form;
