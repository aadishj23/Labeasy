import { useState } from 'react';
import PropTypes from 'prop-types';
import labsOffering from '../data/labsOffering.json';
import { FaStar, FaTimes, FaShoppingCart } from 'react-icons/fa';

function LabDetailsPopup({ testId, testName, onClose }) {
  const [selectedLab, setSelectedLab] = useState(null);
  const labsList = labsOffering.testOfferings[testId] || [];

  const handleAddToCart = (lab) => {
    const cartItem = {
      testId,
      testName,
      labId: lab.labId,
      labName: lab.labName,
      price: lab.price,
      reportTime: lab.reportTime
    };

    const existingCart = JSON.parse(localStorage.getItem('cart')) || { cartItems: [] };
    if (!existingCart.cartItems.some(item => item.testId === testId && item.labId === lab.labId)) {
      existingCart.cartItems.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(existingCart));
      setSelectedLab(lab.labId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-4">{testName}</h2>
        <p className="text-gray-600 mb-6">Compare prices from different labs</p>

        <div className="space-y-4">
          {labsList.map((lab) => (
            <div key={lab.labId} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{lab.labName}</h3>
                  <p className="text-gray-600 text-sm">{lab.location}</p>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center bg-green-100 px-2 py-1 rounded">
                      <span className="text-green-700 font-bold mr-1">{lab.rating}</span>
                      <FaStar className="text-green-700 w-4 h-4" />
                    </div>
                    <span className="text-gray-500 text-sm ml-2">({lab.reviewCount} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">₹{0.8*lab.originalPrice}</div>
                  <div className="text-gray-500 line-through text-sm">₹{lab.originalPrice}</div>
                  <div className="text-green-600 text-sm font-semibold">20% off</div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-gray-600">
                  <span className="font-semibold">Report in:</span> {lab.reportTime}
                </div>
                <button
                  onClick={() => handleAddToCart(lab)}
                  disabled={selectedLab === lab.labId}
                  className={`flex items-center px-4 py-2 rounded ${
                    selectedLab === lab.labId
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white`}
                >
                  <FaShoppingCart className="mr-2" />
                  {selectedLab === lab.labId ? 'Added to Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

LabDetailsPopup.propTypes = {
  testId: PropTypes.number.isRequired,
  testName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

export default LabDetailsPopup; 