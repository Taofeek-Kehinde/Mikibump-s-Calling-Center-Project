import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { faHandPointRight } from '@fortawesome/free-solid-svg-icons';
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

 


  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};


    if (!formData.recipientContact.trim()) newErrors.recipientContact = 'Recipient contact is required';

    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert('Please fill all required fields', 'error');
      return;
    }

    try {
      await fetch('https://formspree.io/f/mreaeapj', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientContact: formData.recipientContact,
          relationship: formData.relationship,
        }),
      });

      showAlert('CANDY sent Successfully, we will get back to you soon', 'success');
      // Navigate to dashboard after successful submission
      setTimeout(() => {
        navigate('/');
      }, 2000); // Wait 2 seconds to show the success message
    } catch (error) {
      console.error('Error sending message:', error);
      showAlert('Error sending message. Please try again.', 'error');
    }

    // Reset form
    setTimeout(() => {
      setFormData({
        recipientContact: '',
        relationship: 'CHOCOLATE',
      });
    }, 500);
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



    <p className='question' style={{
      fontFamily: "sans-serif",
      fontWeight: "500",
      fontSize: "20px",
      textAlign: "center",
      userSelect: "none",
      textShadow: "0 1px 3px rgba(0, 0, 0, 0.35)"
    }}> WHO ARE YOU SENDING IT TO?</p>
        <form onSubmit={handleSubmit}>


          {/* Input session */}

<input 
  type="text"
  placeholder="ENTER NAME"
  className="recipient-input"
  value={formData.recipientContact}
  onChange={(e) =>
    setFormData({ ...formData, recipientContact: e.target.value })
  }
/>


{/* Centered button below */}
            <motion.button
              type="button"
              className="singbtn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className='Singsecbtn'>TAP TO MAKE IT SING</span>
            </motion.button>


    <span className='mycanndy'>CANDY IT WITH</span>

          {/* Your Details Section */}


          <div className="relationship-container">
            <div className="relationship-options">
              <motion.button
                type="button"
                className={`relationship-btns ${formData.relationship === 'CHOCOLATE' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, relationship: 'CHOCOLATE' }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: "chocolate",
                }}
              >

                <span>CHOCOLATE</span>
              </motion.button>

              <motion.button
                type="button"
                className={`relationship-btns ${formData.relationship === 'LOLLIPOP' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, relationship: 'LOLLIPOP' }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
    style={{
                  backgroundColor: "yellow",
                }}
              >
 
                <span>LOLLIPOP</span>
              </motion.button>
            </div>

        
          </div>


          <span className='introduction'>YOUR CANDY WIL SING AFTER 15 MINUTES TO BUILD SUSPENSE</span>

          

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="submit-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <FontAwesomeIcon icon={faCircle} />
            CANDY IT
          </motion.button>
          <p className='statement'>(NB: CANDY will be delivered 6am to Recipient WhatsApp,  while your IDENTITY will be revealed at the time you selected)</p>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default Form;
