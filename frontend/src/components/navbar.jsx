import { FaFlask, FaClipboardList, FaShoppingCart, FaUser, FaBars, FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import { loggedin } from '../store/atoms/loggedin';
import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logocbs.png';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [isLoggedIn ,setLoggedIn] = useRecoilState(loggedin);
  const navigate = useNavigate();

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

  return (
    <nav className="bg-black px-8 py-4 fixed top-0 w-full z-50">
      <div className="flex items-center justify-between">
        <div className="text-white text-xl font-bold mr-4 hidden md:block" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontFamily: 'Bank Gothic' }}>
          <img src={logo} alt="Logo" className="w-[12rem] " />
        </div>

        <div className="text-white text-xl font-bold mr-4 md:hidden" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontFamily: 'Bank Gothic' }}>
          <img src="./web.png" alt="Logo" className="w-10 " />
        </div>

        {isLoggedIn && <div className="text-white text-xl font-bold mr-4" onClick={() => navigate('/')} style={{ cursor: 'pointer'}}>
          {JSON.parse(localStorage.getItem("type")) == 'lab' ? JSON.parse(localStorage.getItem('lab_name')) : JSON.parse(localStorage.getItem('name'))}
        </div>}

        {/* Search Bar */}
        <div className="w-1/2 mr-4 relative hidden md:block">
          <input
            type="text"
            placeholder="Search for tests..."
            className="w-full px-4 py-2 pr-10 rounded-full bg-gray-800 text-gray-400 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>

        {/* Desktop Menu */}
        { (JSON.parse(localStorage.getItem("type")) != 'lab') && (<span className='-mr-20'><div className="hidden md:flex space-x-4">
          <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={() => navigate('/results')}>
            <FaFlask className="mr-2" />
            Results
          </button>
          <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={() => navigate('/tests')}>
            <FaClipboardList className="mr-2" />
            Tests
          </button>
          <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={() => navigate('/cart')}>
            <FaShoppingCart className="mr-2" />
            Cart
          </button>
          </div>
          </span>)}
        <div className="hidden md:flex space-x-4">
          <button className="bg-transparent text-white rounded-full p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600" onClick={handleSignInClick}>
            <FaUser />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2 hover:bg-gray-700 rounded-lg"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FaBars />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-2 ">
          <button className="w-full flex items-center justify-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={() => navigate('/results')} >
            <FaFlask className="mr-2" />
            Results
          </button>
          <button className="w-full flex items-center justify-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={() => navigate('/tests')} >
            <FaClipboardList className="mr-2" />
            Tests
          </button>
          <button className="w-full flex items-center justify-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={() => navigate('/cart')}>
            <FaShoppingCart className="mr-2" />
            Cart
          </button>
          <button className="w-full flex items-center justify-center bg-transparent text-white rounded-full p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600" onClick={handleSignInClick}>
            <FaUser />
          </button>
        </div>
      )}
      {/* Sign In Popup */}
      {showSignInPopup && (
        <div className="fixed  inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="backdrop-blur-md bg-white/30 p-8 rounded-lg shadow-lg border border-white/20 w-96 h-64">
          {isLoggedIn ? (
              <div className='mt-8'>
                <h2 className="text-2xl font-bold mb-6 text-center text-white">Confirm Logout ?</h2>
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm bg-opacity-80"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div>
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign In as</h2>
            <div className="space-y-4">
              <button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm bg-opacity-80"
                onClick={() => {
                  setShowSignInPopup(false);
                  navigate('/signinlab');
                }}
              >
                LABS
              </button>
              <button 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm bg-opacity-80"
                onClick={() => {
                  setShowSignInPopup(false);
                  navigate('/signinuser');
                }}
              >
                PATIENTS
              </button>
            </div>
          </div>)}
            <button 
              className="absolute top-2 right-2 text-white hover:text-gray-200"
              onClick={() => setShowSignInPopup(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Logout popup */}
      {/* {showSignInPopup && setLoggedIn && (
        <div className="fixed  inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="backdrop-blur-md bg-white/30 p-8 rounded-lg shadow-lg border border-white/20 w-96 h-64">
            <button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 backdrop-blur-sm bg-opacity-80"
            onClick={
              ()=>{
                setLoggedIn(false);
                localStorage.removeItem('token');
                localStorage.removeItem('lab_name');
                localStorage.removeItem('name');
                setShowSignInPopup(false);
                navigate('/');
            }}>
              Logout
            </button>
          </div>
        </div>
      )} */}
    </nav>
  );
}