import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { updatePassword } from '../services/auth';
import '../styles/Auth.css';

function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.hash.substring(1));
    if (params.get('type') !== 'recovery') navigate('/login');
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords don't match");
    
    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      setMessage('Password updated! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">New Password 🔑</h2>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdatePassword;