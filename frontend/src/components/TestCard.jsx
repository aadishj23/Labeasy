import { useState } from 'react';
import PropTypes from 'prop-types';
import labTests from '../data/labTests.json';
import LabDetailsPopup from './LabDetailsPopup';

function TestCard({ testId = 1 }) {
  const [showDetails, setShowDetails] = useState(false);
  const test = labTests.labTests.find(test => test.id === testId);

  return (
    <>
      <div className="bg-gray-100 rounded-lg shadow-lg flex p-4 w-full max-w-lg mx-auto">
        {/* Left Section */}
        <div className="bg-blue-800 text-white p-4 rounded-lg w-2/3 relative">
          <h2 className="text-lg font-bold">{test.name}</h2>
          <p className="mt-2">{test.availableLabs} Labs available</p>
          
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
            {test.discount}
          </div>
          
          <div className="absolute bottom-4 left-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400 opacity-25" viewBox="0 0 24 24" fill="currentColor">
              <path d="M..." />
            </svg>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-start justify-between w-1/3 pl-4">
          <button 
            onClick={() => setShowDetails(true)}
            className="text-blue-500 border border-blue-500 rounded-md py-2 px-4 w-full mb-4 hover:bg-blue-100"
          >
            Lab details
          </button>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M..." />
              </svg>
            </span>
            <p className="text-gray-700 text-sm">{test.testsIncluded} tests included</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M..." />
              </svg>
            </span>
            <p className="text-gray-700 text-sm">Report in {test.reportTime}</p>
          </div>
        </div>
      </div>

      {showDetails && (
        <LabDetailsPopup 
          testId={test.id}
          testName={test.name}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}

TestCard.propTypes = {
  testId: PropTypes.number
};

export default TestCard;
