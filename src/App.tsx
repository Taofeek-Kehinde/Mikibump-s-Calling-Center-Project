import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Dashboard from './assets/dashboard.tsx';
// import Admin from './Admin.tsx';
import AdminLogin from './pages/AdminLogin.tsx';
import Form from './pages/Form.tsx';
// import ProtectedRoute from './components/ProtectedRoute.tsx';
import EnhancedChat from './components/EnhancedChat.tsx';
// import { useAppContext } from './context/AppContext';
import type { JSX } from 'react';
import Canyform from './pages/canyform.tsx';

function App(): JSX.Element {
  const [typedText, setTypedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [decorationVisible, setDecorationVisible] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const fullText = '';

  useEffect(() => {
    const startTyping = () => {
      let index = 0;
      const timer = setInterval(() => {
        if (index < fullText.length) {
          setTypedText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setIsTypingComplete(true);
        }
      }, 60);
    };

    const delayTimer = setTimeout(startTyping, 0);

    return () => {
      clearTimeout(delayTimer);
    };
  }, []);

  useEffect(() => {
    if (isTypingComplete) {
      setDecorationVisible(true);
    }
  }, [isTypingComplete]);

  useEffect(() => {
    if (isTypingComplete) {
      // Wait 1 second after typing completes, then show dashboard
      const timer = setTimeout(() => {
        setShowDashboard(true);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [isTypingComplete]);

  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/form" element={<Form />} />
      <Route path="/canyform" element={<Canyform />} />
      <Route path="/chat" element={<EnhancedChat />} />
      <Route path="/" element={
        <div>
          {showDashboard && <Dashboard />}
          {!showDashboard && (
            <div className="app">
              <motion.h1
                className="mikibumps-title"
                initial={{
                  opacity: 0,
                  y: -50,
                  scale: 0.8,
                  rotate: -5
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  rotate: 0
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.6, -0.05, 0.01, 0.99],
                  delay: 0.2
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                TALKIN CANDY
              </motion.h1>

              <motion.div
                className="subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                <p>{typedText}</p>
              </motion.div>

              <motion.div
                className="decoration"
                initial={{ opacity: 0, scale: 0 }}
                animate={decorationVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </motion.div>
            </div>
          )}
        </div>
      } />
    </Routes>
  );
}

export default App;