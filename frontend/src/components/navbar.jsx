import { FaFlask, FaClipboardList, FaShoppingCart, FaUser, FaBars, FaSearch, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { loggedin } from '../store/atoms/loggedin';
import { useRecoilState } from 'recoil';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logocbs.png';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [isLoggedIn, setLoggedIn] = useRecoilState(loggedin);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize login state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, [setLoggedIn]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSignInClick = () => {
    setShowSignInPopup(true);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('lab_name');
    localStorage.removeItem('name');
    localStorage.removeItem('type');
    setShowSignInPopup(false);
    navigate('/');
  };

  const isActiveRoute = (path) => location.pathname === path;

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/95 backdrop-blur-md shadow-2xl border-b border-white/10' 
          : 'bg-black'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div 
                className="cursor-pointer transition-transform duration-200 hover:scale-105"
                onClick={() => navigate('/')}
              >
                <img 
                  src={logo} 
                  alt="Labeasy Logo" 
                  className="h-8 w-auto lg:h-10 hidden sm:block" 
                />
                <img 
                  src="./web.png" 
                  alt="Labeasy Logo" 
                  className="h-8 w-auto sm:hidden" 
                />
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for tests..."
                  className="w-64 px-4 py-2 pl-10 pr-4 rounded-full bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Navigation Links */}
              {JSON.parse(localStorage.getItem("type")) !== 'lab' && (
                <div className="flex items-center space-x-4">
                  <button 
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActiveRoute('/results') 
                        ? 'bg-primary-600 text-white shadow-glow' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => navigate('/results')}
                  >
                    <FaFlask className="mr-2" />
                    Results
                  </button>
                  <button 
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActiveRoute('/tests') 
                        ? 'bg-primary-600 text-white shadow-glow' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => navigate('/tests')}
                  >
                    <FaClipboardList className="mr-2" />
                    Tests
                  </button>
                  <button 
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isActiveRoute('/cart') 
                        ? 'bg-primary-600 text-white shadow-glow' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => navigate('/cart')}
                  >
                    <FaShoppingCart className="mr-2" />
                    Cart
                  </button>
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* User Name Display */}
              {isLoggedIn && (
                <div className="hidden md:block">
                  <div className="text-white text-sm font-medium px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    {JSON.parse(localStorage.getItem("type")) === 'lab' 
                      ? JSON.parse(localStorage.getItem('lab_name')) 
                      : JSON.parse(localStorage.getItem('name'))
                    }
                  </div>
                </div>
              )}
              
              {/* User Button */}
              <button 
                className="p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                onClick={handleSignInClick}
                aria-label="User menu"
              >
                <FaUser className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="py-4 space-y-3 border-t border-white/10">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for tests..."
                  className="w-full px-4 py-3 pl-10 pr-4 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              {/* Mobile Navigation Links */}
              {JSON.parse(localStorage.getItem("type")) !== 'lab' && (
                <div className="space-y-2">
                  <button 
                    className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActiveRoute('/results') 
                        ? 'bg-primary-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => navigate('/results')}
                  >
                    <FaFlask className="mr-3" />
                    Results
                  </button>
                  <button 
                    className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActiveRoute('/tests') 
                        ? 'bg-primary-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => navigate('/tests')}
                  >
                    <FaClipboardList className="mr-3" />
                    Tests
                  </button>
                  <button 
                    className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActiveRoute('/cart') 
                        ? 'bg-primary-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => navigate('/cart')}
                  >
                    <FaShoppingCart className="mr-3" />
                    Cart
                  </button>
                </div>
              )}

              {/* Mobile User Info */}
              {isLoggedIn && (
                <div className="pt-2 border-t border-white/10">
                  <div className="text-white text-sm font-medium px-4 py-2 rounded-lg bg-white/10">
                    {JSON.parse(localStorage.getItem("type")) === 'lab' 
                      ? JSON.parse(localStorage.getItem('lab_name')) 
                      : JSON.parse(localStorage.getItem('name'))
                    }
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sign In Popup */}
      {showSignInPopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 animate-scale-in border border-gray-200">
            <div className="p-8">
              {isLoggedIn ? (
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Confirm Logout?</h2>
                  <p className="text-gray-600 mb-8">Are you sure you want to sign out?</p>
                  <button
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Sign In as</h2>
                  <div className="space-y-4">
                    <button 
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                      onClick={() => {
                        setShowSignInPopup(false);
                        navigate('/signinlab');
                      }}
                    >
                      Laboratory
                    </button>
                    <button 
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 shadow-lg"
                      onClick={() => {
                        setShowSignInPopup(false);
                        navigate('/signinuser');
                      }}
                    >
                      Patient
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
              onClick={() => setShowSignInPopup(false)}
              aria-label="Close popup"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}