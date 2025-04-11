import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/auth';
import '../styles/Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await resetPassword(email);
      if (error) throw error;
      setMessage('Password reset email sent. Check your inbox!');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password 🔐</h2>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="auth-button">
            Send Reset Link
          </button>
        </form>

        <p className="auth-footer">
          Remember password? <span onClick={() => navigate('/login')}>Login</span>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;