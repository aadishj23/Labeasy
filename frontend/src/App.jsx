import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tests from './pages/Tests';
import Labs from './pages/Labs';
// import LabsSignin from './pages/SigninLab';
import PatientsSignin from './pages/SigninPatients';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<div>Page not found</div>} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/labs" element={<Labs />} />
        {/* <Route path="/labsSignin" element={<LabsSignin />} /> */}
        <Route path="/patientsSignin" element={<PatientsSignin />} />
      </Routes>
    </BrowserRouter>
  );
}
