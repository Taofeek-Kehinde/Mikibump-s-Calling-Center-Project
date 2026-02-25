import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './users.css';
import { FaMicrophone } from "react-icons/fa";

function Users() {
  const navigate = useNavigate();
  const [whatsappNumber, setWhatsappNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsappNumber.trim()) {
      // Navigate to Qrcode with the phone number
      navigate('/Qrcode', { state: { phone: whatsappNumber } });
    }
  };

  return (
    <div className="users-page">
      <div className="users-container">
        <h1 className="users-header">TALK IN CANDY</h1>
        
        <div className="record-icon-container">
          <div className="record-circle">
            <div className="record-icon">
    <FaMicrophone />
</div>
          </div>
        </div>
        
        <p className="shoot-text">SHOOT YOUR SHOT</p>
        
        <form onSubmit={handleSubmit} className="users-form">
          <label className="whatsapp-label">Whatsapp Number</label>
          <input
            type="tel"
            className="whatsapp-input"
            placeholder="Enter WhatsApp number"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            required
          />
          <button type="submit" className="candy-button">
            CANDY IT
          </button>
        </form>
      </div>
    </div>
  );
}

export default Users;
