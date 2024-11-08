import { FaFlask, FaClipboardList, FaShoppingCart, FaUser, FaBars, FaSearch } from 'react-icons/fa';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black px-8 py-4 fixed top-0 w-full z-50">
      <div className="flex items-center justify-between">
        {/* Logo raushan bna rha hai*/}
        <div className="text-white text-xl font-bold mr-4">
          WH 
        </div>

        {/* Search Bar */}
        <div className="w-1/2 mr-4 relative">
          <input
            type="text"
            placeholder="Search for tests..."
            className="w-full px-4 py-2 pr-10 rounded-full bg-gray-800 text-gray-400 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
          />
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4">
          <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <FaFlask className="mr-2" />
            Labs
          </button>
          <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <FaClipboardList className="mr-2" />
            Tests
          </button>
          <button className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <FaShoppingCart className="mr-2" />
            Cart
          </button>
          <button className="bg-transparent text-white rounded-full p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600">
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
        <div className="md:hidden mt-4 space-y-2">
          <button className="w-full flex items-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <FaFlask className="mr-2" />
            Labs
          </button>
          <button className="w-full flex items-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <FaClipboardList className="mr-2" />
            Tests
          </button>
          <button className="w-full flex items-center bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <FaShoppingCart className="mr-2" />
            Cart
          </button>
          <button className="w-full flex items-center justify-center bg-transparent text-white rounded-full p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600">
            <FaUser />
          </button>
        </div>
      )}
    </nav>
  );
}