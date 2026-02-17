import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import {  faHeart } from '@fortawesome/free-solid-svg-icons';
import { showAlert } from '../utils/showAlert';
import { useAppContext } from '../context/useAppContext';
import './Form.css';


interface FormData {
  yourName: string;
  yourContact: string;
  recipientName: string;
  recipientContact: string;
  note: string;
  relationship: 'love' | 'friend';
  callTime: string;
}

function Form() {
  const navigate = useNavigate();
  const { backgroundImages } = useAppContext();
  const [bgIndex, setBgIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    yourName: '',
    yourContact: '',
    recipientName: '',
    recipientContact: '',
    note: '',
    relationship: 'love',
    callTime: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Limit note to 15 words - block input if exceeding limit
    if (name === 'note') {
      const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
      if (wordCount > 15) {
        // Silently reject input - don't update state or show alert
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.yourName.trim()) newErrors.yourName = 'Name is required';
    if (!formData.yourContact.trim()) newErrors.yourContact = 'Contact is required';
    if (!formData.recipientName.trim()) newErrors.recipientName = 'Recipient name is required';
    if (!formData.recipientContact.trim()) newErrors.recipientContact = 'Recipient contact is required';
    if (!formData.note.trim()) newErrors.note = 'Note is required';
    if (!formData.callTime) newErrors.callTime = 'Call time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
          yourName: formData.yourName,
          yourContact: formData.yourContact,
          recipientName: formData.recipientName,
          recipientContact: formData.recipientContact,
          note: formData.note,
          relationship: formData.relationship,
          callTime: formData.callTime,
        }),
      });

      showAlert('Message sent Successfully, we will get back to you soon', 'success');
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
        yourName: '',
        yourContact: '',
        recipientName: '',
        recipientContact: '',
        note: '',
        relationship: 'love',
        callTime: '',
      });
    }, 500);
  };

  const noteWords = formData.note.trim().split(/\s+/).filter(word => word.length > 0).length;

  useEffect(() => {
    if (backgroundImages.length === 0) return;

    const displayTime = 3700; // display image for 3.7s
    const fadeTime = 300; // fade for 0.3s
    const totalCycle = displayTime + fadeTime; // 4s total

    const interval = setInterval(() => {
      setIsFading(true); // start fade
      setTimeout(() => {
        setBgIndex(i => (i + 1) % backgroundImages.length); // change image
        setIsFading(false); // fade in
      }, fadeTime);
    }, totalCycle);

    return () => clearInterval(interval);
  }, [backgroundImages]);

  return (
    <motion.div
      className="form-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background carousel */}
      {backgroundImages.length > 0 && (
        <div className="form-background-carousel">
          {backgroundImages.map((image: string, index: number) => (
            <div
              key={index}
              className="form-background-image"
              style={{
                backgroundImage: `url(${image})`,
                opacity: index === bgIndex ? (isFading ? 0 : 1) : (index === (bgIndex + 1) % backgroundImages.length && isFading ? 1 : 0),
              }}
            />
          ))}
          <div className="form-image-overlay"></div>
        </div>
      )}

      <motion.div
        className="form-panel"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >     
        
              {/* Back Button */}
        <motion.button
          className="back-btn"
          onClick={() => navigate(-3)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Go back"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </motion.button>



        <h1 className="form-titless">BOOK YOUR FREE CALLS</h1>

        <form onSubmit={handleSubmit}>
          {/* Your Details Section */}
          <motion.div
            className="form-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="section-title">YOUR DETAILS</h2>
            
            <div className="form-group">
              <label htmlFor="yourName">Name</label>
              <input
                type="text"
                id="yourName"
                name="yourName"
                value={formData.yourName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={errors.yourName ? 'error' : ''}
              />
              {errors.yourName && <span className="error-text">{errors.yourName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="yourContact">Contact</label>
              <input
                type="text"
                id="yourContact"
                name="yourContact"
                value={formData.yourContact}
                onChange={handleChange}
                placeholder="Whatsapp number"
                className={errors.yourContact ? 'error' : ''}
              />
              {errors.yourContact && <span className="error-text">{errors.yourContact}</span>}
              <span className="help-text">We will send you feedback via this contact</span>
            </div>
          </motion.div>

          {/* Recipient Details Section */}
          <motion.div
            className="form-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="section-title">RECIPIENT DETAILS</h2>
            
            <div className="form-group">
              <label htmlFor="recipientName">Name</label>
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Recipient's full name"
                className={errors.recipientName ? 'error' : ''}
              />
              {errors.recipientName && <span className="error-text">{errors.recipientName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="recipientContact">Contact</label>
              <input
                type="text"
                id="recipientContact"
                name="recipientContact"
                value={formData.recipientContact}
                onChange={handleChange}
                placeholder="Phone number"
                className={errors.recipientContact ? 'error' : ''}
              />
              {errors.recipientContact && <span className="error-text">{errors.recipientContact}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="note">Note</label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Your message (maximum 15 words)"
                className={errors.note ? 'error' : ''}
                rows={3}
              />
              <span className={`word-count ${noteWords > 15 ? 'exceeded' : ''}`}>
                {noteWords} / 15 words
              </span>
              {errors.note && <span className="error-text">{errors.note}</span>}
            </div>
          </motion.div>

          {/* Relationship Section */}
          <motion.div
            className="form-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="section-title">RELATIONSHIP</h2>
            
            <div className="relationship-options">
              <motion.button
                type="button"
                className={`relationship-btn ${formData.relationship === 'love' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, relationship: 'love' }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relationship-emoji">❤️</span>
                <span>Love</span>
              </motion.button>
              
              <motion.button
                type="button"
                className={`relationship-btn ${formData.relationship === 'friend' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, relationship: 'friend' }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relationship-emoji">🧡</span>
                <span>Friend</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Call Time Section */}
          <motion.div
            className="form-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="section-title">SELECT TIME OF CALL</h2>
            
            <div className="form-group">
              <div className="time-options">
                {['6AM', '12PM', '3PM', '9PM'].map((time) => (
                  <motion.button
                    key={time}
                    type="button"
                    className={`time-btn ${formData.callTime === time ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, callTime: time }))}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {time}
                  </motion.button>
                ))}
              </div>
              {errors.callTime && <span className="error-text">{errors.callTime}</span>}
            </div>
          </motion.div>

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
            <FontAwesomeIcon icon={faHeart} />
            SUBMIT
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default Form;
