import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle, loginWithMicrosoft, loginWithEmail } from '../services/auth';
import '../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const { error } = await loginWithEmail(email, password);
      if (error) throw error;
      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/');
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back! 🎁</h2>
        
        <form onSubmit={handleEmailLogin}>
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
          
          <button type="submit" className="auth-button">
            Login with Email
          </button>
        </form>
        
        <div className="or-divider">OR</div>

        <div className="social-logins">
          <button onClick={loginWithGoogle} className="social-button google">
            Continue with Google
          </button>
        </div>

        <p className="auth-footer">
          Forgot password? <span onClick={() => navigate('/forgot-password')}>Reset here</span>
          <br />
          New user? <span onClick={() => navigate('/register')}>Create account</span>
        </p>
      </div>
    </div>
  );
}

export default Login;