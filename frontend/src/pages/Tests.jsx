import Navbar from '../components/navbar';
import Footer from '../components/footer';
import LabCard from '../components/LabCard';
const Tests = () => {
  return (
    <div className="bg-black">
      <Navbar />
      <div className="pt-24 pb-8">
        <h1 className="text-6xl font-bold text-center bg-gradient-to-r from-white via-gray-300 to-black text-transparent bg-clip-text animate-gradient-x relative mb-12" >
          TESTS
        </h1>
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <LabCard testId={1} />
              <LabCard testId={2} />
              <LabCard testId={3} />
            </div>
            <div className="space-y-8">
              <LabCard testId={4} />
              <LabCard testId={5} />
              <LabCard testId={6} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Tests
