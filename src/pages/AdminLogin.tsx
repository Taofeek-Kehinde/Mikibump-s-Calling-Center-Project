import { motion } from 'framer-motion';
import { useState } from 'react';
import Admin from '../Admin.tsx';
import './AdminLogin.css';

const ADMIN_PASSWORD = '123';

function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Clear authentication on mount to force login every time
    localStorage.removeItem('admin_authenticated');
    return false;
  });

  const [floatingDots] = useState(() => [...Array(12)].map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: i % 2 === 0 ? '#667eea' : '#764ba2',
    duration: 2 + Math.random() * 2,
    delay: i * 0.2,
  })));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter password');
      return;
    }

    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_authenticated', 'true');
        setIsAuthenticated(true);
      } else {
        setError('Incorrect password');
      }
      setIsLoading(false);
    }, 800);
  };

  if (isAuthenticated) {
    return <Admin />;
  }

  return (
    <div className="admin-login-container">
      <motion.div 
        className="login-box"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="login-header"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <h1 className="login-title">
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              
            </motion.span>
            Admin Access
            <motion.span
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              
            </motion.span>
          </h1>
          <p className="login-subtitle">Restricted Access - Authorized Personnel Only</p>
        </motion.div>

        <motion.form 
          className="login-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="input-group">
            <label className="input-label">Enter Admin Password</label>
            <motion.div 
              className="password-input-wrapper"
              whileFocus={{ scale: 1.02 }}
            >
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="*********"
                className="password-input"
                disabled={isLoading}
              />
              <motion.div 
                className="input-underline"
                initial={{ width: 0 }}
                animate={{ width: "50%" }}
                transition={{ delay: 0.6, duration: 1 }}
              />
            </motion.div>
            
            {error && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                 {error}
              </motion.div>
            )}
          </div>

          <motion.button
            type="submit"
            className="login-button"
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={isLoading ? { opacity: 0.7 } : {}}
          >
            {isLoading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="loading-spinner"
                >
                  
                </motion.span>
                Authenticating...
              </>
            ) : (
              <>
                <span className="button-icon"></span>
                Access Control Panel
              </>
            )}
          </motion.button>

          <motion.div 
            className="security-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="security-icon"></div>
            <p>This area is protected. Unauthorized access is prohibited.</p>
          </motion.div>
        </motion.form>

        <motion.div 
          className="login-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="footer-text">Mikibumps Admin System v1.0</p>
        </motion.div>
      </motion.div>

      {/* Background animation */}
      <div className="background-animation">
        {floatingDots.map((dot, i) => (
          <motion.div
            key={i}
            className="floating-dot"
            style={{
              left: dot.left,
              top: dot.top,
              background: dot.background
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: dot.duration,
              repeat: Infinity,
              delay: dot.delay
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default AdminLogin;