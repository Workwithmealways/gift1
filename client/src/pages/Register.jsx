import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerWithEmail } from '../services/auth';
import '../styles/Auth.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Passwords don't match!");

    try {
      await registerWithEmail(email, password);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account 🎉</h2>
        
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
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
            Create Account
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <span onClick={() => navigate('/login')}>Login here</span>
        </p>
      </div>
    </div>
  );
}

export default Register;