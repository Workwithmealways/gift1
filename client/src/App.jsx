import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { LogOut, Gift } from 'lucide-react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import { supabase } from './services/supabaseClient';
import ProtectedRoute from './components/ProtectedRoute';
import { quotes } from './Data/quotations';

const giftImages = [
  'https://5.imimg.com/data5/SELLER/Default/2023/12/372722042/ES/OP/GC/160934096/whatsapp-image-2023-12-29-at-11-38-37-am-500x500.jpg',
  'https://i.etsystatic.com/28114023/r/il/02bc71/3919092198/il_fullxfull.3919092198_l5i6.jpg',
  'https://www.kolkataonlineflorists.com/images/CMC5361-VA-OMF_big.webp',
  'https://m.media-amazon.com/images/I/71Ti9szZ9SL.jpg',
];

function App() {
  const [formData, setFormData] = useState({
    name: '',
    interests: '',
    personality: '',
    occasion: '',
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isGuest, setIsGuest] = useState(true);
  const sidebarRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Fix: Handle Supabase OAuth redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token') || hash.includes('error_description')) {
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          window.history.replaceState(null, '', '/#/'); // Clean the hash
          navigate('/');
        }
      }, 100);
    }
  }, [navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsGuest(!session?.user);
      if (event === 'SIGNED_IN') navigate('/');
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const words = quotes[currentQuoteIndex].split(' ');
    if (currentWordIndex < words.length) {
      const timer = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      const quoteTimer = setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        setCurrentWordIndex(0);
      }, 3000);
      return () => clearTimeout(quoteTimer);
    }
  }, [currentWordIndex, currentQuoteIndex]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % giftImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTooltip((prev) => !prev);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getDailyCount = () => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('guestSuggestions');
    return stored ? (JSON.parse(stored).date === today ? JSON.parse(stored) : { count: 0, date: today }) : { count: 0, date: today };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const daily = getDailyCount();

    if (isGuest && daily.count >= 5) {
      alert('Please log in to get more suggestions.');
      navigate('/login');
      return;
    }

    try {
      setShowForm(false);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/suggestions`, formData);

      const filledSuggestions = [...res.data];
      while (filledSuggestions.length < 5) {
        filledSuggestions.push({
          name: "Custom Gift Idea",
          site: 'Amazon',
          price: Math.floor(Math.random() * 5000) + 500
        });
      }

      setSuggestions(filledSuggestions.slice(0, 5));

      if (isGuest) {
        localStorage.setItem('guestSuggestions', JSON.stringify({
          date: daily.date,
          count: daily.count + 1
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
      setShowForm(false);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_URL}/api/health`);
      } catch (error) {
        alert('Backend server is offline. Please try again later.');
      }
    };
    checkBackend();
  }, []);

  const displayedQuote = quotes[currentQuoteIndex]
    .split(' ')
    .slice(0, currentWordIndex)
    .join(' ');

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <div className={`app-container ${showSidebar ? 'shift' : ''}`}>
            <header className="header">
              <button 
                className="toggle-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSidebar(!showSidebar);
                }}
              >
                ☰
              </button>
              <div className="header-center">
                <h1 className="header-title">Gift Recommendation Platform</h1>
              </div>
              <LogOut 
                className="logout-icon" 
                onClick={() => supabase.auth.signOut()}
              />
            </header>

            <div className={`sidebar ${showSidebar ? 'open' : ''}`} ref={sidebarRef}>
              <ul>
                <li>Home</li>
                <li>Settings</li>
                <li>Profile</li>
              </ul>
            </div>

            <div className="main-content-section">
              <div className="slider-section">
                <img src={giftImages[currentImage]} alt="gift" className="slider-image" />
              </div>

              <div className="quote-container">
                <p className="animated-quote">"{displayedQuote}"</p>
              </div>

              <div 
                className="suggestion-toggle" 
                onClick={() => {
                  setShowForm(true);
                  setSuggestions([]);
                }}>
                {showTooltip && <div className="tooltip">👉 For more suggestions, click here!</div>}
                <Gift size={36} />
              </div>

              {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-xl font-semibold mb-4 text-center">Get Gift Suggestions</h2>
                    <form onSubmit={handleSubmit}>
                      {['name', 'interests', 'personality', 'occasion'].map((field) => (
                        <div className="mb-4" key={field}>
                          <label className="block text-gray-700 mb-2 capitalize">{field}</label>
                          <input
                            type="text"
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-pink-300 rounded"
                          />
                        </div>
                      ))}
                      <div className="flex justify-between mt-6">
                        <button 
                          type="submit" 
                          className="bg-pink-500 text-black px-4 py-2 rounded hover:bg-pink-600"
                        >
                          Get Suggestions
                        </button>
                        <button 
                          type="button" 
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                          onClick={() => setShowForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {suggestions.length > 0 && (
              <div className="suggestions-section" ref={suggestionsRef}>
                <h2 className="suggestions-title">Suggested Gifts for {formData.name}</h2>
                <div className="suggestions-grid">
                  {suggestions.map((gift, index) => (
                    <div key={`${gift.name}-${index}`} className="gift-card">
                      <h3>{gift.name}</h3>
                      <p className="price">₹{gift.price}</p>
                      <a 
                        href={`https://www.${gift.site.toLowerCase()}.com/search?q=${encodeURIComponent(gift.name)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="buy-link"
                      >
                        Buy on {gift.site}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <footer className="footer">
              <p>&copy; 2025 Gift Platform. All rights reserved.</p>
            </footer>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
    </Routes>
  );
}

export default App;
