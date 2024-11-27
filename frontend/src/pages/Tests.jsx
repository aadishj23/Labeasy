import Navbar from '../components/navbar';
import Footer from '../components/footer';
import TestCard from '../components/TestCard';
import axios from 'axios';
import { useEffect, useState } from 'react';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getTestsData = async () => {
    try {
      const response = await axios({
        url: `${import.meta.env.VITE_BACKEND_URL}/api/v1/tests/gettests`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      });
      setTests(response.data.tests);
      setLoading(false);
    } catch (error) {
      setError('Failed to load tests. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    getTestsData();
  }, []);

  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <div className="pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center bg-gradient-to-r from-white via-gray-300 to-black text-transparent bg-clip-text animate-gradient-x relative mb-8 sm:mb-10 md:mb-12 px-4" >
          TESTS
        </h1>
        <div className="max-w-[90rem] pt-[4rem] pb-[10rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
            {loading && <p className="text-center text-white">Loading tests...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            {tests.length === 0 && !loading && !error && (
              <p className="text-center text-white">No tests available.</p>
            )}
            {tests.map((test) => (
              <TestCard key={test.id} name={test.test_name} testId={test.id} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Tests;