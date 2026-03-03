// import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaHandPointRight, FaQrcode } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';

export default function Thanks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const submissionId = searchParams.get('id');

  // Download QR code function
  const downloadQR = () => {
    const canvas = document.getElementById("thanks-qr-canvas") as HTMLCanvasElement;
    if (canvas) {
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `TalkinCandy-${submissionId}.png`;
      link.click();
    }
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
        marginBottom: '30px',
      }}>
        LET CANDY DO THE TALKIN
      </p>

      {/* Show QR Code if we have a submission ID */}
      {submissionId && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        }}>
          <QRCodeCanvas 
            id="thanks-qr-canvas" 
            value={`${window.location.origin}/adminform/${submissionId}`} 
            size={200} 
          />
          <p style={{
            marginTop: '10px',
            color: '#333',
            fontWeight: 'bold',
          }}>
            ID: {submissionId}
          </p>
        </div>
      )}

      {/* Download QR Button */}
      {submissionId && (
        <button
          onClick={downloadQR}
          style={{
            background: '#FF0000',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          }}
        >
          <FaQrcode />
          Download QR Code
        </button>
      )}

      <p style={{
        fontSize: '1rem',
        color: '#333',
        textAlign: 'center',
        maxWidth: '300px',
        marginBottom: '20px',
      }}>
        Print your QR code and stick it on your product, flyer, gift, or anywhere!
      </p>

      <div className='any-btns'
        onClick={() => navigate('/')}
       
      >
        <FaHandPointRight size={24} />
        <span>HOME</span>
      </div>
    </div>
  );
}
