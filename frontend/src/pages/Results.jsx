import Navbar from '../components/navbar';
import Footer from '../components/footer';

const Results = () => {
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      
      <div className="pt-20 pb-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-white via-gray-300 to-black text-transparent bg-clip-text animate-gradient-x relative mb-12">
            RESULTS
          </h1>
        </div>

        <div className="max-w-6xl mx-auto bg-gray-900 rounded-lg p-6">
          <div className="grid grid-cols-3 gap-4 text-white font-semibold mb-4 text-center">
            <div>Test Name</div>
            <div>Report Link</div> 
            <div>Test Date</div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-gray-300 text-center items-center bg-gray-800 p-4 rounded">
              <div>Liver Function Test</div>
              <div>
                <a href="https://drive.google.com/file/d/1Mgccp4JaQAR0VKQGhjjdxdPb7W9Nwo3R/view?usp=sharing" target="_blank" className="text-blue-400 hover:text-blue-300">View Report</a>
              </div>
              <div>2023-11-15</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-gray-300 text-center items-center bg-gray-800 p-4 rounded">
              <div>Leucocytes Test</div>
              <div>
                <a href="https://drive.google.com/file/d/1AEeJK8IylqJ0_Eq2cVW_bVIvbIeOvg40/view?usp=sharing" target="_blank" className="text-blue-400 hover:text-blue-300">View Report</a>
              </div>
              <div>2023-11-10</div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-gray-300 text-center items-center bg-gray-800 p-4 rounded">
              <div>Complete Haemogram Test</div>
              <div>
                <a href="https://drive.google.com/file/d/1YUdWe27UtC0kSgZrKMNyWL_4hqGcABJn/view?usp=sharing" target="_blank" className="text-blue-400 hover:text-blue-300">View Report</a>
              </div>
              <div>2023-11-05</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Results;
