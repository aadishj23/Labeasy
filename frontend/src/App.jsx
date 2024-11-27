import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tests from './pages/Tests';
import Results from './pages/Results';
import SigninLab from './pages/SigninLab';
import SignUpLab from './pages/SignUpLab';
import SignupPatient from './pages/SignUpPatients';
import SigninPatient from './pages/SigninPatients';
import Labsdashboard from './pages/labsdashboard';
import Cart from './components/Cart';
import { RecoilRoot } from 'recoil';

export default function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<div>Page not found</div>} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/results" element={<Results />} />
          <Route path="/signinlab" element={<SigninLab />} />
          <Route path="/signuplab" element={<SignUpLab />} />
          <Route path="/signupuser" element={<SignupPatient />} />
          <Route path="/signinuser" element={<SigninPatient />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/labsdashboard" element={<Labsdashboard />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
}