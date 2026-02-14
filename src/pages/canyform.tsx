import { motion } from 'framer-motion';
import { useState,useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCircle } from '@fortawesome/free-solid-svg-icons';
import { showAlert } from '../utils/showAlert';
// import { useAppContext } from '../context/useAppContext';
import './candyform.css';

interface FormData {
  yourName: string;
  yourContact: string;
  recipientName: string;
  recipientContact: string;
  note: string;
  relationship: 'CHOCOLATE' | 'LOLLIPOP';
  callTime: string;
}

function Form() {

  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    yourName: '',
    yourContact: '',
    recipientName: '',
    recipientContact: '',
    note: '',
    relationship: 'CHOCOLATE',
    callTime: '',
  });

  useEffect(() => {
  document.body.classList.add('candyform-page');
  return () => document.body.classList.remove('candyform-page');
}, []);

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
        yourName: '',
        yourContact: '',
        recipientName: '',
        recipientContact: '',
        note: '',
        relationship: 'CHOCOLATE',
        callTime: '',
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
        {/* Back Button */}
        <motion.button
          className="back-btn"
          onClick={() => navigate(-2)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Go back"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back
        </motion.button>

        <h1 className="form-title">SAY IT WITH CANDY. NO WORDS NEEDED</h1>

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
                placeholder="Whatsapp number "
                className={errors.recipientContact ? 'error' : ''}
              />
              {errors.recipientContact && <span className="error-text">{errors.recipientContact}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="note">Note (max 15 words)</label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Write a sweet message..."
                className={errors.note ? 'error' : ''}
                rows={3}
              />
              {errors.note && <span className="error-text">{errors.note}</span>}
              <span className="help-text">{formData.note.trim().split(/\s+/).filter(word => word.length > 0).length}/15 words</span>
            </div>

          </motion.div>

          {/* Relationship Section */}
          <motion.div
            className="form-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="section-title">CANDY INTENTION/GIFT</h2>
            
            <div className="relationship-options">
              <motion.button
                type="button"
                className={`relationship-btn ${formData.relationship === 'CHOCOLATE' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, relationship: 'CHOCOLATE' }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relationship-emoji">🟤</span>
                <span>CHOCOLATE</span>
              </motion.button>
              
              <motion.button
                type="button"
                className={`relationship-btn ${formData.relationship === 'LOLLIPOP' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, relationship: 'LOLLIPOP' }))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relationship-emoji">🟡</span>
                <span>LOLLIPOP</span>
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
            <h2 className="section-title">SELECT TIME WE REVEAL YOUR IDENTITY</h2>
            
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
            <FontAwesomeIcon icon={faCircle} />
            SUBMIT CANDY
          </motion.button>
          <p className='statement'>(NB: CANDY will be delivered 6am to Recipient WhatsApp,  while your IDENTITY will be revealed at the time you selected)</p>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default Form;
