import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import logo from '../assets/logocbs.png';
import { useNavigate } from 'react-router-dom';


const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-black text-white py-10 border-t border-white">
      <div className="container mx-auto flex flex-col space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start space-y-8 md:space-y-0 md:space-x-8">
          {/* Left Section */}
          <div className="flex flex-col items-center md:items-start">
          <div className="text-white text-xl font-bold mr-4" onClick={() => navigate('/')} style={{ cursor: 'pointer', fontFamily: 'Bank Gothic' }}>
          <img src={logo} alt="Logo" className="w-[12rem] " />
        </div>
            <div className="flex space-x-4 mt-4">
              <FaInstagram className="text-white text-2xl cursor-pointer hover:text-gray-400" />
              <FaFacebook className="text-white text-2xl cursor-pointer hover:text-gray-400" />
              <FaTwitter className="text-white text-2xl cursor-pointer hover:text-gray-400" />
              <FaLinkedin className="text-white text-2xl cursor-pointer hover:text-gray-400" />
            </div>
          </div>

          {/* Center Section */}
          <div className="flex justify-center space-x-16 text-sm">
            <div>
              <h2 className="font-semibold mb-2">Company</h2>
              <ul className="space-y-1">
                <li><a href="#" className="hover:underline">About</a></li>
                <li><a href="#" className="hover:underline">Career</a></li>
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">Contact us</a></li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold mb-2">Partners</h2>
              <ul className="space-y-1">
                <li><a href="#" className="hover:underline">Labs</a></li>
                <li><a href="#" className="hover:underline">Doctors</a></li>
              </ul>
            </div>
            <div>
              <h2 className="font-semibold mb-2">Cities</h2>
              <ul className="space-y-1">
                <li><a href="#" className="hover:underline">Delhi</a></li>
                <li><a href="#" className="hover:underline">Gurgaon</a></li>
                <li><a href="#" className="hover:underline">Noida</a></li>
                <li><a href="#" className="hover:underline">Bangalore</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-400">
              © 2023 xyz Pvt. Ltd. All rights reserved
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0 text-xs text-gray-400">
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
