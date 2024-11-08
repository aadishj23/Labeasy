import Navbar from '../components/navbar';

const patientsSignin = () => {
  return (
    <div>
        <Navbar />
      <div>
            <script type="module" src="https://unpkg.com/@splinetool/viewer/build/spline-viewer.js"></script>
            <spline-viewer url="https://prod.spline.design/fJ2ptJKzT-sDkpfO/scene.splinecode" background="rgba(218,81,221,0.2)"></spline-viewer>
      </div>
    </div>
  )
}

export default patientsSignin
