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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RecoilRoot><Home /></RecoilRoot>} />
        <Route path="*" element={<div>Page not found</div>} />
        <Route path="/tests" element={<RecoilRoot><Tests /></RecoilRoot>} />
        <Route path="/results" element={<RecoilRoot><Results /></RecoilRoot>} />
        <Route path="/signinlab" element={<RecoilRoot><SigninLab /></RecoilRoot>} />
        <Route path="/signuplab" element={<RecoilRoot><SignUpLab /></RecoilRoot>} />
        <Route path="/signupuser" element={<RecoilRoot><SignupPatient /></RecoilRoot>} />
        <Route path="/signinuser" element={<RecoilRoot><SigninPatient /></RecoilRoot>} />
        <Route path="/cart" element={<RecoilRoot><Cart /></RecoilRoot>} />
        <Route path="/labsdashboard" element={<RecoilRoot><Labsdashboard /></RecoilRoot>} />
      </Routes>
    </BrowserRouter>
  );
}