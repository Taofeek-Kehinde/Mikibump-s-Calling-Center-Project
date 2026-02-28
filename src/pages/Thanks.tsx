import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHandPointRight } from 'react-icons/fa';

export default function Thanks() {
  const navigate = useNavigate();

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
      }}>
        LET CANDY DO THE TALKIN
      </p>

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
        }}
      >
        <FaHandPointRight size={24} />
        <span>HOME</span>
      </div>
    </div>
  );
}
