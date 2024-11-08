import { useState, useEffect } from 'react';
import Navbar from './navbar';
import Footer from './footer';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || { cartItems: [] };
    setCartItems(cart.cartItems);
    calculateTotal(cart.cartItems);
  };

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + item.price, 0);
    setTotal(sum);
  };

  const removeFromCart = (testId, labId) => {
    const updatedCart = {
      cartItems: cartItems.filter(item => !(item.testId === testId && item.labId === labId))
    };
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart.cartItems);
    calculateTotal(updatedCart.cartItems);
  };

  const handleCheckout = () => {
    // Implement checkout logic here
    alert('Proceeding to checkout...');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="pt-24 pb-8 px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-8 text-center">
            <FaShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-600">Add some tests to your cart to see them here.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-white via-gray-300 to-black text-transparent bg-clip-text mb-8">
            Your Cart
          </h1>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
      <Footer />
    </div>
  );
}

export default Cart;
 