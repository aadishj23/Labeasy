import { useState, useEffect } from 'react';
import Navbar from './navbar';
import Footer from './footer';
import { loggedin } from '../store/atoms/loggedin';
import { useRecoilValue } from 'recoil';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const isLoggedIn = useRecoilValue(loggedin);
  const [total, setTotal] = useState(0);
  const [showPrecautions, setShowPrecautions] = useState(false);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || { cartItems: [] };
    setCartItems(cart.cartItems);
    calculateTotal(cart.cartItems);
  };

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + Number(item.price), 0);
    setTotal(sum);
  };  

  const removeFromCart = (testId, labId) => {
    const updatedCart = {
      cartItems: cartItems.filter(item => !(item.testId === testId && item.labId === labId))
    };
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart.cartItems);
    calculateTotal(updatedCart.cartItems);
    toast.warning('Item removed from cart!');
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error('Please login to proceed with checkout!');
      return;
    }
    setShowPrecautions(true);
    toast.info('Please review test precautions');
  };

  const confirmCheckout = () => {
    // Clear cart
    localStorage.setItem('cart', JSON.stringify({ cartItems: [] }));
    setCartItems([]);
    setTotal(0);
    setShowPrecautions(false);
    
    toast.success('Booking confirmed! Thank you for your order.');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <div className="pt-[15rem] pb-[15rem] px-8">
          <div className="max-w-6xl mx-auto bg-white rounded-lg p-12 text-center">
            <FaShoppingCart className="w-24 h-24 mx-auto text-gray-400 mb-6" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
            <p className="text-xl text-gray-600">Add some tests to your cart to see them here.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="pt-24 pb-8 px-4">
        <div className=" pt-[15rem] pb-[15rem] max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-white via-gray-300 to-black text-transparent bg-clip-text mb-8">
            Your Cart
          </h1>

          <div className="bg-white  rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              {cartItems.map((item, index) => (
                <div 
                  key={`${item.testId}-${item.labId}`}
                  className={`flex items-center justify-between ${
                    index !== cartItems.length - 1 ? 'border-b border-gray-200 pb-4 mb-4' : ''
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{item.testName}</h3>
                    <p className="text-gray-600">at {item.labName}</p>
                    <p className="text-sm text-gray-500">Report in {item.reportTime}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-lg text-gray-800">₹{item.price}</span>
                    <button
                      onClick={() => removeFromCart(item.testId, item.labId)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                <span className="text-2xl font-bold text-gray-800">₹{total}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPrecautions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Precautions</h2>
            <ul className="list-disc list-inside mb-6 text-gray-600">
              <li>Fast for 1-2 hours before the test</li>
              <li>Avoid alcohol for 24 hours before the test</li>
              <li>Drink plenty of water unless specified otherwise</li>
              <li>Inform about any medications you are taking</li>
            </ul>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Schedule Your Test</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date</label>
                  <input 
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Time</label>
                  <input 
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowPrecautions(false);
                  toast.error('Checkout cancelled');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmCheckout}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Cart;