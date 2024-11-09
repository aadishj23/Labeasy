import Navbar from '../components/navbar';
import Footer from '../components/footer';
import TestCard from '../components/TestCard';
const Tests = () => {
  return (
    <div className="bg-black">
      <Navbar />
      <div className="pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center bg-gradient-to-r from-white via-gray-300 to-black text-transparent bg-clip-text animate-gradient-x relative mb-8 sm:mb-10 md:mb-12 px-4" >
          TESTS
        </h1>
        <div className="max-w-[90rem] pt-[4rem] pb-[10rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
            <TestCard testId={1} />
            <TestCard testId={2} />
            <TestCard testId={3} />
            <TestCard testId={4} />
            <TestCard testId={5} />
            <TestCard testId={6} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Tests
