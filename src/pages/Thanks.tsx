import { useNavigate, useLocation } from 'react-router-dom';
import { FaHandPointRight, FaWhatsapp, FaLink } from 'react-icons/fa';

export default function Thanks() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get submission data from location state
  const submissionData = location.state?.submissionData || {};
  const whatsappNumber = submissionData.whatsappNumber || '';
  const customUrl = submissionData.link || '';

  const getWhatsAppMessage = () => {
    return encodeURIComponent("Hi, I scanned your QR.");
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFD700',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      position: 'relative',
    }}>
      <h1 style={{
        fontSize: '3rem',
        color: '#00AA00',
        marginBottom: '20px',
        fontFamily: 'Dancing Script, cursive',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      }}>
        Thank You
      </h1>
      
      <p style={{
        fontSize: '1.8rem',
        color: '#FFFFFF',
        fontFamily: 'Dancing Script, cursive',
        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
        marginBottom: '50px',
      }}>
        LET CANDY DO THE TALKIN
      </p>

      {/* Buttons Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '100%',
        maxWidth: '300px',
        marginBottom: '30px',
      }}>
        {/* CHAT WITH ME Button */}
        {whatsappNumber && (
          <button
            onClick={() =>
              window.open(
                `https://wa.me/${whatsappNumber}?text=${getWhatsAppMessage()}`,
                "_blank"
              )
            }
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              border: 'none',
              background: '#25D366',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
            }}
          >
            <FaWhatsapp size={20} />
            CHAT WITH ME
          </button>
        )}

        {/* CHECK ME OUT Button - Only show if URL exists */}
        {customUrl && (
          <button
            onClick={() => window.open(customUrl, "_blank")}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '12px',
              border: 'none',
              background: '#333333',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
            }}
          >
            <FaLink size={20} />
            CHECK ME OUT
          </button>
        )}
      </div>

      <div 
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#FF0000',
          padding: '10px 20px',
          borderRadius: '25px',
          cursor: 'pointer',
          color: 'white',
          fontWeight: 'bold',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <FaHandPointRight size={24} />
        <span>HOME</span>
      </div>

      {/* Global Footer */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        textAlign: 'center',
        color: '#333',
        fontWeight: 'bold',
        fontSize: '14px',
      }}>
        ©️ MIKI +2349033666403
      </div>
    </div>
  );
}
